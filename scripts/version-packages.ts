import fs from 'node:fs';
import path from 'node:path';

type Command = 'check' | 'set' | 'bump';
type BumpType = 'major' | 'minor' | 'patch';

interface CliOptions {
  command: Command;
  commandArg?: string;
  apply: boolean;
  json: boolean;
  filter?: string;
}

interface PackageEntry {
  name: string;
  version: string;
  packageJsonPath: string;
  relativePath: string;
}

interface PackageChange extends PackageEntry {
  nextVersion: string;
  changed: boolean;
}

const workspaceRoot = process.cwd();
const workspaceFilePath = path.join(workspaceRoot, 'pnpm-workspace.yaml');
const rootPackageJsonPath = path.join(workspaceRoot, 'package.json');

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv: string[]): CliOptions {
  const [rawCommand, rawCommandArg, ...rest] = argv;
  if (!rawCommand) {
    fail('Usage: version-packages <check|set|bump> [arg] [--apply] [--json] [--filter <pattern>]');
  }

  if (!['check', 'set', 'bump'].includes(rawCommand)) {
    fail(`Unknown command: ${rawCommand}`);
  }

  const command = rawCommand as Command;
  const options: CliOptions = {
    command,
    commandArg: rawCommandArg,
    apply: false,
    json: false,
  };

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === '--apply') {
      options.apply = true;
      continue;
    }
    if (token === '--json') {
      options.json = true;
      continue;
    }
    if (token === '--filter') {
      const pattern = rest[i + 1];
      if (!pattern) {
        fail('Missing value for --filter');
      }
      options.filter = pattern;
      i += 1;
      continue;
    }
    fail(`Unknown option: ${token}`);
  }

  if (command === 'set') {
    if (!options.commandArg) {
      fail('Usage: version-packages set <version> [--apply] [--json] [--filter <pattern>]');
    }
    assertSemver(options.commandArg);
  }

  if (command === 'bump') {
    if (!options.commandArg || !['major', 'minor', 'patch'].includes(options.commandArg)) {
      fail('Usage: version-packages bump <major|minor|patch> [--apply] [--json] [--filter <pattern>]');
    }
  }

  return options;
}

function assertSemver(value: string): void {
  // Accepts simple semver (optionally with pre-release/build metadata).
  const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  if (!semverPattern.test(value)) {
    fail(`Invalid version: ${value}`);
  }
}

function readWorkspacePatterns(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    fail(`pnpm-workspace.yaml not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');
  const patterns: string[] = [];
  let inPackages = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    if (!inPackages && trimmed === 'packages:') {
      inPackages = true;
      continue;
    }
    if (!inPackages) {
      continue;
    }
    if (!trimmed.startsWith('-')) {
      break;
    }
    const value = trimmed.replace(/^-+\s*/, '').replace(/^['"]|['"]$/g, '');
    if (value) {
      patterns.push(value);
    }
  }

  return patterns;
}

function expandPattern(pattern: string): string[] {
  if (!pattern.endsWith('/*')) {
    const resolved = path.join(workspaceRoot, pattern);
    return fs.existsSync(resolved) ? [resolved] : [];
  }

  const parent = path.join(workspaceRoot, pattern.slice(0, -2));
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(parent, dirent.name));
}

function toPackageEntry(packageJsonPath: string): PackageEntry {
  const raw = fs.readFileSync(packageJsonPath, 'utf-8');
  const parsed = JSON.parse(raw) as { name?: string; version?: string };
  if (!parsed.name || !parsed.version) {
    fail(`Missing name/version in ${packageJsonPath}`);
  }
  assertSemver(parsed.version);

  return {
    name: parsed.name,
    version: parsed.version,
    packageJsonPath,
    relativePath: path.relative(workspaceRoot, packageJsonPath),
  };
}

function compareByRootThenPath(a: Pick<PackageEntry, 'relativePath'>, b: Pick<PackageEntry, 'relativePath'>): number {
  const aIsRoot = a.relativePath === 'package.json';
  const bIsRoot = b.relativePath === 'package.json';
  if (aIsRoot && !bIsRoot) return -1;
  if (!aIsRoot && bIsRoot) return 1;
  return a.relativePath.localeCompare(b.relativePath);
}

function collectPackages(filter?: string): PackageEntry[] {
  const patterns = readWorkspacePatterns(workspaceFilePath);
  const packageJsonPaths = new Set<string>();
  packageJsonPaths.add(rootPackageJsonPath);

  for (const pattern of patterns) {
    for (const dirPath of expandPattern(pattern)) {
      const packageJsonPath = path.join(dirPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJsonPaths.add(packageJsonPath);
      }
    }
  }

  let entries = Array.from(packageJsonPaths)
    .map((packageJsonPath) => toPackageEntry(packageJsonPath))
    .sort(compareByRootThenPath);

  if (filter) {
    entries = entries.filter((entry) => entry.name.includes(filter) || entry.relativePath.includes(filter));
  }

  return entries;
}

function bumpVersion(version: string, bumpType: BumpType): string {
  const [majorRaw, minorRaw, patchRaw] = version.split('.');
  const major = Number.parseInt(majorRaw, 10);
  const minor = Number.parseInt(minorRaw, 10);
  const patch = Number.parseInt(patchRaw, 10);

  if ([major, minor, patch].some((v) => Number.isNaN(v))) {
    fail(`Cannot bump non-numeric version: ${version}`);
  }

  if (bumpType === 'major') return `${major + 1}.0.0`;
  if (bumpType === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function writeVersion(packageJsonPath: string, nextVersion: string): void {
  const raw = fs.readFileSync(packageJsonPath, 'utf-8');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  parsed.version = nextVersion;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8');
}

function padCell(value: string, width: number): string {
  if (value.length >= width) return value;
  return `${value}${' '.repeat(width - value.length)}`;
}

function buildTableRows(entries: Array<Pick<PackageEntry, 'version' | 'name' | 'relativePath'>>): string[] {
  const headers = { version: 'Version', name: 'Package', path: 'Path' };
  const versionWidth = Math.max(headers.version.length, ...entries.map((entry) => entry.version.length));
  const nameWidth = Math.max(headers.name.length, ...entries.map((entry) => entry.name.length));

  const rows: string[] = [];
  rows.push(`${padCell(headers.version, versionWidth)}  ${padCell(headers.name, nameWidth)}  ${headers.path}`);
  rows.push(`${'-'.repeat(versionWidth)}  ${'-'.repeat(nameWidth)}  ${'-'.repeat(headers.path.length)}`);
  for (const entry of entries) {
    rows.push(`${padCell(entry.version, versionWidth)}  ${padCell(entry.name, nameWidth)}  ${entry.relativePath}`);
  }
  return rows;
}

function printCheck(entries: PackageEntry[], asJson: boolean): void {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(entries, null, 2)}\n`);
    return;
  }

  const rows = buildTableRows(entries);
  for (const row of rows) {
    process.stdout.write(`${row}\n`);
  }
  process.stdout.write(`Total: ${entries.length}\n`);
}

function printChanges(changes: PackageChange[], asJson: boolean, apply: boolean): void {
  if (asJson) {
    process.stdout.write(`${JSON.stringify({ mode: apply ? 'apply' : 'dry-run', changes }, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${apply ? 'Apply mode' : 'Dry-run mode'}\n`);
  const headers = {
    version: 'Version',
    name: 'Package',
    path: 'Path',
    result: 'Result',
  };
  const versionTransitions = changes.map((change) => `${change.version} -> ${change.nextVersion}`);
  const versionWidth = Math.max(headers.version.length, ...versionTransitions.map((value) => value.length));
  const nameWidth = Math.max(headers.name.length, ...changes.map((change) => change.name.length));
  const pathWidth = Math.max(headers.path.length, ...changes.map((change) => change.relativePath.length));
  const resultWidth = Math.max(
    headers.result.length,
    ...changes.map((change) => (change.changed ? 'CHANGED' : 'SKIPPED').length)
  );

  process.stdout.write(
    `${padCell(headers.version, versionWidth)}  ${padCell(headers.name, nameWidth)}  ${padCell(headers.path, pathWidth)}  ${padCell(headers.result, resultWidth)}\n`
  );
  process.stdout.write(
    `${'-'.repeat(versionWidth)}  ${'-'.repeat(nameWidth)}  ${'-'.repeat(pathWidth)}  ${'-'.repeat(resultWidth)}\n`
  );
  for (const change of changes) {
    const marker = change.changed ? 'CHANGED' : 'SKIPPED';
    process.stdout.write(
      `${padCell(`${change.version} -> ${change.nextVersion}`, versionWidth)}  ${padCell(change.name, nameWidth)}  ${padCell(change.relativePath, pathWidth)}  ${padCell(marker, resultWidth)}\n`
    );
  }
  process.stdout.write(`Total: ${changes.length}\n`);
}

function assertUniformVersionForBulkUpdate(entries: PackageEntry[], filter?: string): void {
  if (filter) {
    return;
  }

  const versions = Array.from(new Set(entries.map((entry) => entry.version)));
  if (versions.length <= 1) {
    return;
  }

  const details = versions
    .sort()
    .map((version) => {
      const names = entries
        .filter((entry) => entry.version === version)
        .map((entry) => entry.name)
        .join(', ');
      return `- ${version}: ${names}`;
    })
    .join('\n');

  fail(
    `Bulk update without --filter requires all package versions to match.\nCurrent versions:\n${details}\nUse --filter to target specific packages.`
  );
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const entries = collectPackages(options.filter);

  if (entries.length === 0) {
    process.stdout.write('No package.json matched.\n');
    return;
  }

  if (options.command === 'check') {
    printCheck(entries, options.json);
    return;
  }

  assertUniformVersionForBulkUpdate(entries, options.filter);

  const changes: PackageChange[] = entries.map((entry) => {
    const nextVersion =
      options.command === 'set'
        ? (options.commandArg as string)
        : bumpVersion(entry.version, options.commandArg as BumpType);
    return {
      ...entry,
      nextVersion,
      changed: nextVersion !== entry.version,
    };
  });

  if (options.apply) {
    for (const change of changes) {
      if (change.changed) {
        writeVersion(change.packageJsonPath, change.nextVersion);
      }
    }
  }

  printChanges(changes, options.json, options.apply);
}

run();

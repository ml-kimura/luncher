import { spawnSync } from 'node:child_process';
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
  strict?: boolean;
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

/** Top-level dirs under docs/specs/docs that hold versioned content (exclude .vitepress, public, [locale], etc.). */
const SPECS_DOCS_LOCALES = ['ja', 'en'] as const;

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv: string[]): CliOptions {
  const [rawCommand, rawCommandArg, ...rest] = argv;
  if (!rawCommand) {
    fail('Usage: version-packages <check|set|bump> [arg] [--apply] [--json] [--strict] [--filter <pattern>]');
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
    strict: false,
  };

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === '--apply') {
      options.apply = true;
      continue;
    }
    if (token === '--strict') {
      options.strict = true;
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

function assertWorkspaceVersionsUniform(entries: PackageEntry[]): void {
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

  fail(`Workspace package versions must match.\nCurrent versions:\n${details}`);
}

function assertUniformVersionForBulkUpdate(entries: PackageEntry[], filter?: string): void {
  if (filter) {
    return;
  }

  assertWorkspaceVersionsUniform(entries);
}

/**
 * Match normal `touch`/`mkdir` defaults for this process (files 644, dirs 755 under typical umask).
 * Set in the shell as `umask 022` for the same effect across all tools.
 */
function withStandardUmask<T>(fn: () => T): T {
  const previous = process.umask(0o022);
  try {
    return fn();
  } finally {
    process.umask(previous);
  }
}

/**
 * Recursive directory copy. On POSIX uses `cp -rf` (same as manual `cp -rf` in the shell), not
 * `cp -a` / `fs.cpSync`, to avoid bad permission bits on some DevContainer bind mounts.
 */
function copyDirectoryRecursive(src: string, dst: string): void {
  const result = spawnSync('cp', ['-rf', src, dst], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    fail(`cp -rf failed (exit ${result.status ?? 'unknown'}): ${src} -> ${dst}`);
  }
}

function copySpecsDocsVersionDirectories(oldVersion: string, nextVersion: string): void {
  const specsDocsRoot = path.join(workspaceRoot, 'docs/specs/docs');
  if (!fs.existsSync(specsDocsRoot)) {
    fail(`Missing specs docs root: ${specsDocsRoot}`);
  }

  const resolveDocsSourceVersion = (): string => {
    const allVersionCandidates = new Set<string>();
    for (const locale of SPECS_DOCS_LOCALES) {
      const localeDir = path.join(specsDocsRoot, locale);
      if (!fs.existsSync(localeDir) || !fs.statSync(localeDir).isDirectory()) {
        continue;
      }
      for (const name of fs.readdirSync(localeDir)) {
        const candidatePath = path.join(localeDir, name);
        if (!fs.statSync(candidatePath).isDirectory()) {
          continue;
        }
        if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(name)) {
          allVersionCandidates.add(name);
        }
      }
    }
    if (allVersionCandidates.size === 0) {
      fail(`No docs/specs/docs/<locale>/<version> directories found under ${specsDocsRoot}`);
    }

    if (allVersionCandidates.has(oldVersion)) {
      return oldVersion;
    }

    const sorted = Array.from(allVersionCandidates).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    const fallback = sorted[sorted.length - 1];
    process.stderr.write(
      `version-packages: docs source version ${oldVersion} not found; using latest existing docs version ${fallback}\n`
    );
    return fallback;
  };

  const docsSourceVersion = resolveDocsSourceVersion();
  let copied = 0;

  for (const locale of SPECS_DOCS_LOCALES) {
    const src = path.join(specsDocsRoot, locale, docsSourceVersion);
    const dst = path.join(specsDocsRoot, locale, nextVersion);
    if (!fs.existsSync(src)) {
      process.stderr.write(`version-packages: skip missing ${src}\n`);
      continue;
    }
    if (fs.existsSync(dst)) {
      process.stderr.write(`version-packages: replacing existing destination ${dst}\n`);
      try {
        fs.rmSync(dst, { recursive: true, force: true });
      } catch {
        const chmodResult = spawnSync('chmod', ['-R', 'u+rwx', dst], { stdio: 'pipe' });
        if (chmodResult.status !== 0) {
          process.stderr.write(`version-packages: chmod before rm exited ${chmodResult.status}\n`);
        }
        fs.rmSync(dst, { recursive: true, force: true });
      }
    }
    withStandardUmask(() => {
      copyDirectoryRecursive(src, dst);
    });
    copied += 1;
  }

  if (copied === 0) {
    fail(`No docs/specs/docs/<locale>/${docsSourceVersion} directories found to copy.`);
  }

  process.stdout.write(`Copied specs docs for ${copied} locale(s): ${docsSourceVersion} -> ${nextVersion}\n`);
}

function runVersionCheckStrict(): void {
  const result = spawnSync('pnpm', ['exec', 'tsx', 'scripts/version-packages.ts', 'check', '--strict'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    fail(`version:check spawn failed: ${String(result.error)}`);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === 'bump') {
    runVersionCheckStrict();
  }

  const entries = collectPackages(options.filter);

  if (entries.length === 0) {
    process.stdout.write('No package.json matched.\n');
    return;
  }

  if (options.command === 'check') {
    printCheck(entries, options.json);
    if (options.strict) {
      assertWorkspaceVersionsUniform(entries);
    }
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

  if (options.command === 'bump' && options.apply && !options.filter) {
    const oldVersion = changes[0].version;
    const nextVersion = changes[0].nextVersion;
    copySpecsDocsVersionDirectories(oldVersion, nextVersion);

    const copyArtifactsResult = spawnSync('pnpm', ['copy:artifacts', '--version', oldVersion], {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });

    if (copyArtifactsResult.status !== 0) {
      fail(`pnpm copy:artifacts failed (exit ${copyArtifactsResult.status ?? 'unknown'})`);
    }
  }

  if (options.command === 'bump' && !options.apply && !options.filter) {
    process.stdout.write(
      `Would copy docs/specs/docs/<locale>/${changes[0].version} -> docs/specs/docs/<locale>/${changes[0].nextVersion}\n`
    );
    process.stdout.write(`Would run: pnpm copy:artifacts --version ${changes[0].version}\n`);
  }

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

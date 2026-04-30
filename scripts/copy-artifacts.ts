import { spawnSync } from 'node:child_process';

function resolveVersionArg(argv: string[]): string {
  const equalsStyle = argv.find((arg) => arg.startsWith('--version='))?.split('=')[1];
  if (equalsStyle) {
    return equalsStyle;
  }

  const flagIndex = argv.findIndex((arg) => arg === '--version');
  if (flagIndex >= 0) {
    const value = argv[flagIndex + 1];
    if (value && !value.startsWith('--')) {
      return value;
    }
  }

  return '1.0.0';
}

const version = resolveVersionArg(process.argv);

const appArtifactsResult = spawnSync(
  'pnpm',
  [
    'turbo',
    'run',
    'copy:artifacts',
    '--ui',
    'stream',
    '--filter=api',
    '--filter=batch',
    '--filter=web',
    '--',
    `--version=${version}`,
  ],
  {
    stdio: 'inherit',
  }
);

if (appArtifactsResult.status !== 0) {
  process.exit(appArtifactsResult.status ?? 1);
}

const specsArtifactsResult = spawnSync('pnpm', ['--filter', '@docs/specs', 'copy:artifacts', `--version=${version}`], {
  stdio: 'inherit',
});

if (specsArtifactsResult.status !== 0) {
  process.exit(specsArtifactsResult.status ?? 1);
}

process.stdout.write(`copy:artifacts completed (version=${version})\n`);

import { isJobName, JOB_NAMES, runJob } from "./jobs/index.js";

const parseArgValue = (key: string): string | undefined => {
  const target = `--${key}=`;
  const arg = process.argv.find((v) => v.startsWith(target));
  if (!arg) return undefined;
  return arg.slice(target.length);
};

const main = async () => {
  const job = parseArgValue("job");
  const lunchDate = parseArgValue("lunchDate");

  if (!job || !isJobName(job)) {
    throw new Error(`--job is required. supported=${JOB_NAMES.join(",")}`);
  }

  const result = await runJob(job, { lunchDate });
  process.stdout.write(`${JSON.stringify({ job, ...result })}\n`);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : "unknown_error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

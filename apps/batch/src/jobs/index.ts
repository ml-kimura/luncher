import { postDailyLunchAnnouncement } from './postDailyLunchAnnouncement.js';

export const JOB_NAMES = ['daily-lunch-announcement'] as const;
export type JobName = (typeof JOB_NAMES)[number];

export const isJobName = (name: string): name is JobName => JOB_NAMES.includes(name as JobName);

export const runJob = async (jobName: JobName, options: { lunchDate?: string }) => {
  if (jobName === 'daily-lunch-announcement') {
    return postDailyLunchAnnouncement({ lunchDate: options.lunchDate });
  }

  const _never: never = jobName;
  throw new Error(`Unsupported job: ${String(_never)}`);
};

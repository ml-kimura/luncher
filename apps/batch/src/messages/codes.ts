export const BatchMessageCode = {
  InfoBatchStarted: 'I-BAT-001',
  InfoBatchCompleted: 'I-BAT-002',
  InfoBatchAbortedByError: 'I-BAT-103',
  InfoDailyLunchAnnouncementPosted: 'I-BAT-104',
  WarnNoTargetData: 'W-BAT-001',
  WarnRecordsSkipped: 'W-BAT-002',
  WarnDuplicateDailyAnnouncementSkipped: 'W-BAT-103',
  ErrorDatabaseConnection: 'E-BAT-001',
  ErrorFileReadFailed: 'E-BAT-002',
  ErrorTemplateNotFound: 'E-BAT-003',
  ErrorSlackApiFailed: 'E-BAT-004',
  FatalSystemAbortedBatch: 'F-BAT-001',
} as const;

export const BATCH_MESSAGE_CODES = Object.values(BatchMessageCode);
export const BATCH_MESSAGE_CODE_ENTRIES = Object.entries(BatchMessageCode) as Array<
  [keyof typeof BatchMessageCode, BatchMessageCode]
>;

export type BatchMessageCode = (typeof BATCH_MESSAGE_CODES)[number];

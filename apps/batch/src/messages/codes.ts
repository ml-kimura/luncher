export const BATCH_MESSAGE_DEFINITIONS = [
  {
    key: 'InfoBatchStarted',
    code: 'I-BAT-001',
    message: {
      ja: 'バッチ処理が正常に開始されました',
      en: 'Batch process started successfully',
    },
  },
  {
    key: 'InfoBatchCompleted',
    code: 'I-BAT-002',
    message: {
      ja: 'バッチ処理が正常に完了しました',
      en: 'Batch process completed successfully',
    },
  },
  {
    key: 'InfoBatchAbortedByError',
    code: 'I-BAT-103',
    message: {
      ja: 'バッチ処理が異常終了しました',
      en: 'Batch process aborted due to error',
    },
  },
  {
    key: 'InfoDailyLunchAnnouncementPosted',
    code: 'I-BAT-104',
    message: {
      ja: '日次コラボランチ案内の投稿に成功しました',
      en: 'Daily collaborative lunch announcement posted successfully',
    },
  },
  {
    key: 'WarnNoTargetData',
    code: 'W-BAT-001',
    message: {
      ja: '処理対象データが見つかりませんでした',
      en: 'No data found for processing',
    },
  },
  {
    key: 'WarnRecordsSkipped',
    code: 'W-BAT-002',
    message: {
      ja: '一部のレコードがスキップされました',
      en: 'Some records were skipped',
    },
  },
  {
    key: 'WarnDuplicateDailyAnnouncementSkipped',
    code: 'W-BAT-103',
    message: {
      ja: '既に案内済みのため、当日の募集メッセージを重複投稿しませんでした',
      en: 'Skipped duplicate announcement for the same day',
    },
  },
  {
    key: 'ErrorDatabaseConnection',
    code: 'E-BAT-001',
    message: {
      ja: 'データベース接続エラーが発生しました。{error}',
      en: 'Database connection error occurred. {error}',
    },
  },
  {
    key: 'ErrorFileReadFailed',
    code: 'E-BAT-002',
    message: {
      ja: 'ファイルの読み込みに失敗しました。{error}',
      en: 'Failed to read file. {error}',
    },
  },
  {
    key: 'ErrorTemplateNotFound',
    code: 'E-BAT-003',
    message: {
      ja: 'テンプレートが見つかりませんでした。{id}',
      en: 'Template not found. {id}',
    },
  },
  {
    key: 'ErrorSlackApiFailed',
    code: 'E-BAT-004',
    message: {
      ja: 'Slack API 呼び出しに失敗しました。{error}',
      en: 'Slack API call failed. {error}',
    },
  },
  {
    key: 'FatalSystemAbortedBatch',
    code: 'F-BAT-001',
    message: {
      ja: 'システムエラーによりバッチ処理が中断されました',
      en: 'Batch process aborted due to system error',
    },
  },
] as const;

export const API_MESSAGE_DEFINITIONS = [
  {
    key: 'InfoRequestProcessed',
    code: 'I-API-001',
    message: {
      ja: 'リクエストを正常に処理しました',
      en: 'Request processed successfully',
    },
  },
  {
    key: 'WarnNoStateChange',
    code: 'W-API-001',
    message: {
      ja: 'リクエストは受理されましたが、状態は変更されませんでした',
      en: 'Request accepted but no state change occurred',
    },
  },
  {
    key: 'ErrorInvalidRequest',
    code: 'E-API-001',
    message: {
      ja: 'リクエストの形式が不正です。{detail}',
      en: 'Invalid request format. {detail}',
    },
  },
  {
    key: 'ErrorInvalidSignature',
    code: 'E-API-002',
    message: {
      ja: '署名検証に失敗しました',
      en: 'Signature verification failed',
    },
  },
  {
    key: 'ErrorUnauthorizedOperation',
    code: 'E-API-003',
    message: {
      ja: '認可されていない操作です',
      en: 'Operation not authorized',
    },
  },
  {
    key: 'ErrorDuplicateEvent',
    code: 'E-API-004',
    message: {
      ja: '同一イベントが既に処理されています',
      en: 'Duplicate event already processed',
    },
  },
  {
    key: 'FatalInternalError',
    code: 'F-API-001',
    message: {
      ja: '内部エラーが発生しました',
      en: 'Internal server error occurred',
    },
  },
] as const;

export const ApiMessageCode = {
  InfoRequestProcessed: 'I-API-001',
  WarnNoStateChange: 'W-API-001',
  ErrorInvalidRequest: 'E-API-001',
  ErrorInvalidSignature: 'E-API-002',
  ErrorUnauthorizedOperation: 'E-API-003',
  ErrorDuplicateEvent: 'E-API-004',
  FatalInternalError: 'F-API-001',
} as const;

export const API_MESSAGE_CODES = Object.values(ApiMessageCode);
export const API_MESSAGE_CODE_ENTRIES = Object.entries(ApiMessageCode) as Array<
  [keyof typeof ApiMessageCode, ApiMessageCode]
>;

export type ApiMessageCode = (typeof API_MESSAGE_CODES)[number];

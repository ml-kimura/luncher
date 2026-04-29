export const WebMessageCode = {
  InfoPageLoaded: 'I-WEB-001',
  ErrorUnexpected: 'E-WEB-001',
} as const;

export const WEB_MESSAGE_CODES = Object.values(WebMessageCode);
export const WEB_MESSAGE_CODE_ENTRIES = Object.entries(WebMessageCode) as Array<
  [keyof typeof WebMessageCode, WebMessageCode]
>;

export type WebMessageCode = (typeof WEB_MESSAGE_CODES)[number];

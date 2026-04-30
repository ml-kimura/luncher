import { WEB_MESSAGE_DEFINITIONS } from './codes.js';

type WebMessageDefinition = (typeof WEB_MESSAGE_DEFINITIONS)[number];

export type WebMessageCode = WebMessageDefinition['code'];

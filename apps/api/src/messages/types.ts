import { API_MESSAGE_DEFINITIONS } from './codes.js';

type ApiMessageDefinition = (typeof API_MESSAGE_DEFINITIONS)[number];

export type ApiMessageCode = ApiMessageDefinition['code'];

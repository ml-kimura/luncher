import { BATCH_MESSAGE_DEFINITIONS } from './codes.js';

type BatchMessageDefinition = (typeof BATCH_MESSAGE_DEFINITIONS)[number];

export type BatchMessageCode = BatchMessageDefinition['code'];

import { parseEnumObject } from './enum';
import { parseMaterializedViewObject } from './materialized-view';
import { parseSchemaObject } from './schema';
import { parseSequenceObject } from './sequence';
import { parseTableObject } from './table';
import { ObjectParser } from './types';
import { parseViewObject } from './view';

export const parserRegistry: Record<string, ObjectParser> = {
  table: parseTableObject,
  schema: parseSchemaObject,
  view: parseViewObject,
  materialized_view: parseMaterializedViewObject,
  sequence: parseSequenceObject,
  enum: parseEnumObject,
};

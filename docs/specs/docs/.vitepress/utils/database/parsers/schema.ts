import { ObjectParser, SchemaObject } from './types';

export const parseSchemaObject: ObjectParser<SchemaObject> = () => {
  return {
    type: 'schema',
  };
};

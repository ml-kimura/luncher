import { extractBoolean, extractNumeric } from './core';
import { ObjectParser, SequenceObject } from './types';

export const parseSequenceObject: ObjectParser<SequenceObject> = ({ content }) => {
  return {
    type: 'sequence',
    start: extractNumeric(content, 'start'),
    increment: extractNumeric(content, 'increment'),
    min: extractNumeric(content, 'min'),
    max: extractNumeric(content, 'max'),
    cycle: extractBoolean(content, 'cycle'),
    cache: extractNumeric(content, 'cache'),
  };
};

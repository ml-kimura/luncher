import { EnumObject, ObjectParser } from './types';

export const parseEnumObject: ObjectParser<EnumObject> = ({ content }) => {
  const values: string[] = [];

  const valuesArrayMatch = content.match(/values\s*=\s*\[([\s\S]*?)\]/);
  if (valuesArrayMatch?.[1]) {
    const matches = valuesArrayMatch[1].match(/"([^"]+)"/g) ?? [];
    matches.forEach((v) => values.push(v.slice(1, -1)));
  }

  const valueBlockRegex = /value\s+"([^"]+)"/g;
  let valueMatch: RegExpExecArray | null;
  while ((valueMatch = valueBlockRegex.exec(content)) !== null) {
    values.push(valueMatch[1]);
  }

  return {
    type: 'enum',
    values: Array.from(new Set(values)),
  };
};

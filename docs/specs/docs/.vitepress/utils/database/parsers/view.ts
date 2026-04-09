import { parseColumns } from './core';
import { ObjectParser, ViewObject } from './types';

function extractViewDefinition(content: string): string | undefined {
  const patterns = [
    /definition\s*=\s*"""([\s\S]*?)"""/,
    /query\s*=\s*"""([\s\S]*?)"""/,
    /as\s*=\s*"""([\s\S]*?)"""/,
    /definition\s*=\s*"([^"]+)"/,
    /query\s*=\s*"([^"]+)"/,
    /as\s*=\s*"([^"]+)"/,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export const parseViewObject: ObjectParser<ViewObject> = ({ content }) => {
  return {
    type: 'view',
    columns: parseColumns(content),
    definition: extractViewDefinition(content),
  };
};

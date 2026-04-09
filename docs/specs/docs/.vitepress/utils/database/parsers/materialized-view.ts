import { parseColumns } from './core';
import { MaterializedViewObject, ObjectParser } from './types';

function extractMaterializedViewDefinition(content: string): string | undefined {
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

function extractRefreshPolicy(content: string): string | undefined {
  const patterns = [
    /refresh\s*=\s*([A-Z_]+)/,
    /refresh_policy\s*=\s*([A-Z_]+)/,
    /refresh\s*=\s*"([^"]+)"/,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export const parseMaterializedViewObject: ObjectParser<MaterializedViewObject> = ({
  content,
}) => {
  return {
    type: 'materialized_view',
    columns: parseColumns(content),
    definition: extractMaterializedViewDefinition(content),
    refresh: extractRefreshPolicy(content),
  };
};

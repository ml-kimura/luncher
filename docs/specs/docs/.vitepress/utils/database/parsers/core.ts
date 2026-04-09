import { Column, I18nMetadata } from './types';

export function asPartialI18nMetadata(
  value: unknown
): Partial<I18nMetadata> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Partial<I18nMetadata>;
}

export function toI18nMetadata(
  partial: Partial<I18nMetadata>,
  fallbackLogicalName: string
): I18nMetadata {
  return {
    logical_name: partial.logical_name ?? fallbackLogicalName,
    description: partial.description ?? '',
    i18n: partial.i18n,
  };
}

export function extractObjectName(
  content: string,
  objectType: string
): string | null {
  const nameRegex = new RegExp(`${objectType}\\s+"([^"]+)"`);
  return content.match(nameRegex)?.[1] ?? null;
}

export function parseObjectMetadata(
  content: string,
  objectType: string,
  objectName: string
): I18nMetadata {
  const commentRegex = /comment\s*=\s*"""([\s\S]*?)"""/;
  const commentMatch = content.match(commentRegex);
  let metadata: Partial<I18nMetadata> = {};
  if (commentMatch) {
    try {
      metadata = asPartialI18nMetadata(JSON.parse(commentMatch[1]));
    } catch (e) {
      process.stderr.write(
        `Failed to parse metadata for ${objectName}: ${String(e)}\n`
      );
    }
  }

  if (objectType === 'schema' && !metadata.description) {
    const simpleComment = content.match(/comment\s*=\s*"([^"]*)"/);
    if (simpleComment) {
      metadata.description = simpleComment[1];
      if (!metadata.logical_name) {
        metadata.logical_name = objectName;
      }
    }
  }

  return toI18nMetadata(metadata, objectName);
}

export function extractColumnBlocks(content: string): Array<{
  name: string;
  block: string;
}> {
  const columnRegex = /column\s+"([^"]+)"\s*\{/g;
  const blocks: Array<{ name: string; block: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = columnRegex.exec(content)) !== null) {
    const colName = match[1];
    const startIndex = match.index;
    let braceCount = 1;
    let currentIndex = startIndex + match[0].length;
    while (braceCount > 0 && currentIndex < content.length) {
      if (content[currentIndex] === '{') braceCount++;
      if (content[currentIndex] === '}') braceCount--;
      currentIndex++;
    }
    blocks.push({
      name: colName,
      block: content.substring(startIndex, currentIndex),
    });
  }
  return blocks;
}

export function parseColumns(content: string): Column[] {
  const columns: Column[] = [];
  const blocks = extractColumnBlocks(content);
  for (const { name, block } of blocks) {
    const typeMatch = block.match(/type\s*=\s*(.+?)(\r?\n|$)/);
    let type = typeMatch ? typeMatch[1].trim() : 'unknown';
    if (type.startsWith('sql(') && type.endsWith(')')) {
      type = type.slice(4, -1);
    }

    const nullMatch = block.match(/null\s*=\s*(true|false)/);
    const isNull = nullMatch ? nullMatch[1] === 'true' : true;

    const defaultMatch = block.match(/default\s*=\s*(.+?)(\r?\n|$)/);
    let defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;
    if (
      defaultValue &&
      (defaultValue.startsWith('"') || defaultValue.startsWith("'"))
    ) {
      defaultValue = defaultValue.slice(1, -1);
    }

    const colCommentMatch = block.match(/comment\s*=\s*"""([\s\S]*?)"""/);
    let colMetadata: Partial<I18nMetadata> = {};
    if (colCommentMatch) {
      try {
        colMetadata = asPartialI18nMetadata(JSON.parse(colCommentMatch[1]));
      } catch (e) {
        process.stderr.write(
          `Failed to parse metadata for column ${name}: ${String(e)}\n`
        );
      }
    }

    const normalized = toI18nMetadata(colMetadata, name);
    columns.push({
      name,
      type,
      not_null: !isNull,
      default: defaultValue,
      logical_name: normalized.logical_name,
      description: normalized.description,
      metadata: normalized,
    });
  }
  return columns;
}

export function extractNumeric(
  content: string,
  key: string
): number | undefined {
  const match = content.match(
    new RegExp(`${key}\\s*=\\s*(-?[0-9]+(?:\\.[0-9]+)?)`)
  );
  if (!match) return undefined;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : undefined;
}

export function extractBoolean(
  content: string,
  key: string
): boolean | undefined {
  const match = content.match(new RegExp(`${key}\\s*=\\s*(true|false)`));
  if (!match) return undefined;
  return match[1] === 'true';
}

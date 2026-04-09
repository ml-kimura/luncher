import { extractObjectName, parseObjectMetadata } from './parsers/core';
import { parserRegistry } from './parsers/registry';
import {
  DatabaseObject,
  EnumObject,
  I18nMetadata,
  MaterializedViewObject,
  SchemaObject,
  SequenceObject,
  TableObject,
  ViewObject,
} from './parsers/types';

export type {
  Column,
  DatabaseObject,
  EnumObject,
  ForeignKey,
  I18nMetadata,
  Index,
  MaterializedViewObject,
  SchemaObject,
  SequenceObject,
  TableObject,
  UniqueConstraint,
  ViewObject,
} from './parsers/types';

export interface ColumnDefinition {
  name: string;
  type: string;
  metadata: I18nMetadata;
}

export function parseHclFile(
  content: string,
  objectType: 'table'
): TableObject | null;
export function parseHclFile(
  content: string,
  objectType: 'schema'
): SchemaObject | null;
export function parseHclFile(
  content: string,
  objectType: 'view'
): ViewObject | null;
export function parseHclFile(
  content: string,
  objectType: 'materialized_view'
): MaterializedViewObject | null;
export function parseHclFile(
  content: string,
  objectType: 'sequence'
): SequenceObject | null;
export function parseHclFile(
  content: string,
  objectType: 'enum'
): EnumObject | null;
export function parseHclFile(
  content: string,
  objectType: string
): DatabaseObject | null;
export function parseHclFile(
  content: string,
  objectType: string
): DatabaseObject | null {
  const name = extractObjectName(content, objectType);
  if (!name) {
    return null;
  }

  const metadata = parseObjectMetadata(content, objectType, name);
  const parser = parserRegistry[objectType];
  if (!parser) {
    return {
      type: objectType,
      name,
      metadata,
      rawHcl: { body: content },
    };
  }

  const parsed = parser({ content, objectType, name, metadata });
  const parsedType = (parsed as { type?: string }).type ?? objectType;
  return {
    ...parsed,
    type: parsedType,
    name,
    metadata,
    rawHcl: { body: content },
  };
}

export function getLocalizedMetadata(
  metadata: I18nMetadata,
  locale: string
): { logical_name: string; description: string } {
  if (metadata.i18n && metadata.i18n[locale]) {
    return metadata.i18n[locale];
  }

  return {
    logical_name: metadata.logical_name,
    description: metadata.description,
  };
}

export interface I18nMetadata {
  logical_name: string;
  description: string;
  i18n?: {
    [locale: string]: {
      logical_name: string;
      description: string;
    };
  };
}

export interface Column {
  name: string;
  type: string;
  not_null?: boolean;
  default?: string;
  pk_order?: number;
  logical_name: string;
  description: string;
  metadata: I18nMetadata;
}

export interface ForeignKey {
  name: string;
  columns: string[];
  ref_table: string;
  ref_columns: string[];
  on_delete?: string;
  on_update?: string;
}

export interface UniqueConstraint {
  name: string;
  columns: string[];
}

export interface Index {
  name: string;
  type?: string;
  columns: string[];
}

export interface BaseObject {
  type: string;
  name: string;
  metadata: I18nMetadata;
  rawHcl: { body: string };
}

export interface TableObject extends BaseObject {
  type: 'table';
  columns: Column[];
  primary_keys: { name: string; columns: string[] }[];
  foreign_keys: ForeignKey[];
  unique_constraints: UniqueConstraint[];
  indexes: Index[];
}

export interface SchemaObject extends BaseObject {
  type: 'schema';
}

export interface ViewObject extends BaseObject {
  type: 'view';
  columns: Column[];
  definition?: string;
}

export interface MaterializedViewObject extends BaseObject {
  type: 'materialized_view';
  columns: Column[];
  definition?: string;
  refresh?: string;
}

export interface SequenceObject extends BaseObject {
  type: 'sequence';
  start?: number;
  increment?: number;
  min?: number;
  max?: number;
  cycle?: boolean;
  cache?: number;
}

export interface EnumObject extends BaseObject {
  type: 'enum';
  values: string[];
}

export type GenericObject = BaseObject & { type: string };

export type DatabaseObject =
  | TableObject
  | SchemaObject
  | ViewObject
  | MaterializedViewObject
  | SequenceObject
  | EnumObject
  | GenericObject;

export interface ParseContext {
  content: string;
  objectType: string;
  name: string;
  metadata: I18nMetadata;
}

export type ObjectParser<T extends DatabaseObject = DatabaseObject> = (
  ctx: ParseContext
) => Omit<T, keyof BaseObject>;

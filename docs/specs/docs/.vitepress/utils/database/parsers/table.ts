import { ObjectParser, TableObject } from './types';
import { parseColumns } from './core';

export const parseTableObject: ObjectParser<TableObject> = ({ content }) => {
  const columns = parseColumns(content);

  const pkRegex =
    /primary_key\s*\{[\s\S]*?columns\s*=\s*\[([^\]]+)\][\s\S]*?\}/;
  const pkMatch = content.match(pkRegex);
  const pkColumns: string[] = [];
  if (pkMatch) {
    const colMatches = pkMatch[1].match(/column\.([a-zA-Z0-9_]+)/g);
    if (colMatches) {
      colMatches.forEach((c) => pkColumns.push(c.replace('column.', '')));
    }
  }

  pkColumns.forEach((pkCol, index) => {
    const col = columns.find((c) => c.name === pkCol);
    if (col) {
      col.pk_order = index + 1;
    }
  });

  const foreign_keys: TableObject['foreign_keys'] = [];
  const fkRegex = /foreign_key\s+"([^"]+)"\s*\{[\s\S]*?\}/g;
  let fkMatch: RegExpExecArray | null;
  while ((fkMatch = fkRegex.exec(content)) !== null) {
    const fkName = fkMatch[1];
    const fkBlock = fkMatch[0];

    const fkColsMatch = fkBlock.match(/columns\s*=\s*\[([^\]]+)\]/);
    const fkCols: string[] = [];
    if (fkColsMatch) {
      const colMatches = fkColsMatch[1].match(/column\.([a-zA-Z0-9_]+)/g);
      if (colMatches) {
        colMatches.forEach((c) => fkCols.push(c.replace('column.', '')));
      }
    }

    const refColsMatch = fkBlock.match(/ref_columns\s*=\s*\[([^\]]+)\]/);
    const refCols: string[] = [];
    let refTable = '';
    if (refColsMatch) {
      const refMatches = refColsMatch[1].match(
        /table\.([a-zA-Z0-9_]+)\.column\.([a-zA-Z0-9_]+)/g
      );
      if (refMatches) {
        refMatches.forEach((r) => {
          const parts = r.match(
            /table\.([a-zA-Z0-9_]+)\.column\.([a-zA-Z0-9_]+)/
          );
          if (parts) {
            refTable = parts[1];
            refCols.push(parts[2]);
          }
        });
      }
    }

    const onDeleteMatch = fkBlock.match(/on_delete\s*=\s*([A-Z_]+)/);
    const onUpdateMatch = fkBlock.match(/on_update\s*=\s*([A-Z_]+)/);

    foreign_keys.push({
      name: fkName,
      columns: fkCols,
      ref_table: refTable,
      ref_columns: refCols,
      on_delete: onDeleteMatch ? onDeleteMatch[1] : undefined,
      on_update: onUpdateMatch ? onUpdateMatch[1] : undefined,
    });
  }

  const unique_constraints: TableObject['unique_constraints'] = [];
  const uqRegex = /unique\s+"([^"]+)"\s*\{[\s\S]*?\}/g;
  let uqMatch: RegExpExecArray | null;
  while ((uqMatch = uqRegex.exec(content)) !== null) {
    const uqName = uqMatch[1];
    const uqBlock = uqMatch[0];
    const uqColsMatch = uqBlock.match(/columns\s*=\s*\[([^\]]+)\]/);
    const uqCols: string[] = [];
    if (uqColsMatch) {
      const colMatches = uqColsMatch[1].match(/column\.([a-zA-Z0-9_]+)/g);
      if (colMatches) {
        colMatches.forEach((c) => uqCols.push(c.replace('column.', '')));
      }
    }
    unique_constraints.push({ name: uqName, columns: uqCols });
  }

  const indexes: TableObject['indexes'] = [];
  const idxRegex = /index\s+"([^"]+)"\s*\{[\s\S]*?\}/g;
  let idxMatch: RegExpExecArray | null;
  while ((idxMatch = idxRegex.exec(content)) !== null) {
    const idxName = idxMatch[1];
    const idxBlock = idxMatch[0];
    const idxColsMatch = idxBlock.match(/columns\s*=\s*\[([^\]]+)\]/);
    const idxCols: string[] = [];
    if (idxColsMatch) {
      const colMatches = idxColsMatch[1].match(/column\.([a-zA-Z0-9_]+)/g);
      if (colMatches) {
        colMatches.forEach((c) => idxCols.push(c.replace('column.', '')));
      }
    }
    const typeMatch = idxBlock.match(/type\s*=\s*([A-Z_]+)/);
    indexes.push({
      name: idxName,
      type: typeMatch ? typeMatch[1] : undefined,
      columns: idxCols,
    });
  }

  return {
    type: 'table',
    columns,
    primary_keys:
      pkColumns.length > 0 ? [{ name: 'Primary Key', columns: pkColumns }] : [],
    foreign_keys,
    unique_constraints,
    indexes,
  };
};

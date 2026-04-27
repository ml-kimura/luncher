<script setup lang="ts">
import { withBase } from 'vitepress';

export interface FieldDef {
  key: string;
  label: string;
}

export interface DocItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  [key: string]: string | undefined;
}

const props = defineProps<{
  items: DocItem[];
  columns: FieldDef[];
  linkKey?: string;
}>();

function getCellValue(item: DocItem, key: string): string {
  return item[key] || "";
}

function isLinkColumn(key: string): boolean {
  if (props.linkKey) {
    return props.linkKey === key;
  }

  // Default: first column (usually 'id')
  return props.columns.length > 0 && props.columns[0].key === key;
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in props.items"
        :key="item.link"
      >
        <td
          v-for="col in props.columns"
          :key="col.key"
        >
          <a
            v-if="isLinkColumn(col.key)"
            :href="withBase(item.link)"
          >{{
            getCellValue(item, col.key)
          }}</a>
          <span v-else>{{ getCellValue(item, col.key) }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

tr:hover {
  background-color: var(--vp-c-bg-soft);
}

a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>

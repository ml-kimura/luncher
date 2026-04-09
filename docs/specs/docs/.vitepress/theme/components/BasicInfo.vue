<script setup lang="ts">
export interface FieldDef {
  key: string;
  label: string;
}

const props = defineProps<{
  title: string;
  fields: FieldDef[];
  data: Record<string, string | undefined>;
}>();

function getFieldValue(key: string): string {
  return props.data[key] || "";
}

// Only show fields that have values
function hasValue(key: string): boolean {
  const value = props.data[key];
  return value !== undefined && value !== "";
}
</script>

<template>
  <div class="basic-info">
    <h2>{{ props.title }}</h2>
    <table>
      <tbody>
        <tr
          v-for="field in props.fields"
          v-show="hasValue(field.key)"
          :key="field.key"
        >
          <th>{{ field.label }}</th>
          <td>{{ getFieldValue(field.key) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.basic-info {
  margin: 1.5rem 0;
}

h2 {
  margin-bottom: 0.75rem;
}

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
  width: 30%;
}

tr:hover {
  background-color: var(--vp-c-bg-soft);
}
</style>

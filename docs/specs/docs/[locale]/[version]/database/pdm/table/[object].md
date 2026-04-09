---
---

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, watchEffect } from 'vue'

const { params, site } = useData()
const data = computed(() => params.value.data)

watchEffect(() => {
  if (typeof document === 'undefined') return

  const objectName = data.value?.objectName
  const siteTitle = site.value.title 
  document.title = objectName ? `${objectName} | ${siteTitle}` : siteTitle
})
</script>

# {{ data.objectName }}

**{{ data.title }}**

{{ data.description }}

## {{ data.pdmUi.columnsSection }}

<table class="vp-table">
  <thead>
    <tr>
      <th>PK</th>
      <th>{{ data.pdmUi.physicalName }}</th>
      <th>{{ data.pdmUi.logicalName }}</th>
      <th>{{ data.pdmUi.sqlType }}</th>
      <th>Not Null</th>
      <th>Default</th>
      <th>{{ data.pdmUi.description }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="col in data.columns" :key="col.name">
      <td style="text-align: center;">{{ col.pk_order || '' }}</td>
      <td>{{ col.name }}</td>
      <td>{{ col.logical_name }}</td>
      <td>{{ col.type }}</td>
      <td style="text-align: center;">{{ col.not_null ? '✓' : '' }}</td>
      <td>{{ col.default || '' }}</td>
      <td>{{ col.description }}</td>
    </tr>
  </tbody>
</table>

## {{ data.pdmUi.pkUniqueIndexSection }}

<table class="vp-table">
  <thead>
    <tr>
      <th>No</th>
      <th>{{ data.pdmUi.name }}</th>
      <th>{{ data.pdmUi.constraintKind }}</th>
      <th>{{ data.pdmUi.columns }}</th>
    </tr>
  </thead>
  <tbody>
    <template v-if="data.primary_keys && data.primary_keys.length > 0">
      <tr v-for="(pk, index) in data.primary_keys" :key="'pk-' + index">
        <td>{{ index + 1 }}</td>
        <td>(Auto Generated)</td>
        <td>Primary Key</td>
        <td>{{ pk.columns.join(', ') }}</td>
      </tr>
    </template>
    <template v-if="data.unique_constraints && data.unique_constraints.length > 0">
      <tr v-for="(uq, index) in data.unique_constraints" :key="'uq-' + index">
        <td>{{ (data.primary_keys?.length || 0) + index + 1 }}</td>
        <td>{{ uq.name }}</td>
        <td>Unique</td>
        <td>{{ uq.columns.join(', ') }}</td>
      </tr>
    </template>
    <template v-if="data.indexes && data.indexes.length > 0">
      <tr v-for="(idx, index) in data.indexes" :key="'idx-' + index">
        <td>{{ (data.primary_keys?.length || 0) + (data.unique_constraints?.length || 0) + index + 1 }}</td>
        <td>{{ idx.name }}</td>
        <td>{{ idx.type || 'Index' }}</td>
        <td>{{ idx.columns.join(', ') }}</td>
      </tr>
    </template>
    <tr v-if="(!data.primary_keys || data.primary_keys.length === 0) && (!data.unique_constraints || data.unique_constraints.length === 0) && (!data.indexes || data.indexes.length === 0)">
      <td colspan="4" style="text-align: center;">{{ data.pdmUi.none }}</td>
    </tr>
  </tbody>
</table>

## {{ data.pdmUi.referenceConstraints }}

<div v-if="data.foreign_keys && data.foreign_keys.length > 0">

<table class="vp-table">
  <thead>
    <tr>
      <th>No</th>
      <th>{{ data.pdmUi.name }}</th>
      <th>{{ data.pdmUi.columns }}</th>
      <th>{{ data.pdmUi.refTable }}</th>
      <th>{{ data.pdmUi.refColumns }}</th>
      <th>On Delete</th>
      <th>On Update</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(fk, index) in data.foreign_keys" :key="index">
      <td>{{ index + 1 }}</td>
      <td>{{ fk.name }}</td>
      <td>{{ fk.columns.join(', ') }}</td>
      <td>{{ fk.ref_table }}</td>
      <td>{{ fk.ref_columns.join(', ') }}</td>
      <td>{{ fk.on_delete || '-' }}</td>
      <td>{{ fk.on_update || '-' }}</td>
    </tr>
  </tbody>
</table>

</div>
<div v-else>
  <p>{{ data.pdmUi.none }}</p>
</div>

## {{ data.pdmUi.checkExclusiveSection }}

<table class="vp-table">
  <thead>
    <tr>
      <th>No</th>
      <th>{{ data.pdmUi.name }}</th>
      <th>{{ data.pdmUi.constraintKind }}</th>
      <th>{{ data.pdmUi.condition }}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="4" style="text-align: center;">{{ data.pdmUi.none }}</td>
    </tr>
  </tbody>
</table>

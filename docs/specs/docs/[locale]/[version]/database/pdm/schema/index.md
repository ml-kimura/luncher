---
---

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, watchEffect } from 'vue'

const { params, site } = useData()
const data = computed(() => params.value.data)

watchEffect(() => {
  if (typeof document === 'undefined') return

  const pageTitle = data.value?.title
  const siteTitle = site.value.title
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle
})
</script>

# {{ data.title }}

<table class="vp-table">
  <thead>
    <tr>
      <th>{{ data.pdmUi.physicalName }}</th>
      <th>{{ data.pdmUi.description }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="obj in data.objects" :key="obj.name">
      <td>{{ obj.name }}</td>
      <td>{{ obj.description }}</td>
    </tr>
  </tbody>
</table>

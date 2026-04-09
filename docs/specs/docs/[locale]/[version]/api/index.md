---
aside: false
---

<script setup lang="ts">
import { useRoute, useData } from 'vitepress'
import { ref, watch, computed, watchEffect } from 'vue'

const route = useRoute()
const { localeIndex, site } = useData()

const params = ref<{
  specs?: string;
  designTitle?: string;
  designDescription?: string;
  designLink?: string;
} | null>(null)

watch(
  () => route.path,
  () => {
    const p = route.data?.params
    if (p) {
      params.value = p
    }
  },
  { immediate: true }
)

const specs = computed(() => {
  if (!params.value?.specs) return []
  try {
    return JSON.parse(params.value.specs)
  } catch {
    return []
  }
})

const labels = computed(() => {
  const currentLocale = site.value.locales?.[localeIndex.value] as {
    themeConfig?: {
      sidebarLabels?: Record<string, string>;
      openapiMessages?: Record<string, string>;
    };
  } | undefined;
  
  const sidebarLabels = currentLocale?.themeConfig?.sidebarLabels || {};
  const openapiMessages = currentLocale?.themeConfig?.openapiMessages || {};
  
  return {
    title: sidebarLabels.api || 'API',
    description: openapiMessages['API Description'] || openapiMessages['API'] || 
      'This section provides API specifications for the system.',
    overview: sidebarLabels.overview || 'Overview',
    apiName: openapiMessages['API Name'] || sidebarLabels.apiName || 'API Name',
    apiDescription: openapiMessages['Description'] || 'Description',
  }
})

watchEffect(() => {
  if (typeof document === 'undefined') return
  const siteTitle = site.value.title
  const pageTitle = labels.value.title
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle
})
</script>

<div v-if="params">
  <h1>{{ labels.title }}</h1>
  <p>{{ labels.description }}</p>
  <h2>{{ labels.overview }}</h2>
  <table>
    <thead>
      <tr>
        <th>{{ labels.apiName }}</th>
        <th>{{ labels.apiDescription }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="spec in specs" :key="spec.id">
        <td><a :href="spec.link">{{ spec.title }}</a></td>
        <td>{{ spec.description }}</td>
      </tr>
      <tr v-if="params?.designLink">
        <td><a :href="params.designLink">{{ params.designTitle || 'API Design' }}</a></td>
        <td>{{ params.designDescription || '' }}</td>
      </tr>
    </tbody>
  </table>
</div>

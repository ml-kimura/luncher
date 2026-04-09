<script setup lang="ts">
import { useRoute, useData } from "vitepress";
import { ref, watch, computed, watchEffect } from "vue";

const route = useRoute();
const { site } = useData();
const params = ref<{
  title: string;
  description: string;
  labels: string;
  messages: string;
} | null>(null);

watch(
  () => route.path,
  () => {
    const p = route.data.params;
    if (p) {
      params.value = p as typeof params.value;
    }
  },
  { immediate: true }
);

const labels = computed(() => {
  if (!params.value?.labels) return {};
  try {
    return JSON.parse(params.value.labels);
  } catch {
    return {};
  }
});

const messages = computed(() => {
  if (!params.value?.messages) return { info: [], warning: [], error: [], fatal: [] };
  try {
    return JSON.parse(params.value.messages);
  } catch {
    return { info: [], warning: [], error: [], fatal: [] };
  }
});

const messageTypes = computed(() => [
  { key: 'info', label: labels.value.info },
  { key: 'warning', label: labels.value.warning },
  { key: 'error', label: labels.value.error },
  { key: 'fatal', label: labels.value.fatal },
]);

watchEffect(() => {
  if (typeof document === "undefined") return;

  const pageTitle = params.value?.title;
  const siteTitle = site.value.title;
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
});
</script>

# {{ $params.title }}

{{ $params.description }}

<template v-for="type in messageTypes" :key="type.key">
  <h2 :id="type.key">{{ type.label }}</h2>
  <table v-if="messages[type.key]?.length > 0">
    <thead>
      <tr>
        <th>{{ labels.code }}</th>
        <th>{{ labels.message }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="msg in messages[type.key]" :key="msg.code" :id="msg.code">
        <td><code><a :href="'#' + msg.code">{{ msg.code }}</a></code></td>
        <td>{{ msg.message }}</td>
      </tr>
    </tbody>
  </table>
  <p v-else><em>No messages</em></p>
</template>

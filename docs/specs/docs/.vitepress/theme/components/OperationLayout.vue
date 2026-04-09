<script setup lang="ts">
import { useRoute } from "vitepress";
import { useOpenapi } from "vitepress-openapi/client";
import { createOpenApiSpec } from "vitepress-openapi";
import { watch } from "vue";

const props = defineProps<{
  spec: Record<string, unknown>;
}>();

const route = useRoute();
const operationId = route.data.params.operationId;

// Initialize OpenAPI spec
const openapi = createOpenApiSpec({ spec: props.spec });
useOpenapi({ spec: openapi.spec });

// Re-initialize when spec changes (if needed for future dynamic switching)
watch(
  () => props.spec,
  (newSpec) => {
    const newOpenapi = createOpenApiSpec({ spec: newSpec });
    useOpenapi({ spec: newOpenapi.spec });
  }
);
</script>

<template>
  <OAOperation
    v-if="operationId"
    :operation-id="operationId"
  />
</template>

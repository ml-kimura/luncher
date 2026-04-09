<script setup lang="ts">
import { useData, useRoute } from "vitepress";
import { createOpenApiSpec } from "vitepress-openapi";
import { useOpenapi } from "vitepress-openapi/client";
import { ref, watch } from "vue";

const route = useRoute();
const { site } = useData();
const operationId = ref("");
const isReady = ref(false);

watch(
  () => route.path,
  () => {
    updateSpec();
  },
  { immediate: true }
);

function updateSpec() {
  const p = route.data.params;
  if (!p) return;

  operationId.value = p.operationId;
  if (typeof document !== "undefined") {
    const siteTitle = site.value.title;
    const pageTitle = p.pageTitle || p.operationId;
    document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
  }

  if (p.spec) {
    const spec = JSON.parse(p.spec);
    const openapi = createOpenApiSpec({ spec });
    useOpenapi({ spec: openapi.spec });
    isReady.value = true;
  } else {
    console.error("Spec not found in params");
    isReady.value = false;
  }
}
</script>

<OAOperation v-if="isReady && operationId" :operation-id="operationId" />

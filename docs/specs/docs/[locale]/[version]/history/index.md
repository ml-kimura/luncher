<script setup lang="ts">
import { useRoute, useData } from "vitepress";
import { ref, watch, computed } from "vue";
import { marked } from "marked";

const route = useRoute();
const { data } = useData();
const content = ref<string>("");
const description = ref<string>("");

watch(
  () => route.path,
  () => {
    // Try both route.data?.params and data.params
    const p = route.data?.params || data.params;
    if (p) {
      if (p.content) {
        content.value = p.content as string;
      }
      if (p.description) {
        description.value = p.description as string;
      }
    }
  },
  { immediate: true }
);

const htmlContent = computed(() => {
  if (!content.value) return "";
  return marked(content.value);
});
</script>

# リリース履歴

<p v-if="description" class="description">{{ description }}</p>

<div v-if="content" class="release-notes" v-html="htmlContent"></div>

<style scoped>
.description {
  margin-bottom: 2.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.release-notes {
  margin-top: 1rem;
}

/* Stronger separator between versions */
.release-notes :deep(hr) {
  margin: 4rem 0 3rem 0;
  border: none;
  border-top: 2px solid var(--vp-c-divider);
  height: 0;
}

/* Add spacing before each version heading */
.release-notes :deep(h1) {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--vp-c-divider-light);
  scroll-margin-top: 2rem;
}

.release-notes :deep(h1:first-of-type) {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

/* Spacing for sections within a version (h2, h3) */
.release-notes :deep(h2),
.release-notes :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

/* Add spacing after version content */
.release-notes :deep(h1 + p) {
  margin-bottom: 1rem;
}
</style>

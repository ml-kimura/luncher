<script setup lang="ts">
import { useRoute, useData } from "vitepress";
import { ref, watch, computed, watchEffect } from "vue";
import DocList, {
  type FieldDef,
} from "../../../../.vitepress/theme/components/DocList.vue";

const route = useRoute();
const { site } = useData();

const params = ref<{
  locale: string;
  version: string;
  section: string;
  subSection: string;
  title: string;
  description: string;
  listLabel: string;
  fields: string;
  items: string;
} | null>(null);

watch(
  () => route.path,
  () => {
    const p = route.data?.params;
    if (p) {
      params.value = p as typeof params.value;
    }
  },
  { immediate: true }
);

const fields = computed<FieldDef[]>(() => {
  if (!params.value?.fields) return [];
  try {
    return JSON.parse(params.value.fields) as FieldDef[];
  } catch {
    return [];
  }
});

const items = computed(() => {
  if (!params.value?.items) return [];
  try {
    const parsed = JSON.parse(params.value.items) as Array<Record<string, string>>;
    return parsed.sort((a, b) => {
      const aId = String(a.id ?? "");
      const bId = String(b.id ?? "");
      const aNum = Number(aId);
      const bNum = Number(bId);
      const aIsNum = Number.isFinite(aNum);
      const bIsNum = Number.isFinite(bNum);

      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return aId.localeCompare(bId);
    });
  } catch {
    return [];
  }
});

const linkKey = computed(() => {
  return "title";
});

watchEffect(() => {
  if (typeof document === "undefined") return;

  const pageTitle = params.value?.title;
  const siteTitle = site.value.title;
  document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
});
</script>

# {{ $params.title }}

{{ $params.description }}

<DocList v-if="items.length > 0" :items="items" :columns="fields" :link-key="linkKey" />

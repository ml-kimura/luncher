<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, withBase } from 'vitepress';

type StoryRow = {
  id: string;
  title: string;
  link: string;
  actor: string;
  integrations: string[];
  screenFlowPath: string;
  batchFlowPath: string;
  apiDesignPath: string;
  tableDefPath: string;
};

const route = useRoute();
const params = ref<{
  title?: string;
  description?: string;
  colUs?: string;
  colStory?: string;
  colActor?: string;
  colIntegration?: string;
  colScreenFlow?: string;
  colBatchFlow?: string;
  colApiDesign?: string;
  colTableDef?: string;
  items?: string;
} | null>(null);

watch(
  () => route.path,
  () => {
    const p = route.data?.params;
    if (p) params.value = p as typeof params.value;
  },
  { immediate: true }
);

const items = computed<StoryRow[]>(() => {
  if (!params.value?.items) return [];
  try {
    return JSON.parse(params.value.items) as StoryRow[];
  } catch {
    return [];
  }
});
</script>

# {{ $params.title }}

{{ $params.description }}

<table>
  <thead>
    <tr>
      <th>{{ $params.colUs }}</th>
      <th>{{ $params.colStory }}</th>
      <th>{{ $params.colActor }}</th>
      <th>{{ $params.colIntegration }}</th>
      <th>{{ $params.colScreenFlow }}</th>
      <th>{{ $params.colBatchFlow }}</th>
      <th>{{ $params.colApiDesign }}</th>
      <th>{{ $params.colTableDef }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in items" :key="item.id">
      <td><a :href="withBase(item.link)">US-{{ item.id.padStart(3, '0') }}</a></td>
      <td><a :href="withBase(item.link)">{{ item.title }}</a></td>
      <td>{{ item.actor }}</td>
      <td>{{ item.integrations.join(' / ') }}</td>
      <td class="matrix-cell"><InternalLink v-if="item.screenFlowPath" class="matrix-link" :path="item.screenFlowPath">◯</InternalLink></td>
      <td class="matrix-cell"><InternalLink v-if="item.batchFlowPath" class="matrix-link" :path="item.batchFlowPath">◯</InternalLink></td>
      <td class="matrix-cell"><InternalLink v-if="item.apiDesignPath" class="matrix-link" :path="item.apiDesignPath">◯</InternalLink></td>
      <td class="matrix-cell"><InternalLink v-if="item.tableDefPath" class="matrix-link" :path="item.tableDefPath">◯</InternalLink></td>
    </tr>
  </tbody>
</table>

<style scoped>
.matrix-cell { text-align: center; }
.matrix-link { text-decoration: none; }
</style>

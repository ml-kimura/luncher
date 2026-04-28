<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { useUserStoryBasicInfo } from '../../utils/user-story-basic-info';

type StoryValue = {
  who?: unknown;
  want?: unknown;
  why?: unknown;
};

type UserStoryFrontmatter = {
  title?: unknown;
  actor?: unknown;
  integrations?: unknown;
  outputs?: unknown;
  story?: StoryValue;
  trigger?: unknown;
  postConditions?: unknown;
  acceptanceCriteria?: unknown;
  outOfScope?: unknown;
  notes?: unknown;
};

type UserStorySection =
  | 'all'
  | 'basic-info'
  | 'artifacts'
  | 'story'
  | 'process'
  | 'acceptance'
  | 'out-of-scope'
  | 'notes';

const props = withDefaults(
  defineProps<{
    section?: UserStorySection;
    showTitle?: boolean;
  }>(),
  {
    section: 'all',
    showTitle: true,
  }
);

const { frontmatter } = useData<UserStoryFrontmatter>();
const { basicInfoFields, basicInfoData } = useUserStoryBasicInfo(frontmatter);

const title = computed(() => String(frontmatter.value.title ?? ''));
const story = computed(() => ({
  who: String(frontmatter.value.story?.who ?? ''),
  want: String(frontmatter.value.story?.want ?? ''),
  why: String(frontmatter.value.story?.why ?? ''),
}));

const outputs = computed<string[]>(() =>
  Array.isArray(frontmatter.value.outputs)
    ? frontmatter.value.outputs.map((v) => String(v))
    : []
);
const hasScreen = computed(() => outputs.value.includes('screen'));
const hasBatch = computed(() => outputs.value.includes('batch'));
const hasApi = computed(() => outputs.value.includes('api'));
/** `db` はテーブル定義書（PDM）列の◯に対応する */
const hasTableDef = computed(() => outputs.value.includes('db'));

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((v) => String(v)).filter((v) => v !== '')
    : [];
}

const trigger = computed(() => String(frontmatter.value.trigger ?? ''));
const postConditions = computed(() =>
  normalizeStringArray(frontmatter.value.postConditions)
);
const acceptanceCriteria = computed(() =>
  normalizeStringArray(frontmatter.value.acceptanceCriteria)
);
const outOfScope = computed(() =>
  normalizeStringArray(frontmatter.value.outOfScope)
);
const notes = computed(() => normalizeStringArray(frontmatter.value.notes));

function shouldRender(section: Exclude<UserStorySection, 'all'>): boolean {
  return props.section === 'all' || props.section === section;
}
</script>

<template>
  <h1 v-if="props.section === 'all' && props.showTitle && title">{{ title }}</h1>

  <BasicInfo
    v-if="shouldRender('basic-info')"
    :title="props.section === 'all' ? '基本情報' : undefined"
    :fields="basicInfoFields"
    :data="basicInfoData"
  />

  <template v-if="shouldRender('artifacts')">
    <h2 v-if="props.section === 'all'">関連成果物</h2>
    <table>
    <thead>
      <tr>
        <th>画面フロー</th>
        <th>バッチフロー</th>
        <th>API設計書</th>
        <th>テーブル定義書</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="matrix-cell">
          <InternalLink v-if="hasScreen" class="matrix-link" path="screen/flow/">◯</InternalLink><span v-else>-</span>
        </td>
        <td class="matrix-cell">
          <InternalLink v-if="hasBatch" class="matrix-link" path="batch/flow/">◯</InternalLink><span v-else>-</span>
        </td>
        <td class="matrix-cell">
          <InternalLink v-if="hasApi" class="matrix-link" path="api/design/">◯</InternalLink><span v-else>-</span>
        </td>
        <td class="matrix-cell">
          <InternalLink v-if="hasTableDef" class="matrix-link" path="database/pdm/table/">◯</InternalLink><span v-else>-</span>
        </td>
      </tr>
    </tbody>
    </table>
  </template>

  <template v-if="shouldRender('story')">
    <h2 v-if="props.section === 'all'">ストーリー</h2>
    <table>
    <tbody>
      <tr><td>だれが</td><td>{{ story.who }}</td></tr>
      <tr><td>何をしたい</td><td>{{ story.want }}</td></tr>
      <tr><td>なぜ（価値）</td><td>{{ story.why }}</td></tr>
    </tbody>
    </table>
  </template>

  <template v-if="shouldRender('process') && (trigger || postConditions.length > 0)">
    <h2 v-if="props.section === 'all'">処理条件</h2>
    <table>
    <tbody>
      <tr v-if="trigger"><td>トリガー</td><td>{{ trigger }}</td></tr>
      <tr v-if="postConditions.length > 0">
        <td>事後状態</td>
        <td>
          <ul>
            <li v-for="item in postConditions" :key="item">{{ item }}</li>
          </ul>
        </td>
      </tr>
    </tbody>
    </table>
  </template>

  <template v-if="shouldRender('acceptance') && acceptanceCriteria.length > 0">
    <h2 v-if="props.section === 'all'">受け入れ条件</h2>
    <ul>
    <li v-for="item in acceptanceCriteria" :key="item">{{ item }}</li>
    </ul>
  </template>

  <template v-if="shouldRender('out-of-scope') && outOfScope.length > 0">
    <h2 v-if="props.section === 'all'">対象外</h2>
    <ul>
    <li v-for="item in outOfScope" :key="item">{{ item }}</li>
    </ul>
  </template>

  <template v-if="shouldRender('notes') && notes.length > 0">
    <h2 v-if="props.section === 'all'">補足</h2>
    <ul>
    <li v-for="item in notes" :key="item">{{ item }}</li>
    </ul>
  </template>
</template>

<style scoped>
.matrix-cell {
  text-align: center;
}

.matrix-link {
  text-decoration: none;
}
</style>

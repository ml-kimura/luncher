<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

type UserStoryFrontmatter = {
  id?: unknown;
  title?: unknown;
};

const { frontmatter } = useData<UserStoryFrontmatter>();
const storyId = computed(() => String(frontmatter.value.id ?? ''));
const title = computed(() => String(frontmatter.value.title ?? ''));
const heading = computed(() => {
  if (!storyId.value && !title.value) return '';
  const normalized = storyId.value.padStart(3, '0');
  if (!storyId.value) return title.value;
  if (!title.value) return `US-${normalized}`;
  return `US-${normalized} ${title.value}`;
});
</script>

<template>
  <h1 v-if="heading">{{ heading }}</h1>
</template>

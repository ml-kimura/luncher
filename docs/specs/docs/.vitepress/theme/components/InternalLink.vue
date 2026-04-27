<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import { resolveVersionedUrl } from '../../utils/versioned-url';

const props = defineProps<{
  path: string;
  label?: string;
}>();

const route = useRoute();
const href = computed(() => resolveVersionedUrl(route.path, props.path));
</script>

<template>
  <a :href="href"><slot>{{ props.label || props.path }}</slot></a>
</template>

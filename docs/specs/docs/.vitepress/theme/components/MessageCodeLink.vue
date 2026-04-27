<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import { resolveVersionedUrl } from '../../utils/versioned-url';

const props = defineProps<{
  code: string;
}>();

const route = useRoute();

const href = computed(() =>
  resolveVersionedUrl(route.path, `screen/messages.html#${props.code}`)
);
</script>

<template>
  <a :href="href">{{ props.code }}</a>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute, withBase } from "vitepress";

const { theme, localeIndex } = useData();
const route = useRoute();

// Get current version from URL
const currentVersion = computed(() => {
  const path = route.path;
  const prefix = `/${localeIndex.value}/`;

  if (path.startsWith(prefix)) {
    const relativePath = path.slice(prefix.length);
    const match = relativePath.match(/^([^/]+)/);
    // Use first available version as fallback
    const fallback = theme.value.versions ? theme.value.versions[0] : "";
    return match ? match[1] : fallback;
  }
  return theme.value.versions ? theme.value.versions[0] : "";
});

const navItems = computed(() => {
  const prefix = `/${localeIndex.value}/`;
  const version = currentVersion.value;
  const base = `${prefix}${version}`;

  // Get navItems from theme config (loaded from locale YAML)
  const items = theme.value.navItems || [];

  return items.map((item: { key: string; label: string; path: string }) => ({
    key: item.key,
    text: item.label,
    link: withBase(item.path ? `${base}/${item.path}/` : `${base}/`),
  }));
});

const homeLink = computed(() => navItems.value[0]?.link || "/");
</script>

<template>
  <div class="main-nav">
    <a
      v-for="item in navItems"
      :key="item.key"
      :href="item.link"
      class="VPNavBarMenuLink"
      :class="{
        active:
          (route.path.startsWith(item.link) && item.link !== homeLink) ||
          (item.link === homeLink && route.path === item.link),
      }"
    >
      {{ item.text }}
    </a>
  </div>
</template>

<style scoped>
.main-nav {
  display: flex;
  align-items: center;
}

.VPNavBarMenuLink {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
  text-decoration: none;
}

.VPNavBarMenuLink:hover {
  color: var(--vp-c-brand-1);
}

.VPNavBarMenuLink.active {
  color: var(--vp-c-brand-1);
}
</style>

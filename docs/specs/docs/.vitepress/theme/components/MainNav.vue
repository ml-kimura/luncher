<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute, withBase } from "vitepress";

const { theme, site, localeIndex } = useData();
const route = useRoute();

const versions = computed<string[]>(() => {
  return theme.value.versions || [];
});

const normalizedPath = computed(() => {
  const base = site.value.base || "/";
  if (base !== "/" && route.path.startsWith(base)) {
    return `/${route.path.slice(base.length)}`.replace(/\/+/g, "/");
  }
  return route.path;
});

const localeCode = computed(() => {
  const localeKeys = Object.keys(site.value.locales || {}).filter((key) => key !== "root");
  const matched = normalizedPath.value.match(/^\/([^/]+)\//)?.[1];
  if (matched && localeKeys.includes(matched)) {
    return matched;
  }
  if (localeIndex.value && localeIndex.value !== "root") {
    return localeIndex.value;
  }
  return localeKeys[0] || "ja";
});

const currentVersion = computed(() => {
  const currentPath = normalizedPath.value;
  const prefix = `/${localeCode.value}/`;
  const fallback = versions.value[0] || "";

  if (!currentPath.startsWith(prefix)) {
    return fallback;
  }

  const relativePath = currentPath.slice(prefix.length);
  const pathVersion = relativePath.match(/^([^/]+)/)?.[1] || "";
  return versions.value.includes(pathVersion) ? pathVersion : fallback;
});

const navItems = computed(() => {
  const prefix = `/${localeCode.value}/`;
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

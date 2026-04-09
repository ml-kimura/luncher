<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute } from "vitepress";

const { theme, localeIndex } = useData();
const route = useRoute();

// Get home label from navItems (first item with key "home")
const label = computed(() => {
  const navItems = theme.value.navItems || [];
  const homeItem = navItems.find(
    (item: { key: string }) => item.key === "home"
  );
  return homeItem?.label || "Home";
});

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

const link = computed(() => {
  const prefix = `/${localeIndex.value}/`;
  return `${prefix}${currentVersion.value}/`;
});
</script>

<template>
  <a
    :href="link"
    class="VPNavBarMenuLink"
  >
    {{ label }}
  </a>
</template>

<style scoped>
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
</style>

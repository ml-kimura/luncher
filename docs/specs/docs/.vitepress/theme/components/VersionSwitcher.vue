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

const versionLinks = computed(() => {
  const prefix = `/${localeCode.value}/`;
  const links = versions.value.map((version) => ({
    text: version,
    link: withBase(`${prefix}${version}/`),
    active: version === currentVersion.value,
  }));

  return links.sort((a, b) => {
    if (a.active) return -1;
    if (b.active) return 1;
    return 0;
  });
});
</script>

<template>
  <div class="VPFlyout">
    <button
      type="button"
      class="button"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <span class="text">{{ currentVersion }}</span>
      <svg
        class="icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
      >
        <path
          d="M12,16c-0.3,0-0.5-0.1-0.7-0.3l-6-6c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l5.3,5.3l5.3-5.3c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-6,6C12.5,15.9,12.3,16,12,16z"
          fill="currentColor"
        />
      </svg>
    </button>
    <div class="menu">
      <div class="items">
        <div
          v-for="item in versionLinks"
          :key="item.link"
          class="item"
        >
          <a
            class="link"
            :href="item.link"
            :class="{ active: item.active }"
          >
            <span class="link-text">{{ item.text }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPFlyout {
  position: relative;
}

.VPFlyout:hover .menu,
.button[aria-expanded="true"] + .menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.button {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: var(--vp-nav-height);
  color: var(--vp-c-text-1);
  transition: color 0.5s;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.button:hover {
  color: var(--vp-c-brand-1);
}

.text {
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.icon {
  margin-left: 4px;
  width: 14px;
  height: 14px;
  fill: currentColor;
  transition: transform 0.25s;
}

.VPFlyout:hover .icon {
  transform: rotate(180deg);
}

.menu {
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 20px);
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.25s,
    visibility 0.25s,
    transform 0.25s;
  transform: translateY(-4px);
  z-index: 100;
  pointer-events: none;
}

.VPFlyout:hover .menu {
  pointer-events: auto;
}

.items {
  position: relative;
  border-radius: 12px;
  padding: 12px;
  width: 128px;
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}

.item {
  position: relative;
  border-radius: 8px;
}

.link {
  display: block;
  border-radius: 8px;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition:
    background-color 0.25s,
    color 0.25s;
  text-decoration: none;
}

.link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.link.active {
  /* Removed color to match language dropdown behavior */
  font-weight: 700;
}
</style>

---
layout: page
---

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { VPButton } from 'vitepress/theme'

const route = useRoute()

const params = ref<any>(null)

watch(
  () => route.path,
  () => {
    const p = route.data?.params
    if (p) {
      params.value = p
    }
  },
  { immediate: true }
)

const data = computed(() => {
  if (!params.value?.frontmatter) return null
  try {
    return JSON.parse(params.value.frontmatter)
  } catch (e) {
    console.error('Error parsing frontmatter:', e)
    return null
  }
})
const withBaseUrl = (url: string) => withBase(url)
</script>

<div v-if="data" class="VPHome">
  <div class="VPHero">
    <div class="container">
      <div class="main">
        <h1 class="name">
          <span class="clip">{{ data.hero.name }}</span>
        </h1>
        <p class="text">{{ data.hero.text }}</p>
        <p class="tagline">{{ data.hero.tagline }}</p>
        <div class="actions" v-if="data.hero.actions">
          <div class="action" v-for="action in data.hero.actions" :key="action.link">
            <VPButton tag="a" size="medium" :theme="action.theme" :href="withBaseUrl(action.link)" :text="action.text" />
          </div>
        </div>
      </div>
      <div class="image" v-if="data.hero.image">
        <img class="image-src" :src="withBaseUrl(data.hero.image.src)" :alt="data.hero.name">
      </div>
    </div>
  </div>
  
  <div class="VPFeatures" v-if="data.features && data.features.length">
    <div class="container">
      <div class="items">
        <div class="item" v-for="feature in data.features" :key="feature.link">
          <a :href="withBaseUrl(feature.link)" class="feature-link">
            <article class="VPFeature">
              <div v-if="feature.icon" class="icon" v-html="feature.icon"></div>
              <h2 class="title">{{ feature.title }}</h2>
              <p class="details">{{ feature.details }}</p>
            </article>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<div v-else class="loading">
  Loading...
</div>

<style scoped>
.loading {
  text-align: center;
  padding: 48px;
  font-size: 18px;
  color: var(--vp-c-text-2);
}

.VPHome {
  margin: 0 auto;
  width: 100%;
}

.VPHero {
  position: relative;
  padding: 56px 24px;
}

@media (min-width: 768px) {
  .VPHero {
    padding: 88px 48px 96px;
  }
}

.VPHero .container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1152px;
}

@media (min-width: 960px) {
  .VPHero .container {
    flex-direction: row;
    align-items: center;
  }
}

.VPHero .main {
  position: relative;
  z-index: 10;
  order: 2;
  flex-grow: 1;
  flex-shrink: 0;
}

@media (min-width: 960px) {
  .VPHero .main {
    order: 1;
    width: calc(100% / 2);
  }
}

.VPHero .name {
  max-width: 576px;
  letter-spacing: -0.02em;
  line-height: 40px;
  font-size: 34px;
  font-weight: 700;
  white-space: pre-wrap;
  margin: 0;
}

@media (min-width: 640px) {
  .VPHero .name {
    max-width: 576px;
    line-height: 60px;
    font-size: 52px;
  }
}

@media (min-width: 960px) {
  .VPHero .name {
    line-height: 64px;
    font-size: 60px;
  }
}

.VPHero .clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

.VPHero .text {
  max-width: 576px;
  line-height: 34px;
  font-size: 24px;
  font-weight: 600;
  white-space: pre-wrap;
  color: var(--vp-c-text-1);
  margin: 14px 0 0;
}

@media (min-width: 640px) {
  .VPHero .text {
    max-width: 576px;
    line-height: 46px;
    font-size: 34px;
  }
}

@media (min-width: 960px) {
  .VPHero .text {
    line-height: 52px;
    font-size: 40px;
  }
}

.VPHero .tagline {
  padding-top: 0;
  max-width: 576px;
  line-height: 28px;
  font-size: 17px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
  margin: 14px 0 0;
}

@media (min-width: 640px) {
  .VPHero .tagline {
    max-width: 576px;
    line-height: 30px;
    font-size: 19px;
  }
}

@media (min-width: 960px) {
  .VPHero .tagline {
    line-height: 32px;
    font-size: 20px;
  }
}

.VPHero .actions {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
  padding-top: 30px;
}

.VPHero .action {
  flex-shrink: 0;
  padding: 6px;
}

.VPHero .image {
  order: 1;
  margin: -64px -24px -44px;
}

@media (min-width: 640px) {
  .VPHero .image {
    margin: -96px -24px -44px;
  }
}

@media (min-width: 960px) {
  .VPHero .image {
    flex-grow: 1;
    order: 2;
    margin: 0;
    min-height: 100%;
  }
}

.VPHero .image-src {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 480px;
  height: auto;
}

@media (min-width: 960px) {
  .VPHero .image-src {
    width: 100%;
    max-width: 560px;
  }
}

.VPFeatures {
  position: relative;
  padding: 0 24px 96px;
}

@media (min-width: 768px) {
  .VPFeatures {
    padding: 0 48px 96px;
  }
}

.VPFeatures .container {
  margin: 0 auto;
  max-width: 1152px;
}

.VPFeatures .items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.VPFeatures .item {
  padding: 8px;
  width: 100%;
}

@media (min-width: 640px) {
  .VPFeatures .item {
    width: 50%;
  }
}

@media (min-width: 960px) {
  .VPFeatures .item {
    width: 33.33%;
  }
}

.feature-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.VPFeature {
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
  cursor: pointer;
}

.VPFeature:hover {
  border-color: var(--vp-c-brand-1);
}

.VPFeature .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  width: 48px;
  height: 48px;
  font-size: 24px;
  transition: background-color 0.25s;
}

.VPFeature .title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
}

.VPFeature .details {
  flex-grow: 1;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>

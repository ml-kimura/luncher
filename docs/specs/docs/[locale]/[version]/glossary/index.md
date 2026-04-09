<script setup lang="ts">
import { useRoute, useData, inBrowser } from "vitepress";
import { ref, watch, computed } from "vue";

const route = useRoute();
const { frontmatter, localeIndex, title: siteTitle } = useData();
const params = ref<{
  title: string;
  description: string;
  terms: string;
} | null>(null);

watch(
  () => route.path,
  () => {
    const p = route.data.params;
    if (p) {
      params.value = p as typeof params.value;
      // Update document title
      if (inBrowser && params.value.title) {
        document.title = `${params.value.title} | ${siteTitle.value}`;
      }
    }
  },
  { immediate: true }
);

interface GlossaryTerm {
  word: string;
  synonyms?: string[];
  definition: string;
  i18n?: {
    en?: {
      word: string;
      synonyms?: string[];
      definition: string;
    };
  };
}

const terms = computed(() => {
  if (!params.value?.terms) return [];
  try {
    const parsed = JSON.parse(params.value.terms) as GlossaryTerm[];
    // Get current locale
    const currentLocale = localeIndex.value;
    
    // If current locale is 'en', use i18n.en data, otherwise use default (ja)
    return parsed.map((term) => {
      if (currentLocale === 'en' && term.i18n?.en) {
        return {
          id: term.id,
          word: term.i18n.en.word,
          synonyms: term.i18n.en.synonyms || [],
          definition: term.i18n.en.definition,
        };
      }
      return {
        id: term.id,
        word: term.word,
        synonyms: term.synonyms || [],
        definition: term.definition,
      };
    });
  } catch {
    return [];
  }
});

// Sort terms alphabetically by word
const sortedTerms = computed(() => {
  return [...terms.value].sort((a, b) => {
    return a.word.localeCompare(b.word, localeIndex.value === 'ja' ? 'ja' : 'en');
  });
});
</script>

<div class="glossary-header">
  <div class="glossary-title">{{ $params.title }}</div>
  <p>{{ $params.description }}</p>
</div>

<div v-if="sortedTerms.length > 0" class="glossary-container">
  <div v-for="(term, index) in sortedTerms" :key="`${term.word}-${index}`" class="glossary-term">
    <h2 class="term-word" :id="term.id">{{ term.word }}</h2>
    <div v-if="term.synonyms && term.synonyms.length > 0" class="term-synonyms">
      <strong>同義語:</strong>
      <span v-for="(synonym, index) in term.synonyms" :key="index" class="synonym">
        {{ synonym }}<span v-if="index < term.synonyms.length - 1">, </span>
      </span>
    </div>
    <div class="term-definition">
      <p>{{ term.definition }}</p>
    </div>
  </div>
</div>

<div v-else class="empty-glossary">
  <p><em>用語が登録されていません。</em></p>
</div>

<style scoped>
.glossary-header .glossary-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.glossary-header p {
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
}

.glossary-container {
  margin-top: 2rem;
}

.glossary-term {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
}

.glossary-term:last-child {
  border-bottom: none;
}

.term-word {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.term-synonyms {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.term-synonyms strong {
  margin-right: 0.5rem;
}

.synonym {
  font-style: italic;
}

.term-definition {
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.term-definition p {
  margin: 0;
}

.empty-glossary {
  margin-top: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}
</style>

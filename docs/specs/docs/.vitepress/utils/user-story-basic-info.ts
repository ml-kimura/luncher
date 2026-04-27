import { computed, type Ref } from 'vue';
import type { FieldDef } from '../theme/components/BasicInfo.vue';

type FrontmatterValue = {
  actor?: unknown;
  integrations?: unknown;
};

export function useUserStoryBasicInfo(frontmatter: Ref<FrontmatterValue>) {
  const basicInfoFields: FieldDef[] = [
    { key: 'actor', label: '実行主体' },
    { key: 'integrationsDisplay', label: '連携先' },
  ];

  const basicInfoData = computed<Record<string, string>>(() => ({
    actor: String(frontmatter.value.actor ?? ''),
    integrationsDisplay: Array.isArray(frontmatter.value.integrations)
      ? frontmatter.value.integrations.map(String).join(' / ')
      : String(frontmatter.value.integrations ?? ''),
  }));

  return { basicInfoFields, basicInfoData };
}

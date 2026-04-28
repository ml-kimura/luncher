import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { localeConfigs } from '../../../.vitepress/config';
import { docsDir } from '../../../.vitepress/utils/paths';
import { getVersions } from '../../../.vitepress/utils/versions';

type StoryItem = {
  id: string;
  title: string;
  link: string;
  actor: string;
  integrations: string[];
  screenFlowPath: string;
  batchFlowPath: string;
  apiDesignPath: string;
  /** `outputs` に `db` があるときテーブル定義書（PDM）へ */
  tableDefPath: string;
};

function loadUserStories(dirPath: string, linkBase: string): StoryItem[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const fileName = entry.name.replace(/\.md$/, '');
      const filePath = path.join(dirPath, entry.name);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      const outputs = Array.isArray(data.outputs)
        ? (data.outputs as unknown[]).map((v) => String(v)).filter((v) => v !== '')
        : [];

      return {
        id: String(data.id ?? ''),
        title: String(data.title ?? ''),
        link: `${linkBase}/${fileName}`,
        actor: String(data.actor ?? ''),
        integrations: Array.isArray(data.integrations)
          ? (data.integrations as unknown[]).map((v) => String(v)).filter((v) => v !== '')
          : [],
        screenFlowPath: outputs.includes('screen') ? 'screen/flow/' : '',
        batchFlowPath: outputs.includes('batch') ? 'batch/flow/' : '',
        apiDesignPath: outputs.includes('api') ? 'api/design/' : '',
        tableDefPath: outputs.includes('db') ? 'database/pdm/table/' : '',
      };
    })
    .filter((item) => item.id !== '' && item.title !== '')
    .sort((a, b) => Number(a.id) - Number(b.id));
}

export default {
  async paths() {
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        title: string;
        description: string;
        colUs: string;
        colStory: string;
        colActor: string;
        colIntegration: string;
        colScreenFlow: string;
        colBatchFlow: string;
        colApiDesign: string;
        colTableDef: string;
        items: string;
      };
    }> = [];

    for (const locale of Object.keys(localeConfigs)) {
      const localeConfig = localeConfigs[locale];
      const versions = getVersions(docsDir, locale);
      for (const version of versions) {
        const dirPath = path.resolve(docsDir, locale, version, 'user-stories');
        const linkBase = `/${locale}/${version}/user-stories`;
        const items = loadUserStories(dirPath, linkBase);
        allPaths.push({
          params: {
            locale,
            version,
            title: localeConfig.features?.userStories?.label ?? '',
            description: localeConfig.features?.userStories?.description ?? '',
            colUs: localeConfig.userStoriesUi?.colUs ?? 'US',
            colStory: localeConfig.userStoriesUi?.colStory ?? 'Story',
            colActor: localeConfig.userStoriesUi?.colActor ?? 'Actor',
            colIntegration: localeConfig.userStoriesUi?.colIntegration ?? 'Integration',
            colScreenFlow: localeConfig.userStoriesUi?.colScreenFlow ?? 'Screen Flow',
            colBatchFlow: localeConfig.userStoriesUi?.colBatchFlow ?? 'Batch Flow',
            colApiDesign: localeConfig.userStoriesUi?.colApiDesign ?? 'API Design',
            colTableDef: localeConfig.userStoriesUi?.colTableDef ?? 'Table definitions',
            items: JSON.stringify(items),
          },
        });
      }
    }
    return allPaths;
  },
};

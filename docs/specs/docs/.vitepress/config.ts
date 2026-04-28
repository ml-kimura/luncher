import yamlPlugin from '@rollup/plugin-yaml';
import path from 'path';
import { defineConfig } from 'vitepress';
import { configureDiagramsPlugin } from 'vitepress-plugin-diagrams';
import { defaultLocale } from './constants';
import { localeConfigs } from './locales';
import { discoverOpenApiSpecs, generateOpenApiSidebar, SidebarItem } from './utils/openapi';
import { docsDir } from './utils/paths';
import { createDirGroup, SidebarBuilderContext } from './utils/sidebar/builder';
import { generateDirSidebarItems, generateReleaseNotesSidebarItems } from './utils/sidebar/generators';
import { generateGlossarySidebarItems } from './utils/sidebar/glossary-sidebar';
import { generatePdmSidebarItems } from './utils/sidebar/pdm-sidebar';
import { getVersions } from './utils/versions';

export { localeConfigs };

/**
 * Version lists for each locale
 */
const versions: Record<string, string[]> = {};
Object.keys(localeConfigs).forEach((lang) => {
  versions[lang] = getVersions(docsDir, lang);
});

export default defineConfig({
  base: '/specs/',
  title:
    localeConfigs[defaultLocale].features?.home?.name ?? 'Luncher Specification',
  description:
    localeConfigs[defaultLocale].features?.home?.description ??
    'Luncher Specifications built with VitePress',
  head: [
    [
      'script',
      {},
      "if (!localStorage.getItem('vitepress-theme-appearance')) { localStorage.setItem('vitepress-theme-appearance', 'light'); document.documentElement.classList.remove('dark'); }",
    ],
  ],

  vite: {
    plugins: [yamlPlugin()],
    build: {
      chunkSizeWarningLimit: 3000,
    },
    server: {
      hmr: {
        overlay: false,
      },
      watch: {
        usePolling: false,
      },
      fs: {
        strict: false,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
      },
      force: false,
      include: [],
      exclude: [],
    },
    esbuild: {
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    clearScreen: false,
    resolve: {
      preserveSymlinks: false,
    },
  },

  markdown: {
    config: (md) => {
      configureDiagramsPlugin(md, {
        diagramsDir: 'docs/public/diagrams',
        publicPath: '/specs/diagrams/',
      });
    },
  },

  themeConfig: {
    search: {
      provider: 'local',
    },
  },

  locales: {
    root: {
      label: '',
      lang: localeConfigs[defaultLocale].lang,
      link: `/${defaultLocale}/`,
      title:
        localeConfigs[defaultLocale].features?.home?.name ?? 'Luncher Specification',
      description:
        localeConfigs[defaultLocale].features?.home?.description ??
        'Luncher Specifications built with VitePress',
    },
    ...Object.fromEntries(
      Object.entries(localeConfigs).map(([locale, config]) => {
        const localeVersions = versions[locale] || [];
        const labels = config.sidebarLabels;

        // Build sidebar object for this locale
        const sidebar: Record<string, SidebarItem[]> = {};

        localeVersions.forEach((version) => {
          const base = `/${locale}/${version}`;

          const context: SidebarBuilderContext = {
            locale,
            version,
            base,
            baseDir: path.resolve(docsDir, locale, version),
            labels,
            docsDir,
          };

          // Version index page
          sidebar[`${base}/`] = [];

          // API section
          const apiSidebarItems = generateOpenApiSidebar(version, locale);
          sidebar[`${base}/api/`] = [
            {
              text: labels.api,
              items: [
                { text: labels.overview, link: `${base}/api/` },
                ...apiSidebarItems,
                createDirGroup(
                  context,
                  'api',
                  'design',
                  localeConfigs[locale]?.docSections?.api?.design?.title || 'API Design'
                ),
              ],
            },
          ];

          // API spec pages (/api/${spec.id}/ and /api/${spec.id}/operations/)
          // Each spec page shows sidebar with all API specs, where operations links
          // are generated from the swagger file for that specific spec
          const specs = discoverOpenApiSpecs(version);
          for (const spec of specs) {
            const specSidebarItems: SidebarItem[] = [
              {
                text: labels.api,
                items: [
                  { text: labels.overview, link: `${base}/api/` },
                  ...apiSidebarItems,
                  createDirGroup(
                    context,
                    'api',
                    'design',
                    localeConfigs[locale]?.docSections?.api?.design?.title || 'API Design'
                  ),
                ],
              },
            ];
            sidebar[`${base}/api/${spec.id}/`] = specSidebarItems;
            sidebar[`${base}/api/${spec.id}/operations/`] = specSidebarItems;
          }

          // Screen section
          sidebar[`${base}/screen/`] = [
            {
              text: labels.screen,
              items: [
                { text: labels.overview, link: `${base}/screen/` },
                createDirGroup(context, 'screen', 'flow', labels.screenFlow),
                createDirGroup(context, 'screen', 'design', labels.screenDesign),
                {
                  text: labels.screenMessages,
                  link: `${base}/screen/messages`,
                },
              ],
            },
          ];

          // User Stories section
          if (labels.userStories) {
            const userStoryItems = generateDirSidebarItems(
              path.resolve(docsDir, locale, version, 'user-stories'),
              `${base}/user-stories`,
              { prefixWithUsId: true }
            ).filter((item) => !(item.link ?? '').endsWith('/index'));
            sidebar[`${base}/user-stories/`] = [
              {
                text: labels.userStories,
                items: [
                  { text: labels.overview, link: `${base}/user-stories/` },
                  ...userStoryItems,
                ],
              },
            ];
          }

          // Batch section
          sidebar[`${base}/batch/`] = [
            {
              text: labels.batch,
              items: [
                { text: labels.overview, link: `${base}/batch/` },
                createDirGroup(context, 'batch', 'flow', labels.batchFlow),
                createDirGroup(context, 'batch', 'design', labels.batchDesign),
                {
                  text: labels.batchMessages,
                  link: `${base}/batch/messages`,
                },
              ],
            },
          ];

          // Database sections
          sidebar[`${base}/database/`] = [
            {
              text: labels.database,
              items: [
                { text: labels.overview, link: `${base}/database/` },
                { text: labels.databaseCdm, link: `${base}/database/cdm.md` },
                {
                  text: labels.databasePdm,
                  collapsed: false,
                  items: generatePdmSidebarItems(docsDir, version, locale),
                },
              ],
            },
          ];

          // Infrastructure section
          sidebar[`${base}/infrastructure/`] = [
            {
              text: labels.infrastructure,
              items: [
                {
                  text: labels.overview,
                  link: `${base}/infrastructure/`,
                },
              ],
            },
            {
              text: 'ハイレベル・アーキテクチャー',
              items: [
                {
                  text: 'システム関連図',
                  link: `${base}/infrastructure/system-diagram.md`,
                },
                {
                  text: 'データフロー',
                  link: `${base}/infrastructure/data-flow-diagram.md`,
                },
              ],
            },
            {
              text: 'デプロイ・アーキテクチャー',
              items: [
                {
                  text: 'インフラ構成',
                  link: `${base}/infrastructure/infrastructre-diagram.md`,
                },
                {
                  text: 'ネットワーク',
                  link: `${base}/infrastructure/network.md`,
                },
                {
                  text: 'ストレージ',
                  link: `${base}/infrastructure/storage.md`,
                },
                {
                  text: 'データベース',
                  link: `${base}/infrastructure/database.md`,
                },
                {
                  text: 'セキュリティ',
                  link: `${base}/infrastructure/security.md`,
                },
                {
                  text: '監視',
                  link: `${base}/infrastructure/monitor.md`,
                },
                {
                  text: 'バックアップ',
                  link: `${base}/infrastructure/backup.md`,
                },
                {
                  text: 'CI/CD',
                  link: `${base}/infrastructure/ci-cd.md`,
                },
                {
                  text: '環境',
                  link: `${base}/infrastructure/environment.md`,
                },
                {
                  text: 'コスト管理',
                  link: `${base}/infrastructure/cost-management.md`,
                },
              ],
            },
          ];

          // Glossary section
          const glossaryItems = generateGlossarySidebarItems(docsDir, version, locale);
          sidebar[`${base}/glossary/`] = [
            {
              text: labels.glossary,
              items: [{ text: labels.overview, link: `${base}/glossary/` }],
            },
            ...glossaryItems,
          ];

          // History section with release notes
          sidebar[`${base}/history/`] = [
            {
              text: labels.history,
              items: [
                { text: labels.overview, link: `${base}/history/` },
                ...generateReleaseNotesSidebarItems(
                  path.resolve(docsDir, locale, version, 'history'),
                  `${base}/history`
                ),
              ],
            },
          ];
        });

        return [
          locale,
          {
            label: config.label,
            lang: config.lang,
            title: config.features?.home?.name ?? 'Luncher Specification',
            description:
              config.features?.home?.description ??
              'Luncher Specifications built with VitePress',
            themeConfig: {
              nav: [{ component: 'MainNav' }, { component: 'VersionSwitcher' }],
              sidebar,
              footer: config.footer,
              versions: versions[locale],
              navItems: config.navItems,
              docSections: config.docSections,
              openapiMessages: config.openapiMessages,
              featureDescriptions: config.featureDescriptions,
            },
          },
        ];
      })
    ),
  },
});

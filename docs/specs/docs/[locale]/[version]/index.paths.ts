import { localeConfigs } from '../../.vitepress/config';
import { docsDir } from '../../.vitepress/utils/paths';
import { getVersions } from '../../.vitepress/utils/versions';

export default {
  async paths() {
    const paths = [];

    for (const locale of Object.keys(localeConfigs)) {
      const versions = getVersions(docsDir, locale);
      const config = localeConfigs[locale];

      if (!config || !config.features) {
        continue;
      }

      for (const version of versions) {
        const features = [];
        for (const key of Object.keys(config.features)) {
          const f = config.features[key];
          if (f && f.icon) {
            features.push({
              icon: f.icon,
              title: config.docSections?.[key]?.design?.title || f.label,
              details: f.description,
              link: `/${locale}/${version}/${f.path}/`,
            });
          }
        }

        const frontmatter = {
          layout: 'home',
          hero: {
            name: config.features.home?.name,
            text: config.features.home?.text || config.features.home?.name,
            tagline: config.features.home?.description || '',
            image: {
              src: '/cover.png',
            },
            actions: [
              {
                theme: 'brand',
                text: config.features.history?.label || 'History',
                link: `/${locale}/${version}/${config.features.history?.path || 'history'}/`,
              },
            ],
          },
          features: features,
        };

        paths.push({
          params: {
            locale,
            version,
            frontmatter: JSON.stringify(frontmatter),
          },
        });
      }
    }
    return paths;
  },
};

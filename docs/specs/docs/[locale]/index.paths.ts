import { localeConfigs } from '../.vitepress/config';

export default {
  async paths() {
    // Generate paths for all locales
    const allLocales = Object.keys(localeConfigs);

    return allLocales.map((locale) => ({
      params: {
        locale: locale,
      },
    }));
  },
};

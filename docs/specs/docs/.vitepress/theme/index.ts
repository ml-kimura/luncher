import type { Theme } from 'vitepress';
import { useData } from 'vitepress';
import { theme, useTheme } from 'vitepress-openapi/client';
import 'vitepress-openapi/dist/style.css';
import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';
import BasicInfo from './components/BasicInfo.vue';
import DocList from './components/DocList.vue';
import InternalLink from './components/InternalLink.vue';
import MainNav from './components/MainNav.vue';
import NavBarLink from './components/NavBarLink.vue';
import OperationLayout from './components/OperationLayout.vue';
import UserStoryPage from './components/UserStoryPage.vue';
import UserStoryTitle from './components/UserStoryTitle.vue';
import VersionSwitcher from './components/VersionSwitcher.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    theme.enhanceApp(ctx);

    // Register custom components
    ctx.app.component('BasicInfo', BasicInfo);
    ctx.app.component('DocList', DocList);
    ctx.app.component('VersionSwitcher', VersionSwitcher);
    ctx.app.component('MainNav', MainNav);
    ctx.app.component('NavBarLink', NavBarLink);
    ctx.app.component('OperationLayout', OperationLayout);
    ctx.app.component('InternalLink', InternalLink);
    ctx.app.component('UserStoryPage', UserStoryPage);
    ctx.app.component('UserStoryTitle', UserStoryTitle);
  },
  setup() {
    const { site, localeIndex } = useData();

    // Build i18n messages from all locale configs
    const buildI18nMessages = () => {
      const messages: Record<string, Record<string, string>> = {};
      const locales = site.value.locales || {};

      for (const [key, localeConfig] of Object.entries(locales)) {
        const config = localeConfig as {
          lang?: string;
          themeConfig?: { openapiMessages?: Record<string, string> };
        };
        const lang = config.lang || key;
        const openapiMessages = config.themeConfig?.openapiMessages;
        if (openapiMessages) {
          messages[lang] = openapiMessages;
        }
      }

      return messages;
    };

    // Configure vitepress-openapi theme
    const configureTheme = () => {
      const messages = buildI18nMessages();
      const currentLocale = site.value.locales?.[localeIndex.value] as
        | { lang?: string }
        | undefined;
      // Use lang from locale config, or fallback to localeIndex (which is always a valid locale key)
      const currentLang = currentLocale?.lang || localeIndex.value;

      useTheme({
        operation: {
          cols: 1,
          hiddenSlots: ['playground', 'code-samples', 'branding'],
        },
        i18n: {
          locale: currentLang,
          messages,
        },
      });
    };

    // Initial configuration
    configureTheme();

    // Update when locale changes
    watch(localeIndex, () => {
      configureTheme();
    });
  },
} satisfies Theme;

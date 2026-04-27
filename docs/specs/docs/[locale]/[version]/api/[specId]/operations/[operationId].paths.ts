import { localeConfigs } from '../../../../../.vitepress/config';
import { discoverOpenApiSpecs } from '../../../../../.vitepress/utils/openapi';
import { docsDir } from '../../../../../.vitepress/utils/paths';
import { getVersions } from '../../../../../.vitepress/utils/versions';

interface OpenAPISpec {
  paths?: Record<string, Record<string, { operationId?: string; summary?: string }>>;
}

interface Operation {
  operationId: string;
  summary: string;
  method: string;
  path: string;
}

function getOperationsFromSpec(spec: OpenAPISpec | null): Operation[] {
  if (!spec) {
    return [];
  }

  const operations: Operation[] = [];
  const paths = spec.paths || {};

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    for (const method of ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']) {
      const operation = pathItem[method];
      if (operation && operation.operationId) {
        operations.push({
          operationId: operation.operationId,
          summary: operation.summary || operation.operationId,
          method: method.toUpperCase(),
          path: pathKey,
        });
      }
    }
  }

  return operations;
}

export default {
  async paths() {
    const allPaths: Array<{
      params: {
        locale: string;
        version: string;
        specId: string;
        operationId: string;
        pageTitle: string;
        spec: string;
      };
    }> = [];

    const allLocales = Object.keys(localeConfigs);

    for (const locale of allLocales) {
      const localeVersions = getVersions(docsDir, locale);
      for (const version of localeVersions) {
        const specs = discoverOpenApiSpecs(version);

        for (const specInfo of specs) {
          const operations = getOperationsFromSpec(specInfo.spec as OpenAPISpec);

          for (const op of operations) {
            allPaths.push({
              params: {
                locale: locale,
                version: version,
                specId: specInfo.id,
                operationId: op.operationId,
                pageTitle: op.summary,
                spec: JSON.stringify(specInfo.spec),
              },
            });
          }
        }
      }
    }

    return allPaths;
  },
};

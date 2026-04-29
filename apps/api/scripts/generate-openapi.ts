import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import prettier from 'prettier';
import { stringify } from 'yaml';
import { createApp } from '../src/app.js';

const app = createApp();

const openapiVersion = process.env.OPENAPI_VERSION?.trim() || '1.0.0';

const doc = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: {
    title: 'Luncher API',
    version: openapiVersion,
  },
});

const outputDir = resolve(process.cwd(), '..', '..', 'docs', 'specs', 'docs', 'public', 'openapi');
const outputPath = resolve(outputDir, 'openapi-app.yml');
const yamlOutput = stringify(doc);
const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
const formattedYaml = await prettier.format(yamlOutput, {
  ...prettierConfig,
  filepath: outputPath,
  parser: 'yaml',
});

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, formattedYaml, 'utf-8');

process.stdout.write(`OpenAPI YAML generated: ${outputPath}\n`);

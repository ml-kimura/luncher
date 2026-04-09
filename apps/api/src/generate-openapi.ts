import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createApp } from "./app.js";
import { stringify } from "yaml";

const app = createApp();

const doc = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: {
    title: "Luncher API",
    version: "1.0.0",
  },
});

const outputDir = resolve(process.cwd(), "..", "..", "docs", "specs", "public", "openapi");
const outputPath = resolve(outputDir, "openapi-app.yml");

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, stringify(doc), "utf-8");

process.stdout.write(`OpenAPI YAML generated: ${outputPath}\n`);

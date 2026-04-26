#!/usr/bin/env npx tsx
/**
 * Build the embeddings index for all registered templates.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/build-embeddings.ts
 *
 * Options:
 *   --scraped-dir <path>   Path to scraped templates dir (default: templates/scraped)
 *
 * Reads:
 *   - templates/ (built-in templates with meta.json)
 *   - templates/scraped/registry.json (scraped templates)
 *
 * Writes:
 *   - embeddings/embeddings.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TemplateRegistry } from "../src/template-registry.js";
import { TemplateRetriever } from "../src/template-retriever.js";
import { HuggingFaceEmbeddingAdapter } from "../src/embedding-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function main() {
  const apiToken = process.env.HF_TOKEN;
  if (!apiToken) {
    console.error("Error: HF_TOKEN environment variable is required");
    process.exit(1);
  }

  console.log("Setting up registry...");
  const registry = new TemplateRegistry(path.join(rootDir, "templates"));

  // Register scraped templates if available
  const scrapedFlagIndex = process.argv.findIndex(
    (value) => value === "--scraped-dir"
  );
  const scrapedArg =
    scrapedFlagIndex >= 0 ? process.argv[scrapedFlagIndex + 1] : undefined;
  const scrapedDir =
    process.env.SCRAPED_DIR ||
    scrapedArg ||
    path.join(rootDir, "templates", "scraped");
  const scrapedRegistryPath = path.join(scrapedDir, "registry.json");

  if (fs.existsSync(scrapedRegistryPath)) {
    registry.registerScrapedDir(scrapedRegistryPath);
    console.log("Registered scraped templates from", scrapedRegistryPath);
  } else {
    console.log("No scraped registry.json found at", scrapedRegistryPath);
  }

  const templates = registry.list();
  console.log(`Found ${templates.length} templates total`);

  if (templates.length === 0) {
    console.error("No templates found. Nothing to embed.");
    process.exit(1);
  }

  console.log("Creating embedding adapter (HuggingFace all-MiniLM-L6-v2)...");
  const adapter = new HuggingFaceEmbeddingAdapter({ apiToken });

  console.log("Building embedding index...");
  const retriever = new TemplateRetriever({
    registry,
    embeddingAdapter: adapter,
  });

  await retriever.buildIndex();

  const outputPath = path.join(rootDir, "embeddings", "embeddings.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await retriever.saveEmbeddings(outputPath);

  console.log(`Saved embeddings to ${outputPath}`);
  console.log("Done!");
}

main().catch((err) => {
  console.error("Failed to build embeddings:", err);
  process.exit(1);
});

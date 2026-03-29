#!/usr/bin/env npx tsx
/**
 * Build the embeddings index for all registered templates.
 *
 * Usage:
 *   GROQ_API_KEY=gsk_... npx tsx scripts/build-embeddings.ts
 *
 * Reads:
 *   - templates/ (built-in templates with meta.json)
 *   - templates/scraped/registry.json (scraped templates)
 *
 * Writes:
 *   - embeddings/embeddings.json
 */

import path from "path";
import { fileURLToPath } from "url";
import { TemplateRegistry } from "../src/template-registry.js";
import { TemplateRetriever } from "../src/template-retriever.js";
import { GroqEmbeddingAdapter } from "../src/embedding-adapter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("Error: GROQ_API_KEY environment variable is required");
    process.exit(1);
  }

  console.log("Setting up registry...");
  const registry = new TemplateRegistry(path.join(rootDir, "templates"));

  // Register scraped templates if available
  const scrapedRegistryPath = path.join(
    rootDir,
    "templates",
    "scraped",
    "registry.json"
  );

  try {
    registry.registerScrapedDir(scrapedRegistryPath);
    console.log("Registered scraped templates from registry.json");
  } catch {
    console.log("No scraped templates found (skipping)");
  }

  const templates = registry.list();
  console.log(`Found ${templates.length} templates total`);

  console.log("Creating embedding adapter (Groq)...");
  const adapter = new GroqEmbeddingAdapter({ apiKey });

  console.log("Building embedding index...");
  const retriever = new TemplateRetriever({
    registry,
    embeddingAdapter: adapter,
  });

  await retriever.buildIndex();

  const outputPath = path.join(rootDir, "embeddings", "embeddings.json");
  await retriever.saveEmbeddings(outputPath);

  console.log(`Saved embeddings to ${outputPath}`);
  console.log("Done!");
}

main().catch((err) => {
  console.error("Failed to build embeddings:", err);
  process.exit(1);
});

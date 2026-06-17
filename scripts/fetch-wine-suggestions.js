#!/usr/bin/env node

/**
 * Fetches wine suggestions from Vinmonopolet API and assigns one per recipe.
 *
 * Setup:
 *   1. Register at https://apis.vinmonopolet.no/ and create a subscription
 *   2. Add your key to .env:  VINMONOPOLET_API_KEY=your_key_here
 *   3. Run: npm run fetch-wine
 *
 * Output: src/data/wine_suggestions.json (gitignored, generated at build time)
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECIPES_PATH = path.join(__dirname, "../src/data/recipes.json");
const OUTPUT_PATH = path.join(__dirname, "../src/data/wine_suggestions.json");

const API_KEY = process.env.VINMONOPOLET_API_KEY;
const API_BASE = "https://apis.vinmonopolet.no/products/v0/details-normal";

// Fetch products at offsets where actual wines live (accessories have low IDs)
const WINE_FETCH_CONFIG = [
  { start: 4000, count: 50 },
  { start: 6000, count: 50 },
  { start: 9000, count: 50 },
];

/**
 * Categorize a wine by its name since the API doesn't provide category data.
 */
function categorizeWineByName(name) {
  const n = name.toLowerCase();

  // Musserende (sparkling)
  if (/brut|prosecco|champagne|cava|crem[ao]nt|sekt|spumante|p[eé]tillant|mousseux|franciacorta|lambrusco/.test(n)) {
    return "MUSSERENDE";
  }

  // Hvitvin (white) — common white grape varieties and regions
  if (/riesling|chardonnay|sauvignon|pinot\s*gris|pinot\s*grigio|blanc|chablis|albarino|albari[ñn]o|gruner|grüner|muscat|muscadet|viognier|vermentino|soave|gavi|gewurz|verdejo|grenache\s*blanc|roussanne|marsanne|torrontes|falanghina|fiano|greco|verdicchio/.test(n)) {
    return "HVIT";
  }

  // Rosé
  if (/ros[eé]/.test(n) && !/brut/.test(n)) {
    return "ROSE";
  }

  // Default: rødvin
  return "ROED";
}

/**
 * Determine which wine category fits a recipe best.
 */
function getWineCategoryForRecipe(recipe) {
  const keywords = (recipe.keywords || []).map((k) => k.toLowerCase());
  const text = [recipe.title, recipe.description, recipe.category, ...keywords]
    .join(" ")
    .toLowerCase();

  // Dessert / søtt → musserende
  if (keywords.some((k) => ["dessert", "kake", "søtt", "iskrem", "sjokolade", "is"].includes(k))) {
    return "MUSSERENDE";
  }

  // Fisk og sjømat → hvitvin
  if (/fisk|sjømat|laks|ørret|torsk|reker|krabbe|skalldyr|klippfisk|skrei|sjøkreps|kamskjell|blekksprut|kveite|sei/.test(text)) {
    return "HVIT";
  }

  // Svin (lett) / kylling / pasta → hvitvin eller rosé
  if (/pasta|kylling|fisk|reker/.test(text)) {
    return "HVIT";
  }

  // Rødt kjøtt / vilt → rødvin
  if (/biff|lam|hjort|vilt|entrecôte|entrecote|okse|gryte|ribbe|ribeye|mørbrad|steak|rein|elg/.test(text)) {
    return "ROED";
  }

  // Vegetarmat → hvitvin
  if (keywords.includes("vegetar") || keywords.includes("pescetar")) {
    return "HVIT";
  }

  // Default → rødvin
  return "ROED";
}

/**
 * Fetch a batch of products from the API.
 */
async function fetchBatch(start, count) {
  const url = new URL(API_BASE);
  url.searchParams.set("maxResults", String(count));
  url.searchParams.set("start", String(start));

  const response = await fetch(url.toString(), {
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API feil: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Pick a wine from a pool deterministically based on recipe ID.
 * Same recipe always gets the same wine from the pool.
 */
function pickWine(pool, recipeId) {
  if (!pool || pool.length === 0) return null;
  let hash = 0;
  for (const char of recipeId) hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  return pool[Math.abs(hash) % pool.length];
}

async function main() {
  if (!API_KEY) {
    console.log("⚠️  VINMONOPOLET_API_KEY ikke satt i .env — hopper over vintips fra API");
    if (!fs.existsSync(OUTPUT_PATH)) {
      await fs.writeJson(OUTPUT_PATH, {}, { spaces: 2 });
    }
    return;
  }

  const recipes = await fs.readJson(RECIPES_PATH);

  // Fetch wine products from the API (high offsets = actual wines, not accessories)
  console.log("🍷 Henter viner fra Vinmonopolet...");
  const allProducts = [];

  for (const { start, count } of WINE_FETCH_CONFIG) {
    try {
      const batch = await fetchBatch(start, count);
      allProducts.push(...batch);
      console.log(`  → offset ${start}: ${batch.length} produkter`);
    } catch (err) {
      console.error(`  ❌ Feil ved offset ${start}: ${err.message}`);
    }
  }

  // Categorize wines by name
  const pools = { ROED: [], HVIT: [], MUSSERENDE: [], ROSE: [] };

  for (const product of allProducts) {
    const name = product.basic?.productShortName;
    const id = product.basic?.productId;
    if (!name || !id) continue;

    const category = categorizeWineByName(name);
    pools[category].push({
      name,
      url: `https://www.vinmonopolet.no/search?q=${id}`,
    });
  }

  console.log(`\nFordeling: Rød=${pools.ROED.length}, Hvit=${pools.HVIT.length}, Musserende=${pools.MUSSERENDE.length}, Rosé=${pools.ROSE.length}`);

  // Fall back: if a category pool is empty, use ROED
  if (pools.HVIT.length === 0) pools.HVIT = pools.ROED;
  if (pools.MUSSERENDE.length === 0) pools.MUSSERENDE = pools.ROED;
  if (pools.ROSE.length === 0) pools.ROSE = pools.HVIT;

  // Assign one wine per recipe
  const suggestions = {};
  recipes.forEach((recipe) => {
    const category = getWineCategoryForRecipe(recipe);
    const wine = pickWine(pools[category], recipe.id);
    if (wine) {
      suggestions[recipe.id] = wine;
    }
  });

  await fs.writeJson(OUTPUT_PATH, suggestions, { spaces: 2 });
  console.log(`✅ Lagret vintips for ${Object.keys(suggestions).length} oppskrifter`);
}

main().catch((err) => {
  console.error("❌ Feil:", err.message);
  process.exit(1);
});

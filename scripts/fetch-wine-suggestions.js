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
const POOL_SIZE = 30; // wines to fetch per category

// Vinmonopolet category codes — verify at apis.vinmonopolet.no if they change
const CATEGORIES = {
  ROED_VIN: "Rødvin",
  HVIT_VIN: "Hvitvin",
  MUSSERENDE_VIN: "Musserende",
  ALKOHOLFRITT: "Alkoholfritt",
};

/**
 * Determine which wine category fits a recipe best.
 */
function getWineCategory(recipe) {
  const keywords = (recipe.keywords || []).map((k) => k.toLowerCase());
  const text = [
    recipe.title,
    recipe.description,
    recipe.category,
    ...keywords,
  ]
    .join(" ")
    .toLowerCase();

  // Dessert / søtt → musserende
  if (
    keywords.some((k) => ["dessert", "kake", "søtt", "iskrem", "sjokolade", "is"].includes(k))
  ) {
    return "MUSSERENDE_VIN";
  }

  // Fisk og sjømat → hvitvin
  if (
    /fisk|sjømat|laks|ørret|torsk|reker|krabbe|skalldyr|klippfisk|skrei|sjøkreps|kamskjell|blekksprut|kveite|sei/.test(
      text
    )
  ) {
    return "HVIT_VIN";
  }

  // Rødt kjøtt / vilt → rødvin
  if (
    /biff|lam|hjort|vilt|entrecôte|entrecote|okse|gryte|ribbe|ribeye|mørbrad|steak|rein|elg/.test(
      text
    )
  ) {
    return "ROED_VIN";
  }

  // Vegetarmat → hvitvin
  if (keywords.includes("vegetar") || keywords.includes("pescetar")) {
    return "HVIT_VIN";
  }

  // Cocktail / drikke → musserende
  if (
    keywords.some((k) => ["cocktail", "drikke", "drink", "aperitif"].includes(k))
  ) {
    return "MUSSERENDE_VIN";
  }

  // Standard fallback
  return "ROED_VIN";
}

/**
 * Fetch a pool of wines for a given category from Vinmonopolet API.
 */
async function fetchWinePool(categoryCode) {
  const url = new URL(API_BASE);
  url.searchParams.set("maxResults", String(POOL_SIZE));
  url.searchParams.set("start", "0");
  url.searchParams.set("mainCategory.code", categoryCode);
  // Only fetch wines that are available in stores
  url.searchParams.set("facets", "mainCategory.code");

  const response = await fetch(url.toString(), {
    headers: {
      "Ocp-Apim-Subscription-Key": API_KEY,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Vinmonopolet API feil for ${categoryCode}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return (data || []).map((product) => ({
    name: product.basic?.productShortName || product.basic?.productLongName || "Ukjent",
    url: `https://www.vinmonopolet.no${product.basic?.url || ""}`,
    category: categoryCode,
  }));
}

/**
 * Pick a wine from a pool deterministically based on recipe ID.
 * Same recipe always gets the same wine from the pool.
 */
function pickWine(pool, recipeId) {
  if (!pool || pool.length === 0) return null;
  // Simple hash of recipe ID to pick consistently
  let hash = 0;
  for (const char of recipeId) hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  return pool[Math.abs(hash) % pool.length];
}

async function main() {
  if (!API_KEY) {
    console.log("⚠️  VINMONOPOLET_API_KEY ikke satt i .env — hopper over vintips fra API");
    console.log("   Legg til: VINMONOPOLET_API_KEY=din_nøkkel i .env-filen");

    // Write empty suggestions so the site still builds
    if (!fs.existsSync(OUTPUT_PATH)) {
      await fs.writeJson(OUTPUT_PATH, {}, { spaces: 2 });
    }
    return;
  }

  const recipes = await fs.readJson(RECIPES_PATH);

  // Group recipes by wine category
  const recipesByCategory = {};
  recipes.forEach((recipe) => {
    const category = getWineCategory(recipe);
    if (!recipesByCategory[category]) recipesByCategory[category] = [];
    recipesByCategory[category].push(recipe);
  });

  const neededCategories = Object.keys(recipesByCategory);
  console.log(`🍷 Henter vin fra ${neededCategories.length} kategorier...`);

  // Fetch pools for each needed category
  const pools = {};
  for (const category of neededCategories) {
    try {
      console.log(`  → ${CATEGORIES[category] || category}`);
      pools[category] = await fetchWinePool(category);
      console.log(`     ✅ ${pools[category].length} viner hentet`);
    } catch (err) {
      console.error(`     ❌ ${err.message}`);
      pools[category] = [];
    }
  }

  // Assign one wine per recipe
  const suggestions = {};
  recipes.forEach((recipe) => {
    const category = getWineCategory(recipe);
    const wine = pickWine(pools[category], recipe.id);
    if (wine) {
      suggestions[recipe.id] = wine;
    }
  });

  await fs.writeJson(OUTPUT_PATH, suggestions, { spaces: 2 });
  console.log(`\n✅ Lagret vintips for ${Object.keys(suggestions).length} oppskrifter → src/data/wine_suggestions.json`);
}

main().catch((err) => {
  console.error("❌ Feil:", err.message);
  process.exit(1);
});

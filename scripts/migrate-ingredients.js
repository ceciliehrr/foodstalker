#!/usr/bin/env node

/**
 * Migration script to improve ingredient data structure
 * Separates ingredient names from descriptions for better matching
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the recipes data file
const RECIPES_FILE = path.join(__dirname, "../src/data/new_recipes.json");

/**
 * Parse ingredient name and extract main name and details
 * @param {string} fullName - The full ingredient name
 * @returns {object} - Object with name and details
 */
function parseIngredientName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { name: fullName || "", details: "" };
  }

  // Handle common patterns
  const patterns = [
    // Pattern: "name, description" (most common)
    /^([^,]+),\s*(.+)$/,
    // Pattern: "name (description)"
    /^([^(]+)\s*\(([^)]+)\)$/,
    // Pattern: "name - description"
    /^([^-]+)\s*-\s*(.+)$/,
    // Pattern: "name til description"
    /^([^,]+)\s+til\s+(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = fullName.match(pattern);
    if (match) {
      return {
        name: match[1].trim(),
        details: match[2].trim(),
      };
    }
  }

  // If no pattern matches, return the original name
  return { name: fullName.trim(), details: "" };
}

/**
 * Clean up ingredient name by removing common prefixes
 * @param {string} name - The ingredient name
 * @returns {string} - Cleaned name
 */
function cleanIngredientName(name) {
  return name
    .replace(
      /^(fersk|tørr|hel|hakket|fin|grov|flytende|røkt|kald|varm|stor|liten)\s+/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Migrate a single recipe's ingredients
 * @param {object} recipe - The recipe object
 * @returns {object} - Updated recipe with migrated ingredients
 */
function migrateRecipeIngredients(recipe) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return recipe;
  }

  const migratedIngredients = recipe.ingredients.map((group) => {
    if (!group.ingredients || !Array.isArray(group.ingredients)) {
      return group;
    }

    const migratedGroupIngredients = group.ingredients.map((ingredient) => {
      const { name, details } = parseIngredientName(ingredient.name);

      return {
        ...ingredient,
        name: cleanIngredientName(name),
        details: details,
      };
    });

    return {
      ...group,
      ingredients: migratedGroupIngredients,
    };
  });

  return {
    ...recipe,
    ingredients: migratedIngredients,
  };
}

/**
 * Main migration function
 */
function migrateIngredients() {
  try {
    console.log("🔄 Starting ingredient migration...");

    // Read the current recipes file
    const recipesData = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf8"));
    console.log(`📊 Found ${recipesData.length} recipes to process`);

    // Create backup
    const backupFile = RECIPES_FILE.replace(".json", "_backup.json");
    fs.writeFileSync(backupFile, JSON.stringify(recipesData, null, 2));
    console.log(`💾 Created backup: ${backupFile}`);

    // Migrate all recipes
    let migratedCount = 0;
    let totalIngredients = 0;
    let ingredientsWithDetails = 0;

    const migratedRecipes = recipesData.map((recipe) => {
      const originalIngredients = JSON.stringify(recipe.ingredients);
      const migratedRecipe = migrateRecipeIngredients(recipe);

      if (originalIngredients !== JSON.stringify(migratedRecipe.ingredients)) {
        migratedCount++;

        // Count ingredients with details
        if (migratedRecipe.ingredients) {
          migratedRecipe.ingredients.forEach((group) => {
            if (group.ingredients) {
              group.ingredients.forEach((ingredient) => {
                totalIngredients++;
                if (ingredient.details) {
                  ingredientsWithDetails++;
                }
              });
            }
          });
        }
      }

      return migratedRecipe;
    });

    // Write the migrated data
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(migratedRecipes, null, 2));

    console.log("✅ Migration completed successfully!");
    console.log(`📈 Statistics:`);
    console.log(`   - Recipes processed: ${recipesData.length}`);
    console.log(`   - Recipes with changes: ${migratedCount}`);
    console.log(`   - Total ingredients: ${totalIngredients}`);
    console.log(`   - Ingredients with details: ${ingredientsWithDetails}`);
    console.log(
      `   - Migration rate: ${(
        (ingredientsWithDetails / totalIngredients) *
        100
      ).toFixed(1)}%`
    );

    // Show some examples
    console.log("\n📝 Example migrations:");
    const examples = migratedRecipes
      .filter((recipe) => recipe.ingredients)
      .flatMap((recipe) => recipe.ingredients)
      .flatMap((group) => group.ingredients || [])
      .filter((ingredient) => ingredient.details)
      .slice(0, 5);

    examples.forEach((ingredient) => {
      console.log(`   "${ingredient.name}" (${ingredient.details})`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateIngredients();
}

export { migrateIngredients, parseIngredientName, cleanIngredientName };

#!/usr/bin/env node

/**
 * Script to convert fractions in ingredient quantities to decimals
 * for data consistency (e.g., "1/2 dl" -> "0.5 dl", "1/2-1 dl" -> "0.5-1 dl")
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the recipes data file
const RECIPES_FILE = path.join(__dirname, "../src/data/recipes.json");

/**
 * Convert a fraction string to decimal
 * @param {string} fraction - Fraction string like "1/2", "3/4"
 * @returns {number} - Decimal value
 */
function fractionToDecimal(fraction) {
  const [numerator, denominator] = fraction.split("/").map(Number);
  return numerator / denominator;
}

/**
 * Format decimal to string with appropriate precision
 * @param {number} value - Decimal value
 * @returns {string} - Formatted string
 */
function formatDecimal(value) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

/**
 * Convert quantity string with fractions to decimals
 * @param {string} quantity - Quantity string like "1/2 dl", "1/2-1 dl"
 * @returns {string} - Converted quantity string
 */
function convertQuantity(quantity) {
  if (!quantity || typeof quantity !== "string") {
    return quantity;
  }

  // Handle ranges with fractions (e.g., "1/2-1 dl", "1/4-2 stk")
  const rangeWithFractionMatch = quantity.match(
    /(\d+\/\d+)\s*-\s*([\d.]+)\s*([^\d\s\/-]+)/
  );
  if (rangeWithFractionMatch) {
    const fraction = rangeWithFractionMatch[1];
    const secondValue = rangeWithFractionMatch[2];
    const unit = rangeWithFractionMatch[3];

    const decimalValue = fractionToDecimal(fraction);
    const formattedFirst = formatDecimal(decimalValue);
    const formattedSecond = formatDecimal(parseFloat(secondValue));

    return `${formattedFirst}-${formattedSecond} ${unit}`;
  }

  // Handle simple fractions (e.g., "1/2 dl", "1/4 stk")
  const fractionMatch = quantity.match(/(\d+\/\d+)\s*([^\d\s\/-]+)/);
  if (fractionMatch) {
    const fraction = fractionMatch[1];
    const unit = fractionMatch[2];

    const decimalValue = fractionToDecimal(fraction);
    const formattedValue = formatDecimal(decimalValue);

    return `${formattedValue} ${unit}`;
  }

  // No fraction found, return original
  return quantity;
}

/**
 * Convert fractions in a recipe's ingredients
 * @param {object} recipe - The recipe object
 * @returns {object} - Updated recipe
 */
function convertRecipeFractions(recipe) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return recipe;
  }

  const convertedIngredients = recipe.ingredients.map((group) => {
    if (!group.ingredients || !Array.isArray(group.ingredients)) {
      return group;
    }

    const convertedGroupIngredients = group.ingredients.map((ingredient) => {
      if (!ingredient.quantity) {
        return ingredient;
      }

      const convertedQuantity = convertQuantity(ingredient.quantity);
      return {
        ...ingredient,
        quantity: convertedQuantity,
      };
    });

    return {
      ...group,
      ingredients: convertedGroupIngredients,
    };
  });

  return {
    ...recipe,
    ingredients: convertedIngredients,
  };
}

/**
 * Main conversion function
 */
function convertFractions() {
  try {
    console.log("🔄 Starting fraction to decimal conversion...");

    // Read the current recipes file
    const recipesData = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf8"));
    console.log(`📊 Found ${recipesData.length} recipes to process`);

    // Create backup
    const backupFile = RECIPES_FILE.replace(
      ".json",
      "_backup_before_fraction_conversion.json"
    );
    fs.writeFileSync(backupFile, JSON.stringify(recipesData, null, 2));
    console.log(`💾 Created backup: ${backupFile}`);

    // Convert all recipes
    let convertedCount = 0;
    let totalFractions = 0;

    const convertedRecipes = recipesData.map((recipe) => {
      const originalRecipe = JSON.stringify(recipe);
      const convertedRecipe = convertRecipeFractions(recipe);

      if (originalRecipe !== JSON.stringify(convertedRecipe)) {
        convertedCount++;

        // Count fractions converted
        if (convertedRecipe.ingredients) {
          convertedRecipe.ingredients.forEach((group) => {
            if (group.ingredients) {
              group.ingredients.forEach((ingredient) => {
                if (ingredient.quantity && ingredient.quantity.includes("/")) {
                  totalFractions++;
                }
              });
            }
          });
        }
      }

      return convertedRecipe;
    });

    // Write the converted data
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(convertedRecipes, null, 2));

    console.log("✅ Conversion completed successfully!");
    console.log(`📈 Statistics:`);
    console.log(`   - Recipes processed: ${recipesData.length}`);
    console.log(`   - Recipes with changes: ${convertedCount}`);
    console.log(`   - Total fractions converted: ${totalFractions}`);

    // Show some examples
    console.log("\n📝 Example conversions:");
    const examples = [];
    convertedRecipes.forEach((recipe) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((group) => {
          if (group.ingredients) {
            group.ingredients.forEach((ingredient) => {
              if (ingredient.quantity && !ingredient.quantity.includes("/")) {
                // Check if this was likely converted (contains decimal)
                if (ingredient.quantity.match(/0\.\d+/)) {
                  examples.push(ingredient.quantity);
                }
              }
            });
          }
        });
      }
    });

    examples.slice(0, 10).forEach((example) => {
      console.log(`   "${example}"`);
    });
  } catch (error) {
    console.error("❌ Conversion failed:", error.message);
    process.exit(1);
  }
}

// Run conversion if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  convertFractions();
}

export { convertFractions, convertQuantity, fractionToDecimal };

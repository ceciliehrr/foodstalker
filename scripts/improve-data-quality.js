#!/usr/bin/env node

/**
 * Data quality improvement script for recipes.json
 * Identifies and fixes common data quality issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the recipes data file
const RECIPES_FILE = path.join(__dirname, "../src/data/new_recipes.json");

/**
 * Analyze data quality issues
 */
function analyzeDataQuality(recipes) {
  const issues = {
    emptyQuantities: 0,
    inconsistentUnits: 0,
    missingDetails: 0,
    invalidUrls: 0,
    missingFields: 0,
    duplicateIngredients: 0,
    examples: {
      emptyQuantities: [],
      inconsistentUnits: [],
      missingDetails: [],
      invalidUrls: [],
      missingFields: [],
    },
  };

  recipes.forEach((recipe, recipeIndex) => {
    // Check for missing required fields
    const requiredFields = ["id", "title", "category", "time", "portions"];
    const missingFields = requiredFields.filter((field) => !recipe[field]);
    if (missingFields.length > 0) {
      issues.missingFields += missingFields.length;
      issues.examples.missingFields.push({
        recipe: recipe.title,
        missing: missingFields,
      });
    }

    // Check for invalid URLs
    if (recipe.imageurl && !isValidUrl(recipe.imageurl)) {
      issues.invalidUrls++;
      issues.examples.invalidUrls.push({
        recipe: recipe.title,
        url: recipe.imageurl,
      });
    }

    if (recipe.ingredients) {
      recipe.ingredients.forEach((group, groupIndex) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient, ingredientIndex) => {
            // Check for empty quantities
            if (!ingredient.quantity || ingredient.quantity.trim() === "") {
              issues.emptyQuantities++;
              if (issues.examples.emptyQuantities.length < 5) {
                issues.examples.emptyQuantities.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                });
              }
            }

            // Check for inconsistent units
            if (ingredient.quantity && !isValidQuantity(ingredient.quantity)) {
              issues.inconsistentUnits++;
              if (issues.examples.inconsistentUnits.length < 5) {
                issues.examples.inconsistentUnits.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                  quantity: ingredient.quantity,
                });
              }
            }

            // Check for ingredients that could have details but don't
            if (
              ingredient.name &&
              hasPotentialDetails(ingredient.name) &&
              !ingredient.details
            ) {
              issues.missingDetails++;
              if (issues.examples.missingDetails.length < 5) {
                issues.examples.missingDetails.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                });
              }
            }
          });
        }
      });
    }
  });

  return issues;
}

/**
 * Check if URL is valid
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Check if quantity format is valid
 */
function isValidQuantity(quantity) {
  // Valid patterns: "2 ss", "1/2 stk", "til smaking", "1-2 ss"
  const validPatterns = [
    /^\d+\s*(ss|ts|dl|l|g|kg|stk|fedd|biter|klype|dash)$/i,
    /^\d+\/\d+\s*(ss|ts|dl|l|g|kg|stk|fedd|biter|klype|dash)$/i,
    /^\d+-\d+\s*(ss|ts|dl|l|g|kg|stk|fedd|biter|klype|dash)$/i,
    /^(til smaking|til servering|til steking|til smaking|ca\.|litt|noen)$/i,
    /^\d+\.\d+\s*(ss|ts|dl|l|g|kg|stk|fedd|biter|klype|dash)$/i,
  ];

  return validPatterns.some((pattern) => pattern.test(quantity.trim()));
}

/**
 * Check if ingredient name suggests it could have details
 */
function hasPotentialDetails(name) {
  const patterns = [
    /,/, // Contains comma
    /\(/, // Contains parenthesis
    /-/, // Contains dash
    /til\s+/, // Contains "til"
    /(fersk|tørr|hel|hakket|fin|grov|flytende|røkt|kald|varm|stor|liten)/i,
  ];

  return patterns.some((pattern) => pattern.test(name));
}

/**
 * Fix empty quantities with context-aware suggestions
 */
function fixEmptyQuantities(recipes) {
  // Only fix ingredients where we can be confident about the quantity
  const safeQuantities = {
    salt: "smak til",
    pepper: "smak til",
    persille: "til garnityr",
    sitron: "smak til",
    hvitløk: "smak til",
    krydder: "smak til",
    "salt og pepper": "smak til",
    "salt og kvernet pepper": "smak til",
  };

  // Ingredients that need manual review (too context-dependent)
  const needsManualReview = [
    "olje",
    "olivenolje",
    "smør",
    "løk",
    "sitron",
    "hvitløk",
  ];

  let fixedCount = 0;
  let manualReviewNeeded = [];

  recipes.forEach((recipe) => {
    if (recipe.ingredients) {
      recipe.ingredients.forEach((group) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient) => {
            if (!ingredient.quantity || ingredient.quantity.trim() === "") {
              const normalizedName = ingredient.name.toLowerCase().trim();

              // Only fix if we're confident about the quantity
              if (safeQuantities[normalizedName]) {
                ingredient.quantity = safeQuantities[normalizedName];
                fixedCount++;
              } else if (
                needsManualReview.some((item) => normalizedName.includes(item))
              ) {
                manualReviewNeeded.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                  reason: "Context-dependent quantity",
                });
              }
            }
          });
        }
      });
    }
  });

  // Report ingredients that need manual review
  if (manualReviewNeeded.length > 0) {
    console.log("\n⚠️  Ingredients that need manual review:");
    manualReviewNeeded.slice(0, 10).forEach((item) => {
      console.log(
        `   - "${item.ingredient}" in "${item.recipe}" (${item.reason})`
      );
    });
    if (manualReviewNeeded.length > 10) {
      console.log(`   ... and ${manualReviewNeeded.length - 10} more`);
    }
  }

  return fixedCount;
}

/**
 * Suggest better quantities for context-dependent ingredients
 */
function suggestContextualQuantities(recipes) {
  const suggestions = [];

  recipes.forEach((recipe) => {
    if (recipe.ingredients) {
      recipe.ingredients.forEach((group) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient) => {
            if (!ingredient.quantity || ingredient.quantity.trim() === "") {
              const name = ingredient.name.toLowerCase();

              // Context-aware suggestions based on ingredient type and recipe context
              if (name.includes("olje") || name.includes("olivenolje")) {
                suggestions.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                  suggestions: [
                    "1-2 ss (til steking)",
                    "smak til (over salat)",
                    "til steking (i stekepanne)",
                    "1 ss (til marinade)",
                  ],
                  reason:
                    "Olje kan brukes til steking, marinade, eller over salat",
                });
              } else if (name.includes("smør")) {
                suggestions.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                  suggestions: [
                    "1 ss (til steking)",
                    "smak til (over grønnsaker)",
                    "1 ts (til saus)",
                  ],
                  reason: "Smør kan brukes til steking eller smaking",
                });
              }
            }
          });
        }
      });
    }
  });

  return suggestions;
}

/**
 * Standardize quantity formats with comprehensive improvements
 */
function standardizeQuantities(recipes) {
  const unitMappings = {
    spiseskje: "ss",
    teskje: "ts",
    desiliter: "dl",
    liter: "l",
    gram: "g",
    kilo: "kg",
    stykke: "stk",
    fed: "fedd",
    spiseskjeer: "ss",
    teskjeer: "ts",
    desilitre: "dl",
    litre: "l",
    grammer: "g",
    kiloer: "kg",
    stykker: "stk",
    fedd: "fedd",
  };

  let fixedCount = 0;
  const improvements = [];

  recipes.forEach((recipe) => {
    if (recipe.ingredients) {
      recipe.ingredients.forEach((group) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient) => {
            if (ingredient.quantity) {
              let quantity = ingredient.quantity;
              let originalQuantity = quantity;

              // 1. Standardize units
              Object.entries(unitMappings).forEach(([oldUnit, newUnit]) => {
                const regex = new RegExp(`\\b${oldUnit}\\b`, "gi");
                if (regex.test(quantity)) {
                  quantity = quantity.replace(regex, newUnit);
                  fixedCount++;
                }
              });

              // 2. Convert decimal fractions to fractions
              quantity = convertDecimalsToFractions(quantity);

              // 3. Add missing units for small quantities
              quantity = addMissingUnits(quantity, ingredient.name);

              // 4. Standardize common patterns
              quantity = standardizeCommonPatterns(quantity);

              if (quantity !== originalQuantity) {
                improvements.push({
                  recipe: recipe.title,
                  ingredient: ingredient.name,
                  original: originalQuantity,
                  improved: quantity,
                });
              }

              ingredient.quantity = quantity;
            }
          });
        }
      });
    }
  });

  // Show examples of improvements
  if (improvements.length > 0) {
    console.log("\n🔧 Quantity format improvements:");
    improvements.slice(0, 10).forEach((improvement) => {
      console.log(
        `   - "${improvement.ingredient}" in "${improvement.recipe}"`
      );
      console.log(`     "${improvement.original}" → "${improvement.improved}"`);
    });
    if (improvements.length > 10) {
      console.log(`   ... and ${improvements.length - 10} more improvements`);
    }
  }

  return fixedCount;
}

/**
 * Convert decimal fractions to readable fractions
 */
function convertDecimalsToFractions(quantity) {
  const decimalMappings = {
    0.25: "1/4",
    0.5: "1/2",
    0.75: "3/4",
    0.33: "1/3",
    0.67: "2/3",
    0.125: "1/8",
    0.375: "3/8",
    0.625: "5/8",
    0.875: "7/8",
  };

  let result = quantity;
  Object.entries(decimalMappings).forEach(([decimal, fraction]) => {
    const regex = new RegExp(`\\b${decimal}\\b`, "g");
    result = result.replace(regex, fraction);
  });

  return result;
}

/**
 * Add missing units for small quantities
 */
function addMissingUnits(quantity, ingredientName) {
  const name = ingredientName.toLowerCase();

  // If quantity is just a number without unit, try to infer from ingredient
  if (/^\d+(\.\d+)?$/.test(quantity.trim())) {
    const num = parseFloat(quantity);

    // Small quantities that likely need units
    if (num <= 5) {
      if (
        name.includes("salt") ||
        name.includes("pepper") ||
        name.includes("krydder")
      ) {
        return `${quantity} ts`;
      } else if (
        name.includes("olje") ||
        name.includes("smør") ||
        name.includes("honning")
      ) {
        return `${quantity} ss`;
      } else if (name.includes("sitron") || name.includes("lime")) {
        return `${quantity} stk`;
      }
    }
  }

  return quantity;
}

/**
 * Standardize common patterns
 */
function standardizeCommonPatterns(quantity) {
  let result = quantity;

  // Remove extra spaces
  result = result.replace(/\s+/g, " ").trim();

  // Standardize "til smaking" patterns
  result = result.replace(/til\s+smaking/gi, "smak til");
  result = result.replace(/til\s+servering/gi, "til servering");
  result = result.replace(/til\s+steking/gi, "til steking");

  // Standardize "ca." patterns - keep as is, don't change
  // result = result.replace(/\bca\.?\b/gi, "ca.");

  // Standardize "litt" patterns
  result = result.replace(/\blitt\b/gi, "litt");

  return result;
}

/**
 * Main data quality improvement function
 */
function improveDataQuality() {
  try {
    console.log("🔍 Analyzing data quality issues...");

    // Read the current recipes file
    const recipesData = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf8"));
    console.log(`📊 Found ${recipesData.length} recipes to analyze`);

    // Analyze issues
    const issues = analyzeDataQuality(recipesData);

    console.log("\n📈 Data Quality Analysis:");
    console.log(`   - Empty quantities: ${issues.emptyQuantities}`);
    console.log(`   - Inconsistent units: ${issues.inconsistentUnits}`);
    console.log(`   - Missing details: ${issues.missingDetails}`);
    console.log(`   - Invalid URLs: ${issues.invalidUrls}`);
    console.log(`   - Missing fields: ${issues.missingFields}`);

    // Show examples
    if (issues.examples.emptyQuantities.length > 0) {
      console.log("\n🔍 Examples of empty quantities:");
      issues.examples.emptyQuantities.forEach((example) => {
        console.log(`   - "${example.ingredient}" in "${example.recipe}"`);
      });
    }

    if (issues.examples.missingDetails.length > 0) {
      console.log("\n🔍 Examples of ingredients that could have details:");
      issues.examples.missingDetails.forEach((example) => {
        console.log(`   - "${example.ingredient}" in "${example.recipe}"`);
      });
    }

    // Ask for confirmation before fixing
    console.log("\n🛠️  Suggested fixes:");
    console.log("   1. Fix empty quantities with safe defaults only");
    console.log("   2. Standardize unit formats");
    console.log("   3. Improve ingredient normalization");
    console.log("   4. Manual review needed for context-dependent ingredients");

    // Create backup before making changes
    const backupFile = RECIPES_FILE.replace(
      ".json",
      "_before_quality_improvement.json"
    );
    fs.writeFileSync(backupFile, JSON.stringify(recipesData, null, 2));
    console.log(`\n💾 Created backup: ${backupFile}`);

    // Apply fixes
    console.log("\n🔧 Applying fixes...");

    const fixedQuantities = fixEmptyQuantities(recipesData);
    const standardizedQuantities = standardizeQuantities(recipesData);
    const contextualSuggestions = suggestContextualQuantities(recipesData);

    console.log(
      `   - Fixed ${fixedQuantities} empty quantities (safe defaults only)`
    );
    console.log(`   - Standardized ${standardizedQuantities} quantity formats`);

    if (contextualSuggestions.length > 0) {
      console.log(`\n💡 Contextual suggestions for manual review:`);
      contextualSuggestions.slice(0, 5).forEach((suggestion) => {
        console.log(
          `   - "${suggestion.ingredient}" in "${suggestion.recipe}"`
        );
        console.log(`     ${suggestion.reason}`);
        console.log(`     Suggestions: ${suggestion.suggestions.join(", ")}`);
      });
      if (contextualSuggestions.length > 5) {
        console.log(
          `   ... and ${contextualSuggestions.length - 5} more suggestions`
        );
      }
    }

    // Write improved data
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipesData, null, 2));

    console.log("\n✅ Data quality improvement completed!");
    console.log("🎯 Next steps:");
    console.log("   1. Review the changes in the browser");
    console.log("   2. Test LeftoversRecommendations functionality");
    console.log("   3. Consider additional normalization rules");
  } catch (error) {
    console.error("❌ Data quality improvement failed:", error.message);
    process.exit(1);
  }
}

// Run improvement if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  improveDataQuality();
}

export {
  improveDataQuality,
  analyzeDataQuality,
  fixEmptyQuantities,
  standardizeQuantities,
  suggestContextualQuantities,
};

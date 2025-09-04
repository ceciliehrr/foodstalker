const fs = require("fs");
const path = require("path");

// Function to parse time string and convert to minutes
function parseTimeToMinutes(timeString) {
  if (!timeString) {
    return null;
  }

  // If it's already a number, return it
  if (typeof timeString === "number") {
    return Math.round(timeString);
  }

  // If it's not a string, try to convert it
  if (typeof timeString !== "string") {
    const num = parseFloat(timeString);
    if (!isNaN(num)) {
      return Math.round(num);
    }
    return null;
  }

  const time = timeString.toLowerCase().trim();

  // Handle different time formats
  if (time.includes("timer") || time.includes("timer")) {
    const hours = parseFloat(time.match(/(\d+(?:\.\d+)?)/)?.[1]);
    return hours ? Math.round(hours * 60) : null;
  }

  if (time.includes("min") || time.includes("minutter")) {
    const minutes = parseFloat(time.match(/(\d+(?:\.\d+)?)/)?.[1]);
    return minutes ? Math.round(minutes) : null;
  }

  // Handle ranges like "12-20 timer"
  if (time.includes("-")) {
    const parts = time.split("-");
    const first = parseFloat(parts[0].match(/(\d+(?:\.\d+)?)/)?.[1]);
    const second = parseFloat(parts[1].match(/(\d+(?:\.\d+)?)/)?.[1]);

    if (first && second) {
      if (time.includes("timer")) {
        return Math.round(((first + second) / 2) * 60);
      } else {
        return Math.round((first + second) / 2);
      }
    }
  }

  // Try to parse as pure number (assume minutes)
  const number = parseFloat(time);
  if (!isNaN(number)) {
    return Math.round(number);
  }

  return null;
}

// Function to standardize ingredient quantities
function standardizeQuantity(quantity) {
  if (!quantity) {
    return "";
  }

  // If it's not a string, convert it to string
  if (typeof quantity !== "string") {
    return quantity.toString();
  }

  const qty = quantity.trim();

  // If it's already empty, return empty
  if (qty === "") {
    return "";
  }

  // If it already looks standardized (number + unit), return as is
  if (
    /^\d+(?:\.\d+)?\s+(stk|g|kg|ss|ts|dl|l|fedd|biter|klype|dash)$/.test(qty)
  ) {
    return qty;
  }

  // Try to parse and standardize
  const match = qty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const amount = match[1];
    const unit = match[2].toLowerCase().trim();

    // Map common unit variations to standard units
    const unitMap = {
      stk: "stk",
      stykker: "stk",
      stykke: "stk",
      gram: "g",
      g: "g",
      kilo: "kg",
      kg: "kg",
      spiseskje: "ss",
      ss: "ss",
      teskje: "ts",
      ts: "ts",
      desiliter: "dl",
      dl: "dl",
      liter: "l",
      l: "l",
      fedd: "fedd",
      biter: "biter",
      klype: "klype",
      dash: "dash",
    };

    const standardUnit = unitMap[unit] || unit;
    return `${amount} ${standardUnit}`;
  }

  return qty;
}

// Function to clean a single recipe
function cleanRecipe(recipe) {
  const cleaned = { ...recipe };

  // Clean time field
  if (cleaned.time !== undefined && cleaned.time !== null) {
    const timeInMinutes = parseTimeToMinutes(cleaned.time);
    if (timeInMinutes !== null) {
      cleaned.time = timeInMinutes;
    }
  }

  // Ensure portions is a number
  if (cleaned.portions !== undefined && cleaned.portions !== null) {
    const portions = parseInt(cleaned.portions);
    if (!isNaN(portions)) {
      cleaned.portions = portions;
    }
  }

  // Clean ingredients
  if (cleaned.ingredients && Array.isArray(cleaned.ingredients)) {
    cleaned.ingredients = cleaned.ingredients.map((group) => {
      if (group.ingredients && Array.isArray(group.ingredients)) {
        group.ingredients = group.ingredients.map((ingredient) => {
          return {
            ...ingredient,
            quantity: standardizeQuantity(ingredient.quantity),
          };
        });
      }
      return group;
    });
  }

  return cleaned;
}

// Main function to clean all recipes
function cleanAllRecipes() {
  const dataPath = path.join(__dirname, "../../../data/new_recipes.json");

  try {
    console.log("Reading recipes from:", dataPath);
    const recipes = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    console.log(`Found ${recipes.length} recipes to clean`);

    const cleanedRecipes = recipes.map((recipe, index) => {
      console.log(`Cleaning recipe ${index + 1}: ${recipe.title || recipe.id}`);
      return cleanRecipe(recipe);
    });

    // Create backup
    const backupPath = dataPath.replace(".json", "_backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(recipes, null, 2));
    console.log(`Backup created at: ${backupPath}`);

    // Write cleaned data
    fs.writeFileSync(dataPath, JSON.stringify(cleanedRecipes, null, 2));
    console.log(`Cleaned data written to: ${dataPath}`);

    console.log("Data cleaning completed successfully!");
  } catch (error) {
    console.error("Error cleaning recipes:", error);
  }
}

// Run the cleaning if this script is executed directly
if (require.main === module) {
  cleanAllRecipes();
}

module.exports = {
  cleanRecipe,
  cleanAllRecipes,
  parseTimeToMinutes,
  standardizeQuantity,
};

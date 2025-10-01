import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load recipe data
const recipesPath = path.join(__dirname, "../src/data/new_recipes.json");
const recipes = await fs.readJson(recipesPath);

console.log(`📊 Analyzing ${recipes.length} recipes for ingredient network...`);

// List of ingredients to exclude (too generic/common)
const EXCLUDED_INGREDIENTS = [
  "salt",
  "pepper",
  "kvernet pepper",
  "salt og pepper",
  "salt og kvernet pepper",
  "hvetemel",
  "vann",
  "olje",
  "smør",
  "sukker",
];

// Step 1: Extract and normalize ingredient names
function normalizeIngredientName(name) {
  return (
    name
      .toLowerCase()
      .trim()
      // Remove common prefixes/suffixes
      .replace(
        /^(fersk|tørket|frosset|kvernet|malt|hakket|revet|skåret)\s+/i,
        ""
      )
      .replace(/\s+(i biter|i skiver|i terninger)$/i, "")
      // Singular/plural normalization for common ingredients
      .replace(/tomat(er)?/i, "tomat")
      .replace(/løk(er)?/i, "løk")
      .replace(/gulrot(er)?/i, "gulrot")
      .replace(/potet(er)?/i, "potet")
      .replace(/eple(r)?/i, "eple")
      .replace(/appelsin(er)?/i, "appelsin")
      .replace(/sitron(er)?/i, "sitron")
      .replace(/paprika(er)?/i, "paprika")
      .trim()
  );
}

function isExcludedIngredient(normalizedName) {
  return EXCLUDED_INGREDIENTS.includes(normalizedName);
}

// Step 2: Build ingredient co-occurrence matrix
const ingredientOccurrences = {}; // How many times each ingredient appears
const ingredientPairs = {}; // How many times two ingredients appear together
const ingredientRecipes = {}; // Which recipes contain each ingredient

recipes.forEach((recipe) => {
  if (!recipe.ingredients) return;

  // Extract all ingredient names from this recipe
  const recipeIngredients = [];
  recipe.ingredients.forEach((group) => {
    if (group.ingredients) {
      group.ingredients.forEach((ing) => {
        const normalized = normalizeIngredientName(ing.name);
        // Skip excluded ingredients and very short names
        if (
          normalized &&
          normalized.length > 2 &&
          !isExcludedIngredient(normalized)
        ) {
          recipeIngredients.push({
            original: ing.name,
            normalized: normalized,
          });
        }
      });
    }
  });

  // Count individual ingredient occurrences
  const uniqueIngredients = [
    ...new Set(recipeIngredients.map((i) => i.normalized)),
  ];
  uniqueIngredients.forEach((ingredient) => {
    ingredientOccurrences[ingredient] =
      (ingredientOccurrences[ingredient] || 0) + 1;

    if (!ingredientRecipes[ingredient]) {
      ingredientRecipes[ingredient] = [];
    }
    ingredientRecipes[ingredient].push({
      id: recipe.id,
      title: recipe.title,
    });
  });

  // Count ingredient pairs (co-occurrences)
  for (let i = 0; i < uniqueIngredients.length; i++) {
    for (let j = i + 1; j < uniqueIngredients.length; j++) {
      const ing1 = uniqueIngredients[i];
      const ing2 = uniqueIngredients[j];

      // Create a consistent key for the pair
      const pairKey = [ing1, ing2].sort().join("|||");

      ingredientPairs[pairKey] = (ingredientPairs[pairKey] || 0) + 1;
    }
  }
});

console.log(
  `✅ Found ${Object.keys(ingredientOccurrences).length} unique ingredients`
);
console.log(`✅ Found ${Object.keys(ingredientPairs).length} ingredient pairs`);

// Step 3: Filter and build network data
// Only include ingredients that appear in at least 3 recipes
const MIN_OCCURRENCES = 3;
const popularIngredients = Object.entries(ingredientOccurrences)
  .filter(([_, count]) => count >= MIN_OCCURRENCES)
  .map(([name, count]) => name);

console.log(
  `✅ ${popularIngredients.length} ingredients appear in ${MIN_OCCURRENCES}+ recipes`
);

// Build nodes (ingredients)
const nodes = popularIngredients.map((ingredient) => ({
  id: ingredient,
  label: ingredient,
  value: ingredientOccurrences[ingredient], // Size based on frequency
  title: `${ingredient} (${ingredientOccurrences[ingredient]} oppskrifter)`,
}));

// Build edges (connections between ingredients)
const edges = [];
Object.entries(ingredientPairs).forEach(([pairKey, count]) => {
  const [ing1, ing2] = pairKey.split("|||");

  // Only include if both ingredients are popular enough
  if (popularIngredients.includes(ing1) && popularIngredients.includes(ing2)) {
    edges.push({
      from: ing1,
      to: ing2,
      value: count, // Edge weight based on co-occurrence frequency
      title: `${count} oppskrifter`,
    });
  }
});

console.log(
  `✅ Built network with ${nodes.length} nodes and ${edges.length} edges`
);

// Step 4: Calculate interesting metrics
// Find the most connected ingredients
const ingredientConnections = {};
edges.forEach((edge) => {
  ingredientConnections[edge.from] =
    (ingredientConnections[edge.from] || 0) + 1;
  ingredientConnections[edge.to] = (ingredientConnections[edge.to] || 0) + 1;
});

const mostConnected = Object.entries(ingredientConnections)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([ingredient, connections]) => ({
    ingredient,
    connections,
    occurrences: ingredientOccurrences[ingredient],
  }));

// Step 5: Build "discover new combinations" suggestions
// Find ingredients that rarely appear together but share common partners
function findCreativePairings() {
  const suggestions = [];
  const ingredientNeighbors = {};

  // Build neighbor lists
  edges.forEach((edge) => {
    if (!ingredientNeighbors[edge.from])
      ingredientNeighbors[edge.from] = new Set();
    if (!ingredientNeighbors[edge.to]) ingredientNeighbors[edge.to] = new Set();

    ingredientNeighbors[edge.from].add(edge.to);
    ingredientNeighbors[edge.to].add(edge.from);
  });

  // Find ingredients with common neighbors but not directly connected
  const topIngredients = mostConnected.slice(0, 50).map((i) => i.ingredient);

  for (let i = 0; i < topIngredients.length; i++) {
    for (let j = i + 1; j < topIngredients.length; j++) {
      const ing1 = topIngredients[i];
      const ing2 = topIngredients[j];

      const neighbors1 = ingredientNeighbors[ing1] || new Set();
      const neighbors2 = ingredientNeighbors[ing2] || new Set();

      // Check if they're directly connected
      const directlyConnected = neighbors1.has(ing2);

      if (!directlyConnected) {
        // Find common neighbors
        const commonNeighbors = [...neighbors1].filter((n) =>
          neighbors2.has(n)
        );

        if (commonNeighbors.length >= 3) {
          suggestions.push({
            ingredient1: ing1,
            ingredient2: ing2,
            commonNeighbors: commonNeighbors.slice(0, 5),
            score: commonNeighbors.length,
          });
        }
      }
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 30);
}

const creativePairings = findCreativePairings();
console.log(`✅ Found ${creativePairings.length} creative pairing suggestions`);

// Step 6: Save all data
const networkData = {
  nodes,
  edges,
  metadata: {
    totalRecipes: recipes.length,
    totalIngredients: Object.keys(ingredientOccurrences).length,
    networkIngredients: nodes.length,
    networkEdges: edges.length,
    generatedAt: new Date().toISOString(),
  },
  mostConnected,
  creativePairings,
  ingredientRecipes,
};

const outputPath = path.join(__dirname, "../src/data/ingredient_network.json");
await fs.writeJson(outputPath, networkData, { spaces: 2 });

console.log(`\n🎉 Ingredient network saved to ${outputPath}`);
console.log(`\n📈 Top 10 most connected ingredients:`);
mostConnected.slice(0, 10).forEach((item, index) => {
  console.log(
    `  ${index + 1}. ${item.ingredient} - ${item.connections} connections, ${
      item.occurrences
    } recipes`
  );
});

console.log(`\n💡 Sample creative pairings:`);
creativePairings.slice(0, 5).forEach((pairing, index) => {
  console.log(
    `  ${index + 1}. ${pairing.ingredient1} + ${pairing.ingredient2}`
  );
  console.log(`     (via ${pairing.commonNeighbors.slice(0, 3).join(", ")})`);
});

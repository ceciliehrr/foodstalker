<template>
  <div v-if="recommendations.length > 0" class="leftovers-recommendations">
    <h2>🥡 Fra rest til fest!</h2>
    <ul class="leftovers-list">
      <li v-for="recipe in recommendations" :key="recipe.id">
        <SmallCards
          :title="recipe.title"
          :description="getMatchingIngredientsText(recipe)"
          :image="recipe.imageurl"
          :href="`/oppskrift/${recipe.id}`"
          :difficulty="getDifficultyInfo(recipe)"
          :category="recipe.category"
          :disable-truncation="true"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import getRecipes from "../data/new_recipes.json";
import {
  calculateDifficulty,
  getDifficultyIcon,
  getDifficultyDisplayName,
} from "../utils/recipeDifficulty";
import SmallCards from "./cards/SmallCards.vue";

export default {
  name: "LeftoversRecommendations",
  components: {
    SmallCards,
  },
  props: {
    currentRecipe: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      recipes: getRecipes,
    };
  },
  computed: {
    currentRecipeIngredients() {
      if (!this.currentRecipe?.ingredients) return [];

      const ingredients = [];
      this.currentRecipe.ingredients.forEach((group: any) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient: any) => {
            if (ingredient.name) {
              const normalizedName = this.normalizeIngredientName(
                ingredient.name
              );
              // Only include ingredients that are not common pantry items
              if (this.isLeftoverIngredient(normalizedName)) {
                ingredients.push(normalizedName);
              }
            }
          });
        }
      });
      return ingredients;
    },
    recommendations() {
      if (!this.currentRecipeIngredients.length) return [];

      const scoredRecipes = this.recipes
        .filter((recipe) => recipe.id !== this.currentRecipe.id) // Exclude current recipe
        .map((recipe) => ({
          ...recipe,
          matchingIngredients: this.getMatchingIngredients(recipe),
          score: this.calculateMatchingScore(recipe),
        }))
        .filter((recipe) => recipe.score >= 1) // Require at least 1 meaningful ingredient match
        .sort((a, b) => b.score - a.score) // Sort by matching score
        .slice(0, 5); // Get top 5 recommendations

      return scoredRecipes;
    },
  },
  methods: {
    isLeftoverIngredient(ingredientName: string) {
      // Common pantry items that shouldn't count as "rester" - only truly basic staples
      const pantryItems = [
        "salt",
        "pepper",
        "sukker",
        "olje",
        "smør",
        "mel",
        "hvetemel",
        "baking powder",
        "natron",
        "gjær",
        "vanilje",
        "kanel",
        "nellik",
        "muskat",
        "kardemomme",
        "eddik",
        "honning",
        "tomatpure",
        "ketchup",
        "majones",
        "senap",
        "soya",
        "worcestershire",
        "tabasco",
        "krydder",
        "krydderblanding",
        "herbes",
        "olivenolje",
        "rapsolje",
        "sesamolje",
        "kokosolje",
        "margarin",
        "brød",
        "pasta",
        "ris",
        "vann",
        "finsnittet",
        "hvitløk",
      ];

      const normalized = ingredientName.toLowerCase().trim();

      // Check if it's a pantry item
      if (
        pantryItems.some(
          (item) => normalized.includes(item) || item.includes(normalized)
        )
      ) {
        return false;
      }

      // Check for quantities that suggest it's a main ingredient (not just seasoning)
      const quantityPatterns = [
        /\d+\s*(kg|g|dl|l|tsk|ss|stk|pakke|pose|boks)/i,
        /^\d+\s*(kg|g|dl|l|tsk|ss|stk)/i,
        /(hele?|halve?|kvarter|del)/i,
      ];

      // If it has quantities, it's likely a main ingredient
      const hasQuantity = quantityPatterns.some((pattern) =>
        pattern.test(normalized)
      );

      // Also consider it a leftover if it's a substantial ingredient (not just a small amount)
      const isSubstantial = normalized.length > 3; // More than 3 characters suggests it's not just "salt" etc.

      return hasQuantity || isSubstantial;
    },
    normalizeIngredientName(name: string) {
      // Remove common prefixes and normalize for better matching
      return name
        .toLowerCase()
        .replace(
          /^(fersk|tørr|hel|hakket|fin|grov|flytende|røkt|kald|varm|stor|liten)\s+/i,
          ""
        )
        .replace(/,\s*(.*)$/, "") // Remove everything after comma (legacy support)
        .trim();
    },
    getMatchingIngredients(recipe: any) {
      if (!recipe.ingredients || !this.currentRecipeIngredients.length)
        return [];

      const matchingIngredients = [];

      recipe.ingredients.forEach((group: any) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient: any) => {
            if (ingredient.name) {
              const normalizedName = this.normalizeIngredientName(
                ingredient.name
              );
              // Only match if it's a leftover ingredient and exists in current recipe
              if (
                this.currentRecipeIngredients.includes(normalizedName) &&
                this.isLeftoverIngredient(normalizedName)
              ) {
                // Use the new structure if available, fallback to old structure
                const displayName = ingredient.details
                  ? `${ingredient.name} (${ingredient.details})`
                  : ingredient.name;
                matchingIngredients.push(displayName);
              }
            }
          });
        }
      });

      return matchingIngredients; // Show all matching ingredients
    },
    calculateMatchingScore(recipe: any) {
      if (!recipe.ingredients) return 0;

      let score = 0;
      const matchedIngredients = new Set();

      recipe.ingredients.forEach((group: any) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient: any) => {
            if (ingredient.name) {
              const normalizedName = this.normalizeIngredientName(
                ingredient.name
              );
              if (
                this.currentRecipeIngredients.includes(normalizedName) &&
                this.isLeftoverIngredient(normalizedName) &&
                !matchedIngredients.has(normalizedName)
              ) {
                matchedIngredients.add(normalizedName);
                score += 1;
              }
            }
          });
        }
      });

      return score;
    },
    formatTime(time: string | number | undefined): string {
      if (!time) return "Ukjent tid";

      if (typeof time === "number") {
        if (time < 60) {
          return `${time} min`;
        } else {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          if (minutes === 0) {
            return `${hours} ${hours === 1 ? "time" : "timer"}`;
          } else {
            return `${hours} ${hours === 1 ? "time" : "timer"} ${minutes} min`;
          }
        }
      }

      return time;
    },
    getMatchingIngredientsText(recipe: any): string {
      const matchingIngredients = this.getMatchingIngredients(recipe);
      if (matchingIngredients.length === 0) return "";

      const ingredientList = matchingIngredients.join(", ");
      return `Bruker restene: ${ingredientList}`;
    },
    getDifficultyInfo(recipe: any) {
      const difficulty = calculateDifficulty(recipe);
      return {
        level: difficulty.level,
        icon: getDifficultyIcon(difficulty.level),
        label: getDifficultyDisplayName(difficulty.level),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;

.leftovers-recommendations {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--fs-gray-200);

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--fs-brokkoli);
    margin-bottom: 1.5rem;
    text-align: center;

    @include bp("tablet-up") {
      font-size: 1.75rem;
    }
  }
}

.leftovers-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>

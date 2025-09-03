<template>
  <div class="fs-search-bar">
    <h2>Søk i oppskrifter</h2>

    <!-- Search mode toggle -->
    <div class="fs-search-bar__mode-toggle">
      <button
        @click="setSearchMode('quick')"
        :class="['fs-search-bar__mode-btn', { active: searchMode === 'quick' }]"
      >
        🔍 Normalt søk
      </button>
      <button
        @click="setSearchMode('ingredient')"
        :class="[
          'fs-search-bar__mode-btn',
          { active: searchMode === 'ingredient' },
        ]"
      >
        🥬 Hva har du i kjøleskapet?
      </button>
    </div>

    <!-- Quick Search Mode -->
    <div v-if="searchMode === 'quick'" class="fs-search-bar__container">
      <label for="search" class="sr-only">Søk</label>
      <div class="fs-search-bar__search-bar">
        <div class="fs-search-bar__icon">
          <svg
            class=""
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          id="search"
          v-model="search"
          class="fs-search-bar__input"
          placeholder="Søk etter no digg.."
          required
          @input="onSearchInput"
          @focus="showSuggestions = true"
          @blur="onSearchBlur"
          @keydown="handleInputKeydown"
        />
        <button
          v-if="search.length > 0"
          @click="clearSearch"
          class="fs-search-bar__clear-btn"
          type="button"
          aria-label="Clear search"
        >
          ×
        </button>

        <!-- Simple custom dropdown -->
        <div
          v-if="showSuggestions && searchSuggestions.length > 0"
          class="fs-search-bar__suggestions"
        >
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="suggestion"
            class="fs-search-bar__suggestion-item"
            :class="{
              'fs-search-bar__suggestion-item--active':
                selectedSuggestionIndex === index,
            }"
            :tabindex="selectedSuggestionIndex === index ? 0 : -1"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredient Search Mode -->
    <div
      v-if="searchMode === 'ingredient'"
      class="fs-search-bar__ingredient-finder"
    >
      <div class="fs-search-bar__ingredient-header">
        <h3>🥬 Hva har du i kjøleskapet? 🐔</h3>
        <p>Legg til ingredienser du har, så finner vi oppskrifter for deg</p>
      </div>

      <!-- Ingredient input -->
      <div class="fs-search-bar__ingredient-input">
        <input
          v-model="ingredientInput"
          @keydown="handleIngredientInput"
          type="text"
          placeholder="Skriv ingrediens og trykk Enter..."
          class="fs-search-bar__ingredient-text-input"
        />
      </div>

      <!-- Toro message -->
      <div v-if="showToroMessage" class="fs-search-bar__toro-message">
        <p>Vi driver ikke med Toro</p>
        <span style="font-size: 50px">🚫</span>
      </div>

      <!-- Selected ingredients as badges -->
      <div
        v-if="selectedIngredients.length > 0"
        class="fs-search-bar__ingredient-tabs"
      >
        <h4>Ingredienser du har:</h4>
        <div class="fs-search-bar__ingredient-tab-list">
          <Badge
            v-for="ingredient in selectedIngredients"
            :key="ingredient"
            type="ingredient"
            :text="ingredient"
            closable
            @close="removeIngredient(ingredient)"
          />
        </div>
      </div>

      <!-- No recipes found message for ingredients -->
      <div
        v-if="selectedIngredients.length > 0 && sortedItems.length === 0"
        class="fs-search-bar__no-ingredient-results"
      >
        <p>
          Beklager, vi har ikke laget nok oppskrifter. (vært for lite på hytta)
        </p>
        <span style="font-size: 50px">🏡</span>
      </div>
    </div>

    <div
      v-if="
        search.length ||
        selectedIngredients.length > 0 ||
        selectedDifficulties.length > 0 ||
        selectedCategories.length > 0
      "
      class="fs-search-bar__results-container"
    >
      <!-- Original FilterBox for laptop and up -->
      <FilterBox
        class="fs-search-bar__filter-desktop"
        :recipes="recipes"
        :search-results="currentSearchResults"
        v-model:selected-difficulties="selectedDifficulties"
        v-model:selected-categories="selectedCategories"
        @update:selected-difficulties="updateSelectedDifficulties"
        @update:selected-categories="updateSelectedCategories"
      />

      <!-- Bottom Sheet for mobile and tablet -->
      <FilterBoxBottomSheet
        class="fs-search-bar__filter-mobile"
        :recipes="recipes"
        :search-results="currentSearchResults"
        v-model:selected-difficulties="selectedDifficulties"
        v-model:selected-categories="selectedCategories"
        :total-results="totalResults"
        @apply="handleApply"
      />

      <!-- Search Results -->
      <div class="fs-search-bar__results">
        <p class="fs-search-bar__searchtxt" v-if="sortedItems.length >= 2">
          Du fant {{ sortedItems.length }} oppskrifter
        </p>
        <p
          class="fs-search-bar__searchtxt"
          v-else-if="sortedItems.length === 1"
        >
          Du fant {{ sortedItems.length }} oppskrift
        </p>
        <div class="fs-search-bar__searchtxt" v-else>
          <p>
            <span v-if="search"
              >Ingen oppskrifter funnet for "{{ search }}"</span
            >
            <span v-else>Ingen oppskrifter funnet med de valgte filtrene</span>
            <span style="font-size: 50px">🙈</span>
          </p>
          <p>Be oss om å lage det!</p>
        </div>

        <Grid v-if="sortedItems.length > 0" :single-column="true">
          <div v-for="recipe in recipeShowed" :key="recipe.id">
            <SmallCards
              :title="recipe.title"
              :description="recipe.description"
              :image="recipe.imageurl"
              :href="'/oppskrift/' + recipe.id"
              :difficulty="calculateDifficulty(recipe)"
              :category="recipe.category"
            />
          </div>
        </Grid>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import getRecipes from "../data/new_recipes.json";
import SmallCards from "./cards/SmallCards.vue";
import Grid from "./Grid.vue";
import FilterBox from "./FilterBox.vue";
import FilterBoxBottomSheet from "./FilterBoxBottomSheet.vue";
import Badge from "./Badge.vue";
import { RecipeSearchIndex } from "../utils/searchIndex";
import {
  calculateDifficulty,
  getDifficultyIcon,
  getDifficultyDisplayName,
} from "../utils/recipeDifficulty";

export default {
  components: {
    SmallCards,
    Grid,
    FilterBox,
    FilterBoxBottomSheet,
    Badge,
  },
  props: {
    category: String,
  },
  data() {
    return {
      search: "",
      recipes: getRecipes,
      showRecipes: 20,
      showSuggestions: false,
      selectedDifficulties: [] as string[],
      selectedCategories: [] as string[],
      searchSuggestions: [] as string[],
      selectedSuggestionIndex: -1,
      searchTimeout: null as any,
      searchIndex: null as RecipeSearchIndex | null,
      // Search mode and ingredient finder
      searchMode: "quick" as "quick" | "ingredient",
      selectedIngredients: [] as string[],
      allIngredients: [] as string[],
      ingredientInput: "",
      showToroMessage: false,
    };
  },

  // Constants for ingredient matching
  constants: {
    // Simple binary scoring - either it matches or it doesn't
    INGREDIENT_MATCH: 100,
    NO_MATCH: 0,
  },

  mounted() {
    // Initialize search index
    this.searchIndex = new RecipeSearchIndex(this.recipes);
  },

  computed: {
    // Get current search results for FilterBox
    currentSearchResults() {
      if (this.search.trim() && this.searchIndex) {
        const searchResults = this.searchIndex.search(this.search, {});
        return searchResults.map((result) => result.recipe);
      }
      return [];
    },

    sortedByCategory() {
      if (this.category) {
        return this.recipes.filter(
          (element) => element.category === this.category
        );
      } else {
        return this.recipes;
      }
    },

    filteredRecipes() {
      let recipes = this.recipes;

      // First apply difficulty filter if selected
      if (this.selectedDifficulties.length > 0) {
        recipes = recipes.filter((recipe) => {
          const difficulty = calculateDifficulty(recipe);
          return this.selectedDifficulties.includes(difficulty.level);
        });
      }

      // Then apply category filter if selected
      if (this.selectedCategories.length > 0) {
        recipes = recipes.filter((recipe) => {
          return this.selectedCategories.includes(recipe.category);
        });
      }

      // Then apply ingredient filter if ingredients are selected
      if (this.selectedIngredients.length > 0) {
        recipes = this.filterRecipesByIngredients(recipes, false); // Use 'some' for this case

        // Add ingredient match count and score for ranking
        recipes = recipes.map((recipe) => {
          let matchCount = 0;
          let totalScore = 0;

          if (recipe.ingredients) {
            // Track which selected ingredients have been matched
            const matchedIngredients = new Set();

            recipe.ingredients.forEach((group: any) => {
              if (group.ingredients) {
                group.ingredients.forEach((ingredient: any) => {
                  if (ingredient.name) {
                    this.selectedIngredients.forEach((selectedIngredient) => {
                      // Skip if this ingredient has already been matched
                      if (matchedIngredients.has(selectedIngredient)) {
                        return;
                      }

                      // Use simple word boundary matching
                      if (
                        (() => {
                          const result = this.ingredientsMatch(
                            ingredient.name,
                            selectedIngredient
                          );
                          if (result.matches) {
                            totalScore += result.score;
                          }
                          return result.matches;
                        })()
                      ) {
                        matchCount++;
                        matchedIngredients.add(selectedIngredient);
                      }
                    });
                  }
                });
              }
            });
          }

          // Simple percentage: how many ingredients matched out of total selected
          const matchPercentage = Math.round(
            (matchCount / this.selectedIngredients.length) * 100
          );

          return {
            ...recipe,
            ingredientMatchCount: matchCount,
            ingredientMatchScore: totalScore, // Use the calculated total score
            ingredientMatchPercentage: matchPercentage,
          };
        });

        // Sort by ingredient match score (highest first), then by count
        recipes = this.sortRecipesByIngredientMatch(recipes);
      }

      // Then apply search filter if there's search text
      if (this.search.trim() && this.searchIndex) {
        // Get search results
        const searchResults = this.searchIndex.search(this.search, {});

        // Convert to recipe objects and apply filtering
        let filteredSearchResults = searchResults.map((result) => ({
          ...result.recipe,
          searchScore: result.score,
        }));

        // Apply difficulty filter to search results if difficulties are selected
        if (this.selectedDifficulties.length > 0) {
          filteredSearchResults = filteredSearchResults.filter((recipe) => {
            const difficulty = calculateDifficulty(recipe);
            return this.selectedDifficulties.includes(difficulty.level);
          });
        }

        // Apply category filter to search results if categories are selected
        if (this.selectedCategories.length > 0) {
          filteredSearchResults = filteredSearchResults.filter((recipe) => {
            return this.selectedCategories.includes(recipe.category);
          });
        }

        // Apply ingredient filter to search results if ingredients are selected
        if (this.selectedIngredients.length > 0) {
          filteredSearchResults = this.filterRecipesByIngredients(
            filteredSearchResults,
            true
          ); // Use 'every' for this case

          // Process ingredient matching and scoring
          filteredSearchResults = filteredSearchResults.map((recipe) =>
            this.processIngredientMatching(recipe)
          );

          // Sort by ingredient match score (highest first), then by count
          filteredSearchResults = this.sortRecipesByIngredientMatch(
            filteredSearchResults
          );
        }

        return filteredSearchResults;
      }

      // If no search text, apply ingredient filtering to all recipes
      if (this.selectedIngredients.length > 0) {
        let filteredRecipes = this.filterRecipesByIngredients(recipes, true); // Use 'every' for this case

        // Process ingredient matching and scoring
        filteredRecipes = filteredRecipes.map((recipe) =>
          this.processIngredientMatching(recipe)
        );

        // Sort by ingredient match score (highest first), then by count
        filteredRecipes = this.sortRecipesByIngredientMatch(filteredRecipes);

        return filteredRecipes;
      }

      // If no search text and no ingredients, return all recipes
      return recipes;
    },

    sortedItems() {
      return this.filteredRecipes.sort((a, b) => {
        // Sort by ingredient match score first (if ingredients are selected)
        if (this.selectedIngredients.length > 0) {
          const scoreA = (a as any).ingredientMatchScore || 0;
          const scoreB = (b as any).ingredientMatchScore || 0;
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }

          // If scores are equal, sort by match count
          const matchCountA = (a as any).ingredientMatchCount || 0;
          const matchCountB = (b as any).ingredientMatchCount || 0;
          if (matchCountB !== matchCountA) {
            return matchCountB - matchCountA;
          }
        }

        // Then sort by search relevance
        const searchScoreA = (a as any).searchScore || 0;
        const searchScoreB = (b as any).searchScore || 0;

        if (searchScoreB !== searchScoreA) {
          return searchScoreB - searchScoreA;
        }

        // Finally sort alphabetically
        return a.title.localeCompare(b.title);
      });
    },

    recipeShowed() {
      // For ingredient search, show max 10 recipes
      if (this.selectedIngredients.length > 0) {
        return this.sortedItems.slice(0, 10);
      }
      // For regular search, show the normal amount
      return this.sortedItems.slice(0, this.showRecipes);
    },

    // Total results count for FilterBox components
    totalResults() {
      return this.sortedItems.length;
    },

    // Search results for FilterBox components
    searchResults() {
      return this.currentSearchResults;
    },
  },

  methods: {
    // Helper method to check if ingredients match and return score
    ingredientsMatch(
      ingredientName: string,
      selectedName: string
    ): { matches: boolean; score: number } {
      const ingredientLower = ingredientName.toLowerCase();
      const selectedLower = selectedName.toLowerCase();

      if (ingredientLower === selectedLower) {
        // Exact match gets highest score
        return { matches: true, score: 100 };
      } else if (
        ingredientLower.startsWith(selectedLower + " ") ||
        ingredientLower.endsWith(" " + selectedLower) ||
        ingredientLower.includes(" " + selectedLower + " ")
      ) {
        // Word boundary match (e.g., "kylling" matches "kyllingfilet", "kyllingbryst")
        // but NOT "kyllingkraft" or "kyllingfond"
        return { matches: true, score: 75 };
      } else if (ingredientLower.includes(selectedLower)) {
        // Contains match (lowest score) - only for very close matches
        // This catches cases like "kylling" in "kyllingfilet" but not "kyllingkraft"
        const remainingText = ingredientLower.replace(selectedLower, "");
        if (remainingText.length <= 8) {
          // Only if the remaining text is short
          return { matches: true, score: 25 };
        }
        return { matches: false, score: 0 };
      } else {
        // No match
        return { matches: false, score: 0 };
      }
    },

    // Helper method to process ingredient matching for a recipe
    processIngredientMatching(recipe: any): any {
      if (!this.selectedIngredients.length || !recipe.ingredients) {
        return recipe;
      }

      let matchCount = 0;
      let totalScore = 0;
      const matchedIngredients = new Set();

      // Process each ingredient group
      recipe.ingredients.forEach((group: any) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient: any) => {
            if (ingredient.name) {
              this.selectedIngredients.forEach((selectedIngredient) => {
                // Skip if already matched
                if (matchedIngredients.has(selectedIngredient)) {
                  return;
                }

                // Use ingredient matching with scoring
                const matchResult = this.ingredientsMatch(
                  ingredient.name,
                  selectedIngredient
                );
                if (matchResult.matches) {
                  matchCount++;
                  matchedIngredients.add(selectedIngredient);
                  totalScore += matchResult.score;
                }
              });
            }
          });
        }
      });

      // Simple percentage: how many ingredients matched out of total selected
      const matchPercentage = Math.round(
        (matchCount / this.selectedIngredients.length) * 100
      );

      return {
        ...recipe,
        ingredientMatchCount: matchCount,
        ingredientMatchScore: totalScore, // Use the calculated total score
        ingredientMatchPercentage: matchPercentage,
      };
    },

    // Reusable method to filter recipes by ingredients
    filterRecipesByIngredients(
      recipes: any[],
      requireAll: boolean = true
    ): any[] {
      if (this.selectedIngredients.length === 0) {
        return recipes;
      }

      const filterMethod = requireAll ? "every" : "some";

      return recipes.filter((recipe) => {
        if (!recipe.ingredients) return false;

        // Check if recipe contains the required ingredients
        return this.selectedIngredients[filterMethod]((selectedIngredient) => {
          return recipe.ingredients.some((group: any) => {
            if (!group.ingredients) return false;
            return group.ingredients.some((ingredient: any) => {
              if (!ingredient.name) return false;
              const matchResult = this.ingredientsMatch(
                ingredient.name,
                selectedIngredient
              );
              return matchResult.matches;
            });
          });
        });
      });
    },

    // Reusable method to sort recipes by ingredient match
    sortRecipesByIngredientMatch(recipes: any[]): any[] {
      return recipes.sort((a: any, b: any) => {
        if (b.ingredientMatchScore !== a.ingredientMatchScore) {
          return b.ingredientMatchScore - a.ingredientMatchScore;
        }
        return b.ingredientMatchCount - a.ingredientMatchCount;
      });
    },

    onSearchInput() {
      // Clear filters when starting a new search
      if (this.selectedDifficulties.length > 0) {
        this.selectedDifficulties = [];
      }
      if (this.selectedCategories.length > 0) {
        this.selectedCategories = [];
      }

      // Debounce search suggestions
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.generateSearchSuggestions();
      }, 300);
    },

    onSearchBlur() {
      // Delay hiding suggestions to allow clicking
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    },

    generateSearchSuggestions() {
      if (!this.searchIndex || !this.search.trim() || this.search.length < 2) {
        this.searchSuggestions = [];
        this.selectedSuggestionIndex = -1;
        return;
      }

      // Use the search index for suggestions
      this.searchSuggestions = this.searchIndex.getSuggestions(this.search, 8);
      this.selectedSuggestionIndex = -1;
    },

    selectSuggestion(suggestion: string) {
      this.search = suggestion;
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    },

    // Methods for FilterBox component
    updateSelectedDifficulties(difficulties: string[]) {
      this.selectedDifficulties = difficulties;
    },

    updateSelectedCategories(categories: string[]) {
      this.selectedCategories = categories;
    },

    // Search mode management
    setSearchMode(mode: "quick" | "ingredient") {
      this.searchMode = mode;
      // Clear search when switching modes
      this.search = "";
      this.selectedIngredients = [];
      this.ingredientInput = "";
      this.showSuggestions = false;
      this.selectedDifficulties = [];
      this.selectedCategories = [];
      this.showToroMessage = false;

      // Initialize ingredients if switching to ingredient mode
      if (mode === "ingredient" && this.allIngredients.length === 0) {
        this.extractAllIngredients();
      }
    },

    extractAllIngredients() {
      const ingredients = new Set<string>();

      this.recipes.forEach((recipe) => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach((group: any) => {
            if (group.ingredients) {
              group.ingredients.forEach((ingredient: any) => {
                if (ingredient.name && ingredient.name.trim()) {
                  ingredients.add(ingredient.name.trim());
                }
              });
            }
          });
        }
      });

      this.allIngredients = Array.from(ingredients).sort();
    },

    handleIngredientInput(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        this.addIngredientFromInput();
      }
    },

    addIngredientFromInput() {
      if (this.ingredientInput.trim()) {
        const ingredient = this.ingredientInput.trim().toLowerCase();

        // Check for "toro" ingredient (case-insensitive)
        if (ingredient === "toro") {
          this.showToroMessage = true;
          this.ingredientInput = ""; // Reset input
          return; // Don't add toro to ingredients
        }

        // Reset toro message if other ingredient is added
        this.showToroMessage = false;

        if (!this.selectedIngredients.includes(ingredient)) {
          this.selectedIngredients.push(ingredient);
        }
        this.ingredientInput = ""; // Reset input
      }
    },

    removeIngredient(ingredient: string) {
      const index = this.selectedIngredients.indexOf(ingredient);
      if (index > -1) {
        this.selectedIngredients.splice(index, 1);
      }
    },

    // Handle apply from FilterBox components
    handleApply() {
      // This method is called when user applies filters from modal components
      // The filtering is already handled by the computed properties
      // This is just a placeholder for any additional logic needed
    },

    // Simple keyboard navigation
    handleInputKeydown(event: KeyboardEvent) {
      if (!this.showSuggestions || this.searchSuggestions.length === 0) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          this.selectedSuggestionIndex = Math.min(
            this.selectedSuggestionIndex + 1,
            this.searchSuggestions.length - 1
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          this.selectedSuggestionIndex = Math.max(
            this.selectedSuggestionIndex - 1,
            -1
          );
          break;
        case "Enter":
          if (this.selectedSuggestionIndex >= 0) {
            event.preventDefault();
            this.selectSuggestion(
              this.searchSuggestions[this.selectedSuggestionIndex]
            );
          }
          break;
        case "Escape":
          this.showSuggestions = false;
          this.selectedSuggestionIndex = -1;
          break;
      }
    },

    // Clear search input and reset state
    clearSearch() {
      this.search = "";
      this.showSuggestions = false;
      this.searchSuggestions = [];
      this.selectedSuggestionIndex = -1;
      // Clear filters when clearing search
      this.selectedDifficulties = [];
      this.selectedCategories = [];
    },

    // Calculate difficulty for a recipe (for SmallCards component)
    calculateDifficulty(recipe: any) {
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

.fs-search-bar {
  background-color: var(--fs-lime);
  padding: 1rem;
  padding-bottom: 2rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;

  @include bp("tablet-up") {
    padding: 2.5rem;
    margin-top: 2.5rem;
  }

  & h2 {
    margin: 0.75rem;
    font-size: 16px;
    text-align: center;
    font-weight: 400;
  }

  &__container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__search-bar {
    position: relative;
    width: 100%;

    @include bp("tablet-up") {
      width: 80%;
    }
  }

  &__input {
    font-size: 1rem;
    line-height: 1.25rem;
    padding: 0.5rem 2.5rem 0.5rem 2.5rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    width: 100%;
    display: block;
    height: 50px;

    @media (max-width: 767px) {
      font-size: 1rem; // Keep at 16px to prevent zoom
      padding: 0.75rem 2.5rem 0.75rem 2.5rem;
    }

    &:focus,
    &:active {
      outline: 2px solid var(--fs-berries-500);
    }
  }

  &__clear-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--fs-gray-500);
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      color: var(--fs-gray-700);
      background: var(--fs-gray-100);
    }

    &:focus {
      outline: 2px solid var(--fs-berries-500);
      outline-offset: 2px;
    }

    &:focus-visible {
      outline: 2px solid var(--fs-berries-500);
      outline-offset: 2px;
    }
  }

  &__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--fs-white);
    border: 1px solid var(--fs-gray-300);
    border-top: none;
    border-radius: 0 0 0.5rem 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &__suggestion-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--fs-gray-100);
    color: var(--fs-black);
    font-size: 0.875rem;
    transition: background-color 0.2s ease;

    &:hover,
    &--active {
      background-color: var(--fs-berries-50);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__filters {
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    background-color: var(--fs-berries-100);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    @include bp("tablet-up") {
      margin-top: 1.5rem;
      padding: 1.25rem;
    }
  }

  &__filter-label {
    color: var(--fs-gray-700);
    text-align: left;
    margin-bottom: 0.5rem;
  }

  &__filter-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__filter-select {
    padding: 0.5rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.25rem;
    background: white;
    font-size: 0.875rem;
    width: 100%;

    &:focus {
      outline: 2px solid var(--fs-berries-500);
    }
  }

  &__filter-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;

    @media (max-width: 767px) {
      gap: 0.375rem;
    }
  }

  &__filter-tab {
    padding: 0.5rem 1rem;
    border: 2px solid var(--fs-gray-300);
    border-radius: 2rem;
    background: white;
    color: var(--fs-gray-700);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    @media (max-width: 767px) {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
    }

    &:hover {
      background-color: var(--fs-berries-400);
      color: white;
    }

    &--active {
      background: var(--fs-berries-500);
      border-color: var(--fs-berries-500);
      color: white;
    }
  }

  &__time-filter {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__time-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__time-button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 1.5rem;
    background: white;
    color: var(--fs-gray-700);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      border-color: var(--fs-lime);
      color: var(--fs-brokkoli);
    }

    &--active {
      background: var(--fs-lime);
      border-color: var(--fs-lime);
      color: var(--fs-brokkoli);
      font-weight: 600;
    }
  }

  &__searchtxt {
    text-align: center;
    margin: 1rem;
  }

  &__search-tips {
    text-align: left;
    max-width: 500px;
    margin: 1rem auto;
    padding: 0;
    list-style: none;

    li {
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 0.25rem;
      border-left: 3px solid var(--fs-berries-500);
    }
  }

  &__icon {
    display: flex;
    position: absolute;
    padding-left: 0.75rem;
    align-items: center;
    left: 0px;
    top: 0px;
    bottom: 0px;
    pointer-events: none;
  }

  & svg {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--fs-gray-500);
  }

  // Search mode toggle
  &__mode-toggle {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1.5rem 0;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: center;
    }
  }

  &__mode-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--fs-gray-300);
    border-radius: 2rem;
    background: white;
    color: var(--fs-gray-700);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    min-height: 3rem;

    @media (max-width: 767px) {
      font-size: 0.9rem;
      padding: 0.75rem 1rem;
    }

    &:hover {
      border-color: var(--fs-lime);
      color: var(--fs-brokkoli);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &.active {
      background: var(--fs-berries-100);
      border-color: var(--fs-berries-500);
      color: var(--fs-gray-700);
    }

    &:focus-visible {
      outline: 2px solid var(--fs-berries-500);
    }
  }

  // Advanced search section
  &__advanced-section {
    text-align: center;
    margin: 1.5rem 0;
  }

  &__advanced-btn {
    background: var(--fs-berries-500);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      background: var(--fs-berries-600);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &.active {
      background: var(--fs-berries-600);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  // Ingredient finder styles
  &__ingredient-finder {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
    border: 2px solid var(--fs-berries-200);

    @media (max-width: 767px) {
      padding: 1.5rem;
      margin: 1rem 0;
    }
  }

  &__ingredient-header {
    text-align: center;
    margin-bottom: 2rem;

    h3 {
      font-size: 1.5rem;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-weight: 600;

      @media (max-width: 767px) {
        font-size: 1.25rem;
      }
    }

    p {
      color: #718096;
      margin: 0;
      font-size: 1rem;

      @media (max-width: 767px) {
        font-size: 0.9rem;
      }
    }
  }

  &__ingredient-input {
    margin-bottom: 2rem;

    label {
      display: block;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
    }
  }

  &__ingredient-text-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;

    @media (max-width: 767px) {
      padding: 0.875rem;
      font-size: 1rem; // Keep at 16px to prevent zoom
    }

    &:focus {
      outline: none;
      border-color: var(--fs-berries-500);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #a0aec0;
      font-style: italic;
    }
  }

  &__ingredient-tabs {
    margin-bottom: 2rem;

    h4 {
      color: #2d3748;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  &__ingredient-tab-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    @media (max-width: 767px) {
      gap: 0.5rem;
    }
  }

  &__no-ingredient-results {
    text-align: center;
    margin: 2rem 0;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 1rem;
    border: 2px dashed var(--fs-gray-300);

    p {
      font-size: 1.1rem;
      color: var(--fs-gray-700);
      margin: 0 0 1rem 0;
      font-style: italic;
    }
  }

  &__toro-message {
    text-align: center;
    margin: 1rem 0;
    padding: 1.5rem;
    background: rgba(255, 193, 7, 0.1);
    border-radius: 1rem;
    border: 2px solid #ffc107;

    p {
      font-size: 1.2rem;
      color: #856404;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }
  }

  // Results container layout
  &__results-container {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  &__results {
    flex: 1;
    min-width: 0; // Prevent flex item from overflowing
  }

  // Responsive FilterBox components
  &__filter-desktop {
    display: block;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__filter-mobile {
    display: none;

    @media (max-width: 768px) {
      display: block;
    }
  }
}
</style>

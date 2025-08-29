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
        />

        <!-- Search suggestions dropdown -->
        <div
          v-if="showSuggestions && searchSuggestions.length > 0"
          class="fs-search-bar__suggestions"
        >
          <div
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            class="fs-search-bar__suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>

      <!-- Filter tabs - only show when there are search results -->
      <div
        v-if="search.length && filteredRecipes.length > 0"
        class="fs-search-bar__filters"
      >
        <p>Filtrer søk</p>
        <div class="fs-search-bar__filter-tabs">
          <button
            v-for="category in availableCategories"
            :key="category.name"
            @click="toggleCategoryFilter(category.name)"
            :class="[
              'fs-search-bar__filter-tab',
              {
                'fs-search-bar__filter-tab--active':
                  selectedCategory === category.name,
              },
            ]"
          >
            {{ category.name }} ({{ category.count }})
          </button>
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

      <!-- Selected ingredients as tabs -->
      <div
        v-if="selectedIngredients.length > 0"
        class="fs-search-bar__ingredient-tabs"
      >
        <h4>Ingredienser du har:</h4>
        <div class="fs-search-bar__ingredient-tab-list">
          <div
            v-for="ingredient in selectedIngredients"
            :key="ingredient"
            class="fs-search-bar__ingredient-tab"
          >
            {{ ingredient }}
            <button
              @click="removeIngredient(ingredient)"
              class="fs-search-bar__remove-tab-btn"
            >
              ×
            </button>
          </div>
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

    <div v-if="search.length || selectedIngredients.length > 0">
      <p class="fs-search-bar__searchtxt" v-if="sortedItems.length >= 2">
        Du fant {{ sortedItems.length }} oppskrifter
      </p>
      <p class="fs-search-bar__searchtxt" v-else-if="sortedItems.length === 1">
        Du fant {{ sortedItems.length }} oppskrift
      </p>
      <div class="fs-search-bar__searchtxt" v-else>
        <p>
          Ingen oppskrifter funnet for "{{ search }}"
          <span style="font-size: 50px">🙈</span>
        </p>
        <p>Be oss om å lage det!</p>
      </div>

      <Grid v-if="sortedItems.length > 0">
        <div v-for="recipe in recipeShowed" :key="recipe.id">
          <SmallCards
            :title="recipe.title"
            :description="recipe.description"
            :image="recipe.imageurl"
            :href="'/oppskrift/' + recipe.id"
          />
        </div>
      </Grid>
    </div>
  </div>
</template>

<script lang="ts">
import getRecipes from "../data/new_recipes.json";
import SmallCards from "./cards/SmallCards.vue";
import Grid from "./Grid.vue";
import { RecipeSearchIndex } from "../utils/searchIndex";

export default {
  components: {
    SmallCards,
    Grid,
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
      selectedCategory: "",
      searchSuggestions: [] as string[],
      searchTimeout: null as any,
      searchIndex: null as RecipeSearchIndex | null,
      // Search mode and ingredient finder
      searchMode: "quick" as "quick" | "ingredient",
      selectedIngredients: [] as string[],
      allIngredients: [] as string[],
      ingredientInput: "",
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
    availableCategories() {
      // Show categories based on current search results, not all recipes
      const categories = new Map<string, number>();

      // Get the recipes that would be shown (either search results or all recipes)
      let recipesToCount = this.recipes;

      // If there's a search, use the search results for counting
      if (this.search.trim() && this.searchIndex) {
        const searchResults = this.searchIndex.search(this.search, {});
        recipesToCount = searchResults.map((result) => result.recipe);
      }

      // Count recipes in each category from the current results
      recipesToCount.forEach((recipe) => {
        const count = categories.get(recipe.category) || 0;
        categories.set(recipe.category, count + 1);
      });

      return Array.from(categories.entries()).map(([name, count]) => ({
        name,
        count,
      }));
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

      // First apply category filter if selected
      if (this.selectedCategory) {
        recipes = recipes.filter(
          (recipe) => recipe.category === this.selectedCategory
        );
      }

      // Then apply ingredient filter if ingredients are selected
      if (this.selectedIngredients.length > 0) {
        recipes = recipes.filter((recipe) => {
          if (!recipe.ingredients) return false;

          // Check if recipe contains any of the selected ingredients
          return this.selectedIngredients.some((selectedIngredient) => {
            return recipe.ingredients.some((group: any) => {
              if (!group.ingredients) return false;
              return group.ingredients.some((ingredient: any) => {
                if (!ingredient.name) return false;
                // Smart match - ingredient name must contain the selected ingredient
                // This allows "kylling" to match "kyllingfilet", "kyllingbryst", etc.
                // But "kyllingfilet" won't match "kylling"
                return ingredient.name
                  .toLowerCase()
                  .includes(selectedIngredient.toLowerCase());
              });
            });
          });
        });

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
                        this.ingredientsMatch(
                          ingredient.name,
                          selectedIngredient
                        )
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
        recipes.sort((a: any, b: any) => {
          if (b.ingredientMatchScore !== a.ingredientMatchScore) {
            return b.ingredientMatchScore - a.ingredientMatchScore;
          }
          return b.ingredientMatchCount - a.ingredientMatchCount;
        });
      }

      // Then apply search filter if there's search text
      if (this.search.trim() && this.searchIndex) {
        // Get search results
        const searchResults = this.searchIndex.search(this.search, {
          category: this.selectedCategory || undefined,
        });

        // Convert to recipe objects and apply ingredient filtering
        let filteredSearchResults = searchResults.map((result) => ({
          ...result.recipe,
          searchScore: result.score,
        }));

        // Apply ingredient filter to search results if ingredients are selected
        if (this.selectedIngredients.length > 0) {
          filteredSearchResults = filteredSearchResults.filter((recipe) => {
            if (!recipe.ingredients) return false;

            // Check if recipe contains ALL of the selected ingredients
            return this.selectedIngredients.every((selectedIngredient) => {
              return recipe.ingredients.some((group: any) => {
                if (!group.ingredients) return false;
                return group.ingredients.some((ingredient: any) => {
                  if (!ingredient.name) return false;
                  // Smart match - ingredient name must contain the selected ingredient
                  // This allows "kylling" to match "kyllingfilet", "kyllingbryst", etc.q
                  // But "kyllingfilet" won't match "kylling"
                  return ingredient.name
                    .toLowerCase()
                    .includes(selectedIngredient.toLowerCase());
                });
              });
            });
          });

          // Process ingredient matching and scoring
          filteredSearchResults = filteredSearchResults.map((recipe) =>
            this.processIngredientMatching(recipe)
          );

          // Sort by ingredient match score (highest first), then by count
          filteredSearchResults.sort((a: any, b: any) => {
            if (b.ingredientMatchScore !== a.ingredientMatchScore) {
              return b.ingredientMatchScore - a.ingredientMatchScore;
            }
            return b.ingredientMatchCount - a.ingredientMatchCount;
          });
        }

        return filteredSearchResults;
      }

      // If no search text, apply ingredient filtering to all recipes
      if (this.selectedIngredients.length > 0) {
        let filteredRecipes = recipes.filter((recipe) => {
          if (!recipe.ingredients) return false;

          // Check if recipe contains ALL of the selected ingredients
          return this.selectedIngredients.every((selectedIngredient) => {
            return recipe.ingredients.some((group: any) => {
              if (!group.ingredients) return false;
              return group.ingredients.some((ingredient: any) => {
                if (!ingredient.name) return false;
                // Smart match - ingredient name must contain the selected ingredient
                // This allows "kylling" to match "kyllingfilet", "kyllingbryst", etc.
                // But "kyllingfilet" won't match "kylling"
                return ingredient.name
                  .toLowerCase()
                  .includes(selectedIngredient.toLowerCase());
              });
            });
          });
        });

        // Process ingredient matching and scoring
        filteredRecipes = filteredRecipes.map((recipe) =>
          this.processIngredientMatching(recipe)
        );

        // Sort by ingredient match score (highest first), then by count
        filteredRecipes.sort((a: any, b: any) => {
          if (b.ingredientMatchScore !== a.ingredientMatchScore) {
            return b.ingredientMatchScore - a.ingredientMatchScore;
          }
          return b.ingredientMatchCount - a.ingredientMatchCount;
        });

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

    onSearchInput() {
      // Clear filters when starting a new search
      if (this.selectedCategory) {
        this.selectedCategory = "";
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
        return;
      }

      // Use the search index for suggestions
      this.searchSuggestions = this.searchIndex.getSuggestions(this.search, 8);
    },

    selectSuggestion(suggestion: string) {
      this.search = suggestion;
      this.showSuggestions = false;
    },

    toggleCategoryFilter(categoryName: string) {
      if (this.selectedCategory === categoryName) {
        this.selectedCategory = ""; // Deselect if already selected
      } else {
        this.selectedCategory = categoryName;
      }
    },

    // Search mode management
    setSearchMode(mode: "quick" | "ingredient") {
      this.searchMode = mode;
      // Clear search when switching modes
      this.search = "";
      this.selectedIngredients = [];
      this.ingredientInput = "";
      this.showSuggestions = false;
      this.selectedCategory = "";

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
        const ingredient = this.ingredientInput.trim();
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
    padding: 0.5rem 0.5rem 0.5rem 2.5rem;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    width: 100%;
    display: block;

    &:focus,
    &:active {
      outline: 2px solid var(--fs-berries-500);
    }
  }

  &__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
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

    &:hover {
      background-color: var(--fs-gray-100);
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
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;
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
  }

  &__ingredient-header {
    text-align: center;
    margin-bottom: 2rem;

    h3 {
      font-size: 1.5rem;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    p {
      color: #718096;
      margin: 0;
      font-size: 1rem;
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
  }

  &__ingredient-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--fs-berries-500);
    color: white;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  &__remove-tab-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
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
}
</style>

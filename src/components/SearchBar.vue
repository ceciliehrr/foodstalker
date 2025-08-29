<template>
  <div class="fs-search-bar">
    <h2>Søk i oppskrifter</h2>
    <div class="fs-search-bar__container">
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

        <!-- <div class="fs-search-bar__time-filter">
          <label class="fs-search-bar__filter-label">Tilberedningstid:</label>
          <div class="fs-search-bar__time-buttons">
            <button
              v-for="timeOption in timeOptions"
              :key="timeOption.value"
              @click="selectedTime = timeOption.value"
              :class="[
                'fs-search-bar__time-button',
                {
                  'fs-search-bar__time-button--active':
                    selectedTime === timeOption.value,
                },
              ]"
            >
              {{ timeOption.label }}
            </button>
          </div>
        </div> -->
      </div>
    </div>

    <div v-if="search.length">
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
      selectedTime: "",
      searchSuggestions: [] as string[],
      searchTimeout: null as any,
      searchIndex: null as RecipeSearchIndex | null,
    };
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
        const searchResults = this.searchIndex.search(this.search, {
          time: this.selectedTime || undefined,
        });
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

    timeOptions() {
      return [
        { value: "", label: "Alle tider" },
        { value: "quick", label: "⚡ Rask (<30 min)" },
        { value: "medium", label: "⏱️ Medium (30-60 min)" },
        { value: "long", label: "🕐 Lang (>60 min)" },
      ];
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

      // Then apply search filter if there's search text
      if (this.search.trim() && this.searchIndex) {
        // If we have a category filter, search within those results
        if (this.selectedCategory) {
          const searchResults = this.searchIndex.search(this.search, {
            category: this.selectedCategory,
            time: this.selectedTime || undefined,
          });

          return searchResults.map((result) => ({
            ...result.recipe,
            searchScore: result.score,
          }));
        } else {
          // No category filter, search all recipes
          const searchResults = this.searchIndex.search(this.search, {
            time: this.selectedTime || undefined,
          });

          return searchResults.map((result) => ({
            ...result.recipe,
            searchScore: result.score,
          }));
        }
      }

      // If no search text, return category-filtered recipes
      return recipes;
    },

    sortedItems() {
      return this.filteredRecipes.sort((a, b) => {
        // Sort by search relevance first, then alphabetically
        const scoreA = (a as any).searchScore || 0;
        const scoreB = (b as any).searchScore || 0;

        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }

        return a.title.localeCompare(b.title);
      });
    },

    recipeShowed() {
      return this.sortedItems.slice(0, this.showRecipes);
    },
  },

  methods: {
    onSearchInput() {
      // Clear filters when starting a new search
      if (this.selectedCategory || this.selectedTime) {
        this.selectedCategory = "";
        this.selectedTime = "";
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
}
</style>

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
        />
      </div>
    </div>
    <div v-if="search.length">
      <p class="fs-search-bar__searchtxt" v-if="sortedItems.length >= 1">
        Du fant {{ sortedItems.length }} oppskrifter
      </p>
      <div class="fs-search-bar__searchtxt" v-else>
        <p>Oh no! <span style="font-size: 50px">🙈</span></p>
        <p>Be oss om å lage det!</p>
      </div>
      <Grid>
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
    };
  },
  computed: {
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
      return this.sortedByCategory.filter((recipe) => {
        const search = this.search.toLowerCase();
        const title = recipe.title ? recipe.title.toLowerCase() : "";
        const category = recipe.category ? recipe.category.toLowerCase() : "";
        const chef = recipe.chef ? recipe.chef.toLowerCase() : "";
        const description = recipe.description
          ? recipe.description.toLowerCase()
          : "";
        const keywords = recipe.keywords
          ? recipe.keywords.map((k) => k.toLowerCase())
          : [];

        return (
          title.includes(search) ||
          category.includes(search) ||
          chef.includes(search) ||
          description.includes(search) ||
          keywords.includes(search)
        );
      });
    },

    sortedItems: function () {
      return this.filteredRecipes
        .slice(0)
        .sort((a, b) => a.title.localeCompare(b.title));
    },
    recipeShowed() {
      return this.sortedItems.slice(0, this.showRecipes);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;
.fs-search-bar {
  background-color: var(--fs-green-100);
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
      outline: 2px solid var(--fs-pink-500);
    }
  }
  &__searchtxt {
    text-align: center;
    margin: 1rem;
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

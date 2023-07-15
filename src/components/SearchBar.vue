<template>
  <div
    class="p-4 pb-8 mt-4 mb-4 md:p-10 md:mt-10 md:mb-10 bg-green-100 rounded-lg"
  >
    <h2 class="text-1xl text-center m-3">Søk i oppskrifter</h2>
    <div class="flex justify-center">
      <label for="search" class="sr-only">Søk</label>
      <div class="relative w-full md:w-1/2">
        <div
          class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
        >
          <svg
            class="w-5 h-5 text-gray-500"
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
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-pink-300 active:outline-pink-300"
          placeholder="Søk etter no digg.."
          required
        />
      </div>
    </div>
    <div v-if="search.length">
      <p class="txt-sm text-center" v-if="sortedItems.length >= 1">
        Du fant {{ sortedItems.length }} oppskrifter
      </p>
      <div v-else>Fant ikke no</div>

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
        return (
          recipe.title.toLowerCase().match(this.search.toLowerCase()) ||
          recipe.category.toLowerCase().match(this.search.toLowerCase()) ||
          recipe.chef.toLowerCase().match(this.search.toLowerCase()) ||
          recipe.description.toLowerCase().match(this.search.toLowerCase()) ||
          recipe.keyword.includes(this.search.toLowerCase())
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

<style></style>

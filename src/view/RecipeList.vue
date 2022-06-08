<template>
  <div class="grid">
    <div
      class="col-12 md:col-6 lg:col-4"
      v-for="recipe in recipes"
      :key="recipe.id"
    >
      <RecipeCard :recipe="recipe"></RecipeCard>
    </div>
  </div>
</template>

<script lang="ts">
import RecipeCard from "../components/RecipeCard.vue";
import jsonData from "../data/recipes.json";
import { defineComponent } from "vue";

interface Recipe {
  id?: string;
  imageurl?: string;
  alt?: string;
  title?: string;
  date?: string;
  category?: string;
  description?: string;
  longDescription?: string;
  time?: string;
  portions?: string;
  tips?: string;
  chef?: string;
  tipsurl?: string;
  ingredients?: {
    quantity?: string;
    name?: string;
  }[];
  steps?: string[];
  images?: {
    orientation?: string;
    url?: string;
    alt?: string;
  }[];
  keyword?: string[];
}

export default defineComponent({
  components: {
    RecipeCard,
  },
  data() {
    return {
      recipes: jsonData.recipes as Recipe[],
    };
  },
});
</script>

<style scoped>
</style>
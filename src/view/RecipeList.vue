<template>
  <div class="grid">
    <div class="col-12 md:col-6 lg:col-4"><RecipeCard></RecipeCard></div>
    <div class="col-12 md:col-6 lg:col-4"><RecipeCard></RecipeCard></div>
    <div class="col-12 md:col-6 lg:col-4"><RecipeCard></RecipeCard></div>
    <div class="col-12 md:col-6 lg:col-4"><RecipeCard></RecipeCard></div>
  </div>
</template>

<script lang="ts">
import RecipeCard from "../components/RecipeCard.vue";

export default {
  components: {
    RecipeCard,
  },
};
</script>

<style scoped>
</style>
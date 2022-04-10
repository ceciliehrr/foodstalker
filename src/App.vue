<script setup lang="ts">
import RecipeList from "./view/RecipeList.vue";
import Navigation from "./components/Navigation.vue";
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<template>
  <Navigation></Navigation>
  <div class="main-container">
    <RecipeList></RecipeList>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto:wght@300;400&display=swap");
html,
body {
  padding: 0;
  margin: 0;
}
#app {
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
}
.main-container {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  max-width: 1000px;
}
</style>

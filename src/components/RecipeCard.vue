<template>
  <a href="" class="no-underline">
    <Card>
      <template #header>
        <div class="emoji-container">
          <img :src="recipe.imageurl" :alt="recipe.alt" loading="lazy" />
          <div class="emoji" v-if="recipe.category === 'hverdag'">
            <span>&#127836;</span>
          </div>
          <div class="emoji" v-else-if="recipe.category === 'helg'">
            <span>&#127790;</span>
          </div>
          <div class="emoji" v-else-if="recipe.category === 'søtt'">
            <span>&#127849;</span>
          </div>
          <div class="emoji" v-else-if="recipe.category === 'tilbehør'">
            <span>&#127805;</span>
          </div>
          <div class="emoji" v-else-if="recipe.category === 'turmat'">
            <span>&#128293;</span>
          </div>
        </div>
      </template>

      <template #title>
        <p class="text-left">{{ recipe.title }}</p>
      </template>

      <template #content>
        <p class="text-left">
          {{ recipe.description }}
        </p>
      </template>
      <template #footer>
        <p class="text-right">{{ recipe.date }}</p>
      </template>
    </Card>
  </a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RecipeCard",
  props: {
    recipe: Object,
  },
});
</script>

<style lang="scss" scoped>
img {
  width: 100%;
  height: 35vw;
  object-fit: cover;
}
.p-card {
  background-color: var(--card-background-color);
  color: var(--card-text-color);
  height: 100%;
}
.p-card:hover,
.p-card:focus,
.p-card:active {
  box-shadow: 0 8px 16px 0 var(--card-shadow);
  opacity: 0.9;
  filter: alpha(opacity=20);
  /* For IE8 and earlier */
}
:deep(.p-card-content) {
  max-height: 100px;
  min-height: 100px;
}
:deep(.p-card-body) {
  height: 100%;
}
:deep(.p-card-title) {
  color: var(--card-title-color);
}
:deep(.p-card-footer) {
  color: var(--card-date-color);
}
.p-card .emoji-container {
  position: relative;
  display: inline;
}
.p-card .emoji {
  background-color: var(--card-theme-circle);
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  min-height: 3rem;
  min-width: 3rem;

  padding: 10px 0;
  position: absolute;

  text-align: center;
  text-transform: uppercase;

  bottom: -15px;
  right: 5px;
}
</style>
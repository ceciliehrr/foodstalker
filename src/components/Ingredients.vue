<template>
  <div class="fs-ingredients">
    <h2 class="fs-ingredients__title">Ingredienser</h2>

    <div v-for="(group, index) in ingredients" :key="index">
      <div v-if="group.title">
        <h3 class="fs-ingredients__group-title">{{ group.title }}</h3>
      </div>
      <ul class="fs-ingredients__ol-list" tabindex="0">
        <li
          tabindex="0"
          class="fs-checkbox__list"
          v-for="(ingredient, ingredientIndex) in group.ingredients"
          :key="ingredient.name"
        >
          <label
            :for="'ingredient-' + index + '-' + ingredientIndex"
            class="fs-checkbox__container"
          >
            <input
              type="checkbox"
              :id="'ingredient-' + index + '-' + ingredientIndex"
              :aria-labelledby="
                'label-ingredient-' + index + '-' + ingredientIndex
              "
            />
            <span class="fs-checkmark"></span>
            <strong
              :id="'label-ingredient-' + index + '-' + ingredientIndex"
              class="fs-checkbox__text"
              v-html="ingredient.quantity"
            ></strong>
            <p
              :id="'label-ingredient-' + index + '-' + ingredientIndex"
              class="fs-checkbox__text"
              v-html="ingredient.name"
            ></p>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
//import getRecipe from "../data/recipes.json";

export default {
  props: {
    ingredients: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      //ingredient: this.ingredients.map((ing) => ing.ingredients),
    };
  },
};
</script>

<style scoped lang="scss">
@use "../styles/mixins/" as *;
.fs-ingredients {
  & h2 {
    @include get-text("fs-h5");
    margin-bottom: 0.5rem;
  }
  & h3 {
    @include get-text("fs-subtitle2");
    margin-bottom: 0.4rem;
  }

  &__ol-list {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
    margin-left: 0.5rem;
  }
}
/**Checkbox*/
</style>

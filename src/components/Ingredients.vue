<template>
  <div class="fs-ingredients">
    <h2 class="fs-ingredients__title">Ingredienser</h2>
    <label for="serving">Portions :</label>
    <input type="number" v-model="serving" />
    <button @click="decreaseServing">-</button>
    <button @click="increaseServing">+</button>
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
              >{{ serving * getNumericValue(ingredient.quantity) }}</strong
            >
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
    portions: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      portion: this.portions,

      //ingredient: this.ingredients.map((ing) => ing.ingredients),
    };
  },
  computed: {
    serving: {
      get() {
        return this.portion;
      },
      set(value) {
        this.$emit("update:portion", value);
      },
    },
  },
  methods: {
    decreaseServing() {
      this.serving = this.serving - 1;
    },
    increaseServing() {
      this.serving = this.serving + 1;
    },
    getNumericValue(quantity) {
      // Use regular expression to extract numeric value, including decimals
      const match = quantity.match(/\d+(\.\d+)?/);

      if (match) {
        const numericValue = parseFloat(match[0]);
        return isNaN(numericValue) ? 0 : numericValue;
      }

      return 0; // Default value if no numeric value is found
    },
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
    margin-top: 1rem;
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

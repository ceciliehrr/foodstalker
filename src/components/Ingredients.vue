<template>
  <div class="fs-ingredients">
    <div class="fs-ingredients__container">
      <h2 class="fs-ingredients__title">Ingredienser</h2>

      <label class="fs-ingredients__portions" for="portion">Posjoner:</label>
      <div class="fs-ingredients__input-container">
        <button class="fs-ingredients__button" @click="decreaseServing">
          -
        </button>
        <input class="fs-ingredients__input" type="number" v-model="portion" />
        <button class="fs-ingredients__button" @click="increaseServing">
          +
        </button>
      </div>
    </div>
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
              >{{ calculateAdjustedQuantity(ingredient.quantity) }}</strong
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
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      portion: this.portions,
    };
  },
  methods: {
    decreaseServing() {
      this.portion = this.portion - 1;
    },
    increaseServing() {
      this.portion = this.portion + 1;
    },
    calculateAdjustedQuantity(originalQuantity) {
      // Adjust the quantity based on the selected portion

      // You may want to format the quantity here if needed
      // Extract the numeric value and unit from the original quantity
      const match = originalQuantity.match(/([\d.-]+)\s*([^\d\s-]+)/);

      if (match) {
        // If there is a hyphen in the matched numeric value, it's a range
        const isRange = match[1].includes("-");

        if (isRange) {
          // Handle the case where the original quantity is a range
          const rangeParts = match[1].split("-");
          const unit = match[2];

          // Adjust each part of the range based on the selected portion
          const adjustedRange = rangeParts.map((part) => {
            const numericValue = parseFloat(part);
            const adjustedValue = (numericValue / this.portions) * this.portion;
            const formattedValue =
              adjustedValue % 1 === 0
                ? adjustedValue.toFixed(0)
                : adjustedValue.toFixed(1);

            return formattedValue;
          });

          // You may want to format the quantity here if needed
          return `${adjustedRange.join("-")} ${unit}`;
        } else {
          // Handle the case where the original quantity is a single value
          const numericValue = parseFloat(match[1]);
          const unit = match[2];

          // Adjust the numeric value based on the selected portion
          const adjustedValue = (numericValue / this.portions) * this.portion;

          const formattedValue =
            adjustedValue % 1 === 0
              ? adjustedValue.toFixed(0)
              : adjustedValue.toFixed(1);

          // You may want to format the quantity here if needed
          return formattedValue + " " + unit;
        }
      } else {
        // If no numeric value and unit are found, return the original quantity
        return originalQuantity;
      }
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
  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    @include bp("tablet-big-up") {
      align-items: flex-start;
    }
  }
  &__input-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  &__button {
    font-size: 1rem;
    background-color: var(--fs-pink-400);
    color: white;
    line-height: 1.25rem;
    padding: 0.5rem;
    text-align: center;
    border: none;
    height: 40px;
    width: 40px;
    border-radius: 50%;

    display: block;
    text-decoration: none;
    margin: 0.5rem;

    &:focus,
    &:active,
    &:hover {
      cursor: pointer;
      outline: 2px solid var(--fs-pink-300);
      background-color: var(--fs-pink-300);
    }
    /* Chrome, Safari, Edge, Opera */
  }
  &__input {
    font-size: 1rem;
    line-height: 1.25rem;
    padding: 0.5rem;
    text-align: center;
    border: 1px solid var(--fs-gray-300);
    border-radius: 0.5rem;
    width: 60px;
    display: block;

    &:focus,
    &:active {
      outline: 2px solid var(--fs-pink-500);
    }
    /* Chrome, Safari, Edge, Opera */
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
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

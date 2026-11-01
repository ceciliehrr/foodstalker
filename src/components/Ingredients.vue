<template>
  <div class="fs-ingredients">
    <div class="fs-ingredients__container">
      <h2 class="fs-ingredients__title">Ingredienser</h2>

      <label class="fs-ingredients__portions" for="portion">Posjoner:</label>
      <div class="fs-ingredients__input-container">
        <button class="fs-ingredients__button" @click="decreaseServing">
          -
        </button>
        <input
          class="fs-ingredients__input"
          id="portion"
          type="number"
          min="1"
          :value="portion"
          @input="setPortion($event.target.value)"
        />
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
            :id="'ingredient-label' + index + '-' + ingredientIndex"
          >
            <input
              type="checkbox"
              :checked="isChecked(index + '-' + ingredientIndex)"
              @change="
                state.ingredients[index + '-' + ingredientIndex] =
                  $event.target.checked
              "
              :id="'ingredient-' + index + '-' + ingredientIndex"
              :aria-labelledby="
                'ingredient-label' + index + '-' + ingredientIndex
              "
            />
            <span class="fs-checkmark"></span>
            <p
              :id="'label-ingredient-' + index + '-' + ingredientIndex"
              class="fs-checkbox__text"
            >
              <span class="fs-checkbox__quantity">
                {{ calculateAdjustedQuantity(ingredient.quantity) }} </span
              >&nbsp;<span v-html="getIngredientDisplayName(ingredient)"></span>
            </p>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useRecipeState } from "../utils/recipeState";
import {
  scaleQuantity,
  getIngredientDisplayName,
} from "../utils/scaleQuantity";

export default {
  props: {
    recipeId: {
      type: String,
      required: true,
    },
    ingredients: {
      type: Object,
      required: true,
    },
    portions: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    // Komponenten server-rendres (client:idle). Kokkemodus kan ha lest inn
    // lagrede valg før denne hydreres, så vi viser standardverdier frem til
    // vi selv er montert – ellers blir det hydration mismatch.
    const isMounted = ref(false);
    onMounted(() => (isMounted.value = true));
    return {
      state: useRecipeState(props.recipeId, props.portions),
      isMounted,
    };
  },
  computed: {
    portion() {
      return this.isMounted ? this.state.portion : this.portions;
    },
  },
  methods: {
    calculateCombinedIngredient(quantity: string, name: string) {
      const adjusted = this.calculateAdjustedQuantity(quantity);
      return `${adjusted}\u00A0${name}`;
    },
    isChecked(key) {
      return this.isMounted && !!this.state.ingredients[key];
    },
    setPortion(value) {
      const n = parseInt(value, 10);
      if (n > 0) this.state.portion = n;
    },
    decreaseServing() {
      if (this.state.portion > 1) this.state.portion -= 1;
    },
    increaseServing() {
      this.state.portion += 1;
    },
    calculateAdjustedQuantity(originalQuantity) {
      return scaleQuantity(originalQuantity, this.portions, this.portion);
    },
    getIngredientDisplayName,
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
    touch-action: none; // prevent zoom on double tap
    font-size: 1rem;
    background-color: var(--fs-berries-400);
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
      outline: 2px solid var(--fs-berries-300);
      background-color: var(--fs-berries-300);
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
      outline: 2px solid var(--fs-berries-500);
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

.fs-checkbox__text {
  white-space: normal;
  word-break: break-word;
}
.fs-checkbox__quantity {
  font-weight: 600; // eller 700, avhengig av hva som er definert i fontsystemet ditt
}
/**Checkbox*/
</style>

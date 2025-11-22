<template>
  <div>
    <button class="fs-btn fs-btn--kokkemodus" @click="openModal()">
      👩🏼‍🍳 Kokkemodus
    </button>
    <swipe-modal
      v-model="isModal"
      @close="closeModal()"
      client:only="vue"
      snap-point="90dvh"
    >
      <div class="tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content" v-show="activeTab === 'ingredients'">
        <label class="fs-ingredients__portions" for="portion-cookingmode"
          >Posjoner</label
        >
        <div class="fs-ingredients__input-container">
          <button class="fs-ingredients__button" @click="decreaseServing">
            -
          </button>
          <input
            class="fs-ingredients__input"
            type="number"
            v-model="portion"
            id="portion-cookingmode"
          />
          <button class="fs-ingredients__button" @click="increaseServing">
            +
          </button>
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
                :for="'ingredient-cookingmode' + index + '-' + ingredientIndex"
                class="fs-checkbox__container"
                :id="
                  'ingredient-label-cookingmode' + index + '-' + ingredientIndex
                "
              >
                <input
                  type="checkbox"
                  :id="'ingredient-cookingmode' + index + '-' + ingredientIndex"
                  :aria-labelledby="
                    'ingredient-label-cookingmode' +
                    index +
                    '-' +
                    ingredientIndex
                  "
                />
                <span class="fs-checkmark"></span>
                <strong
                  :id="
                    'label-ingredient-cookingmode' +
                    index +
                    '-' +
                    ingredientIndex
                  "
                  class="fs-checkbox__text"
                  >{{ calculateAdjustedQuantity(ingredient.quantity) }}</strong
                >
                <p
                  :id="
                    'label-ingredient-cookingmode' +
                    index +
                    '-' +
                    ingredientIndex
                  "
                  class="fs-checkbox__text"
                  v-html="getIngredientDisplayName(ingredient)"
                ></p>
              </label>
            </li>
          </ul>
        </div>
      </div>
      <div class="tab-content" v-show="activeTab === 'steps'">
        <div v-for="(step, stepsIndex) in steps">
          <h3>{{ step.title }}</h3>
          <ul class="fs-ingredients__ol-list">
            <li class="fs-checkbox__list">
              <label
                :for="'ingredient-cookingmode' + stepsIndex"
                class="fs-checkbox__container"
                :id="'ingredient-label-cookingmode' + stepsIndex"
              >
                <input
                  type="checkbox"
                  :id="'ingredient-cookingmode' + stepsIndex"
                  :aria-labelledby="
                    'ingredient-label-cookingmode' + stepsIndex
                  " />
                <span class="fs-checkmark"></span>
                <p
                  :id="'label-ingredient-cookingmode' + stepsIndex"
                  class="fs-checkbox__text"
                  v-html="step.description"
                ></p
              ></label>
            </li>
          </ul>
        </div>
      </div>
    </swipe-modal>
  </div>
</template>

<script>
import swipeModal from "@takuma-ru/vue-swipe-modal";
import { ref } from "vue";

export default {
  components: {
    swipeModal,
  },
  props: {
    ingredients: {
      type: Array,
      required: true,
    },
    steps: {
      type: Array,
      required: true,
    },
    portions: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isModal: ref(false),
      //showModal: false,
      activeTab: "ingredients",
      tabs: [
        { id: "ingredients", label: "Ingredienser" },
        { id: "steps", label: "Oppskrift" },
      ],
      portion: this.portions,
    };
  },
  methods: {
    switchTab(tabId) {
      this.activeTab = tabId;
    },
    openModal() {
      this.isModal = true;
      document.body.style.overflow = "hidden"; // Prevent page scrolling
    },
    closeModal() {
      this.isModal = false;
      document.body.style.overflow = ""; // Revert back to default scrolling
    },
    decreaseServing() {
      this.portion = this.portion - 1;
    },
    increaseServing() {
      this.portion = this.portion + 1;
    },
    calculateAdjustedQuantity(originalQuantity) {
      // Adjust the quantity based on the selected portion

      // Handle empty or invalid quantities
      if (!originalQuantity || originalQuantity.trim() === "") {
        return "";
      }

      // Handle ranges with fractions first (like "1/2-1 dl", "1/4-2 stk")
      const rangeWithFractionMatch = originalQuantity.match(
        /(\d+\/\d+)\s*-\s*([\d.]+)\s*([^\d\s\/-]+)/
      );
      if (rangeWithFractionMatch) {
        const fraction = rangeWithFractionMatch[1];
        const secondValue = rangeWithFractionMatch[2];
        const unit = rangeWithFractionMatch[3];

        // Convert fraction to decimal for calculation
        const [numerator, denominator] = fraction.split("/").map(Number);
        const decimalValue = numerator / denominator;
        const secondNumericValue = parseFloat(secondValue);

        // Adjust both values based on the selected portion
        const adjustedFirst = (decimalValue / this.portions) * this.portion;
        const adjustedSecond =
          (secondNumericValue / this.portions) * this.portion;

        // Format both values as decimals for consistency in ranges
        const formattedFirst =
          adjustedFirst % 1 === 0
            ? adjustedFirst.toFixed(0)
            : adjustedFirst.toFixed(1);

        const formattedSecond =
          adjustedSecond % 1 === 0
            ? adjustedSecond.toFixed(0)
            : adjustedSecond.toFixed(1);

        return `${formattedFirst}-${formattedSecond} ${unit}`;
      }

      // Handle simple fractions (like "1/2 dl", "1/4 stk")
      const fractionMatch = originalQuantity.match(
        /(\d+\/\d+)\s*([^\d\s\/-]+)/
      );
      if (fractionMatch) {
        const fraction = fractionMatch[1];
        const unit = fractionMatch[2];

        // Convert fraction to decimal for calculation
        const [numerator, denominator] = fraction.split("/").map(Number);
        const decimalValue = numerator / denominator;

        // Adjust the numeric value based on the selected portion
        const adjustedValue = (decimalValue / this.portions) * this.portion;

        // Always format as decimal for consistency
        const formattedValue =
          adjustedValue % 1 === 0
            ? adjustedValue.toFixed(0)
            : adjustedValue.toFixed(1);
        return `${formattedValue} ${unit}`;
      }

      // Extract the numeric value and unit from the original quantity
      // Updated regex to handle ranges with spaces around hyphen
      const match = originalQuantity.match(/([\d.\s-]+)\s*([^\d\s-]+)/);

      if (match) {
        // Clean up the numeric part by removing extra spaces
        const numericPart = match[1].trim();
        const unit = match[2];

        // Check if it's a range (contains hyphen and has spaces around it)
        const isRange =
          numericPart.includes("-") ||
          numericPart.includes(" -") ||
          numericPart.includes("- ");

        if (isRange) {
          // Handle the case where the original quantity is a range
          // Split on hyphen and clean up spaces
          const rangeParts = numericPart
            .split(/-|\s-\s|\s-/)
            .map((part) => part.trim())
            .filter((part) => part);
          const unit = match[2];

          // Adjust each part of the range based on the selected portion
          const adjustedRange = rangeParts.map((part) => {
            const numericValue = parseFloat(part);

            // Validate that we have a valid number
            if (isNaN(numericValue)) {
              return part; // Return original if not a valid number
            }

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
          const numericValue = parseFloat(numericPart);

          // Validate that we have a valid number
          if (isNaN(numericValue)) {
            return originalQuantity; // Return original if not a valid number
          }

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
    getIngredientDisplayName(ingredient) {
      if (ingredient.details) {
        return `${ingredient.name} (${ingredient.details})`;
      }
      return ingredient.name;
    },
  },
};
</script>

<style lang="scss" scoped>
/* Add your CSS styles here */
@use "../styles/mixins/" as *;
button {
  text-decoration: none;
  &:hover {
    color: var(--fs-berries-500);
  }
}

.modal-style {
  background-color: white !important;
  color: var(--fs-black) !important;
  border-top-left-radius: 2.25rem !important;
  border-top-right-radius: 2.25rem !important;
}

.tabs {
  display: flex;
  position: fixed;
  width: 100%;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--fs-gray-200);
  z-index: 4;
  background-color: white;
}

.tab-content {
  margin-top: 40px;
  padding: 1rem;
  padding-bottom: 8rem; // Extra bottom padding for better scrolling

  h3 {
    font-size: 16px;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  ul {
    margin-top: 8px;
  }
}

.tab-button {
  padding: 10px 20px;
  width: 100%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
}

.tab-button.active {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-decoration-color: var(--fs-berries-300);
  text-underline-offset: 11px;
  border-radius: 8px;
  background-color: var(--fs-gray-100);
}

// Kokkemodus button - custom style to match original
.fs-btn--kokkemodus {
  background-color: var(--fs-berries-100);
  border: 1px solid var(--fs-berries-500);
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--fs-black);
  cursor: pointer;
  font-weight: 400;

  &:hover {
    background-color: var(--fs-berries-200);
    border-color: var(--fs-berries-600);
  }

  &:active {
    background-color: var(--fs-berries-300);
    border-color: var(--fs-berries-700);
  }
}

.fs-ingredients {
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
  &__portions {
    display: flex;
    justify-content: center;
    width: 100%;
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
</style>

<template>
  <div>
    <button class="open-modal-button" @click="openModal()">
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
                  v-html="ingredient.name"
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

.open-modal-button {
  background-color: var(--fs-berries-100);
  border: 1px solid var(--fs-berries-500);
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--fs-black);
  cursor: pointer;
  font-weight: 300;
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

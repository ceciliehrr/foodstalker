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

      <p v-if="wakeLockActive" class="wake-lock-note">
        🔆 Skjermen holdes på mens kokkemodus er åpen
      </p>
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
            min="1"
            v-model.number="state.portion"
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
                  v-model="state.ingredients[index + '-' + ingredientIndex]"
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
        <div
          v-for="(step, stepsIndex) in steps"
          class="cm-step"
          :class="{
            'cm-step--done': state.steps[stepsIndex],
            'cm-step--current': stepsIndex === currentStep,
          }"
          :aria-current="stepsIndex === currentStep ? 'step' : undefined"
        >
          <h3>{{ step.title }}</h3>
          <ul class="fs-ingredients__ol-list">
            <li class="fs-checkbox__list">
              <label
                :for="'step-cookingmode' + stepsIndex"
                class="fs-checkbox__container"
                :id="'ingredient-label-cookingmode' + stepsIndex"
              >
                <input
                  type="checkbox"
                  v-model="state.steps[stepsIndex]"
                  :id="'step-cookingmode' + stepsIndex"
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
      <div class="reset">
        <button class="reset-button" @click="reset">
          Nullstill avkrysninger og porsjoner
        </button>
      </div>
    </swipe-modal>
  </div>
</template>

<script>
import swipeModal from "@takuma-ru/vue-swipe-modal";
import { ref } from "vue";
import { useRecipeState, resetRecipeState } from "../utils/recipeState";
import {
  scaleQuantity,
  getIngredientDisplayName,
} from "../utils/scaleQuantity";

export default {
  components: {
    swipeModal,
  },
  props: {
    recipeId: {
      type: String,
      required: true,
    },
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
      wakeLock: null,
      wakeLockActive: false,
    };
  },
  setup(props) {
    return { state: useRecipeState(props.recipeId, props.portions) };
  },
  computed: {
    portion() {
      return this.state.portion;
    },
    // Første steg som ikke er krysset av – der du er i oppskriften nå
    currentStep() {
      const index = this.steps.findIndex((_, i) => !this.state.steps[i]);
      return index === -1 ? null : index;
    },
  },
  watch: {
    // Dekker både knappen og når modalen sveipes ned
    isModal(open) {
      if (open) {
        this.requestWakeLock();
      } else {
        this.releaseWakeLock();
      }
    },
  },
  mounted() {
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  },
  beforeUnmount() {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.releaseWakeLock();
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
      if (this.state.portion > 1) this.state.portion -= 1;
    },
    increaseServing() {
      this.state.portion += 1;
    },
    // Hold skjermen på mens man lager mat (Screen Wake Lock API).
    // Støttes ikke i alle nettlesere – da skjer det bare ingenting.
    async requestWakeLock() {
      if (!("wakeLock" in navigator) || this.wakeLock) return;
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
        this.wakeLockActive = true;
        this.wakeLock.addEventListener("release", () => {
          this.wakeLock = null;
          this.wakeLockActive = false;
        });
      } catch {
        this.wakeLockActive = false;
      }
    },
    releaseWakeLock() {
      this.wakeLock?.release();
      this.wakeLock = null;
      this.wakeLockActive = false;
    },
    // Nettleseren slipper låsen når fanen skjules – be om den igjen
    onVisibilityChange() {
      if (document.visibilityState === "visible" && this.isModal) {
        this.requestWakeLock();
      }
    },
    reset() {
      resetRecipeState(this.recipeId, this.portions);
    },
    calculateAdjustedQuantity(originalQuantity) {
      return scaleQuantity(originalQuantity, this.portions, this.portion);
    },
    getIngredientDisplayName,
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

.wake-lock-note {
  text-align: center;
  font-size: 0.8rem;
  color: var(--fs-gray-600);
  margin: 0.5rem 0 0;
}
.cm-step {
  padding: 0.5rem 0.75rem;
  margin: 0 -0.75rem 0.5rem;
  border-left: 4px solid transparent;
  border-radius: 0.25rem;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &--done {
    opacity: 0.45;
  }
  &--current {
    border-left-color: var(--fs-berries-400);
    background-color: var(--fs-berries-50);
  }
}
.reset {
  display: flex;
  justify-content: center;
  margin: 2rem 0 1rem;
}
.reset-button {
  background: none;
  border: none;
  font-size: 0.875rem;
  text-decoration: underline;
  color: var(--fs-gray-600);
  cursor: pointer;
  padding: 0.5rem;
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

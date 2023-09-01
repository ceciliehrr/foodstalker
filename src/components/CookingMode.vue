<template>
  <div>
    <button class="open-modal-button" @click="isModal = true">
      👩🏼‍🍳 Matlagingsmodus
    </button>
    <swipe-modal
      v-model="isModal"
      contents-height="98vh"
      border-top-radius="24px"
    >
      <div class="modal">
        <div class="modal-content">
          <div class="modal-buttonwrapper">
            <button class="close-button" @click="closeModal"></button>
          </div>
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
          <div class="tab-content" v-show="activeTab === 'steps'">
            <div v-for="(step, stepsIndex) in steps">
              <ul class="fs-ingredients__ol-list">
                {{
                  step.title
                }}
                <li class="fs-checkbox__list">
                  <label
                    :for="'ingredient-' + stepsIndex"
                    class="fs-checkbox__container"
                  >
                    <input
                      type="checkbox"
                      :id="'ingredient-' + stepsIndex"
                      :aria-labelledby="'label-ingredient-' + stepsIndex" />
                    <span class="fs-checkmark"></span>
                    <p
                      :id="'label-ingredient-' + stepsIndex"
                      class="fs-checkbox__text"
                      v-html="step.description"
                    ></p
                  ></label>
                </li>
              </ul>
            </div>
          </div>
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
    };
  },
  methods: {
    switchTab(tabId) {
      this.activeTab = tabId;
    },
    openModal() {
      this.showModal = true;
      document.body.style.overflow = "hidden"; // Prevent page scrolling
    },
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = ""; // Revert back to default scrolling
    },
  },
};
</script>

<style scoped>
/* Add your CSS styles here */
.modal {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  height: 100%;
}

.tabs {
  display: flex;

  margin-bottom: 20px;
  border-bottom: 1px solid var(--fs-gray-200);
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
  text-decoration-color: var(--fs-pink-300);
  text-underline-offset: 11px;
  border-radius: 8px;
  background-color: var(--fs-gray-100);
}
.modal-buttonwrapper {
  display: flex;
  justify-content: center;

  margin-bottom: 24px;
}
.close-button {
  text-align: center;
  width: 50px;
  background: var(--fs-pink-300);
  height: 8px;
  border: none;
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
}

.open-modal-button {
  background-color: var(--fs-pink-100);
  border: 1px solid var(--fs-black);
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--fs-black);
  cursor: pointer;
}
</style>

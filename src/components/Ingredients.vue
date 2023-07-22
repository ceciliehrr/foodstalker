<template>
  <div class="fs-ingredients">
    <h2 class="fs-ingredients__title">Ingredienser</h2>

    <div v-for="(group, index) in ingredients" :key="index">
      <div v-if="group.title">
        <h3 class="fs-ingredients__group-title">{{ group.title }}</h3>
      </div>
      <ul class="fs-ingredients__ol-list" tabindex="0">
        <li
          class="checkbox__list"
          v-for="ingredient in group.ingredients"
          :key="ingredient.name"
        >
          <label class="checkbox__container">
            <input type="checkbox" />
            <span class="checkmark"></span>
            <strong
              class="checkbox__quantity"
              v-html="ingredient.quantity"
            ></strong>
            <span class="checkbox__text" v-html="ingredient.name"></span>
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
.fs-ingredients {
  & h2 {
    font-size: 1.5rem;
    line-height: 2rem;
    margin-bottom: 0.5rem;
  }
  & h3 {
    font-size: 1rem;
    font-weight: 500;
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
.checkbox__list {
  display: flex;
}
.checkbox__quantity {
  margin-right: 0.75rem;
  flex: auto 0 0;
}
/* The container */
.checkbox__container {
  display: flex;
  flex: auto;
  flex-wrap: wrap;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.checkbox__container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 5px;
  left: 8px;
  height: 15px;
  width: 15px;
  background-color: #eee;
  border: 1px solid #4a686d;
  border-radius: 50%;
}

/* On mouse-over, add a grey background color */
.checkbox__container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.checkbox__container input:checked ~ .checkmark {
  background-color: var(--fs-pink-300);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.checkbox__container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox__container input:checked ~ .checkbox__text,
.checkbox__container input:checked ~ .checkbox__quantity {
  text-decoration: line-through;
  text-decoration-color: var(--fs-pink-500);
  color: #4a686d;
}

/* Style the checkmark/indicator */
.checkbox__container .checkmark:after {
  top: 2%;
  left: 30%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>

<template>
    <h2 class="text-2xl">Ingredienser</h2>

    <div v-for="(ingredient, title) in ingredients" :key=title>
        <div v-if="title">
            <div class="text-xl">{{title}}</div>
        </div>
        <ol>
            <li class="mb-1" v-for="values in ingredient" :key="values.name">
                <label class="checkbox__container">
                    <input type="checkbox" />
                    <span class="checkmark"></span>
                    <strong class="checkbox__text" v-html="values.quantity">

                    </strong>
                    <span class="checkbox__text" v-html="values.name"> </span>
                </label>
            </li>
        </ol>

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
        }
    }
}
</script>

<style scoped>
/**Checkbox*/

/* The container */
.checkbox__container {
    display: block;
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
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: #eee;
}

/* On mouse-over, add a grey background color */
.checkbox__container:hover input~.checkmark {
    background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.checkbox__container input:checked~.checkmark {
    background-color: var(--dark-pink);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

/* Show the checkmark when checked */
.checkbox__container input:checked~.checkmark:after {
    display: block;
}

.checkbox__container input:checked~.checkbox__text {
    text-decoration: line-through;
    color: var(--dark-pink);
}

/* Style the checkmark/indicator */
.checkbox__container .checkmark:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
}
</style>
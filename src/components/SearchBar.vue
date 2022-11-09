
<template>
    <div class="p-4 pb-8 mt-4 mb-4 md:p-10 md:mt-10 md:mb-10 bg-green-100 rounded-lg">
        <h2 class="text-2xl text-center m-3">Søk i oppskrifter</h2>
        <div class="flex justify-center">
            <label for="search" class="sr-only">Søk</label>
            <div class="relative w-1/2">
                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clip-rule="evenodd"></path>
                    </svg>
                </div>
                <input type="text" id="search" v-model="search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-300 focus:border-pink-300 block w-full pl-10 p-2.5"
                    placeholder="Søk etter no digg.." required />
            </div>
            <button type="submit"
                class="inline-flex items-center bg-white py-2.5 px-3 ml-2 text-sm font-medium text-black bg-blue-700 rounded-lg border hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-pink-300 hover:bg-pink-300 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-pink-300">
                Søk
            </button>
        </div>
        <p v-if="search">
            Du fant {{ sortedItems.length }} oppskrifter
        </p>

    </div>
    <div v-if="sortedItems.length">
        <div v-for="recipe in recipeShowed" :key="recipe.id">
            <ListGrid>
                <li>
                    <SmallCards />
                </li>
            </ListGrid>
        </div>
    </div>
</template>

<script lang="ts">
import getRecipes from "../data/recipes.json";
import SmallCards from "./cards/SmallCards.vue"
import ListGrid from "./ListGrid.vue"
export default {
    components: {
        SmallCards,
        ListGrid
    },
    data() {
        return {
            search: "",
            recipes: getRecipes,
            showRecipes: 20
        }
    },
    computed: {
        filteredRecipes() {
            return this.recipes.filter((recipe) => {
                return (
                    recipe.title.toLowerCase().match(this.search.toLowerCase()) ||
                    recipe.category.toLowerCase().match(this.search.toLowerCase()) ||
                    recipe.chef.toLowerCase().match(this.search.toLowerCase()) ||
                    recipe.description.toLowerCase().match(this.search.toLowerCase()) ||
                    recipe.keyword.includes(this.search.toLowerCase())
                );
            });
        },
        sortedItems: function () {
            return this.filteredRecipes
                .slice(0)
                .sort((a, b) => a.title.localeCompare(b.title))
        },
        recipeShowed() {
            return this.sortedItems.slice(0, this.showRecipes);
        },
    },
}
</script>


<style>

</style>

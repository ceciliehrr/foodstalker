<template>
  <div class="demo-container">
    <h1>🍳 Vanskelighetsgrad Demo</h1>
    <p class="demo-description">
      Utforsk oppskrifter basert på vanskelighetsgrad. Systemet beregner
      automatisk vanskelighet basert på antall ingredienser og antall steg.
    </p>

    <div class="demo-layout">
      <aside class="filters-sidebar">
        <DifficultyFilter
          :recipes="recipes"
          :precomputed="recipesWithDifficulty"
          :modelValue="selectedDifficulties"
          @update:modelValue="selectedDifficulties = $event"
        />

        <div class="filter-info">
          <h4>📊 Om vanskelighetsgrad</h4>
          <ul>
            <li>
              <strong>⭐ Enkel:</strong> Enkle oppskrifter, få ingredienser, få
              steg
            </li>
            <li>
              <strong>⭐⭐ Middels:</strong> Middels kompleksitet, moderate
              ingredienser og steg
            </li>
            <li>
              <strong>⭐⭐⭐ Vanskelig:</strong> Komplekse oppskrifter, mange
              ingredienser, mange steg
            </li>
          </ul>
        </div>
      </aside>

      <main class="recipes-main">
        <div class="recipes-header">
          <h2>Oppskrifter</h2>
          <p>
            Viser {{ filteredRecipes.length }} av
            {{ recipes.length }} oppskrifter
            <span v-if="selectedDifficulties.length > 0">
              (filtrert på {{ selectedDifficulties.length }} vanskelighetsgrad{{
                selectedDifficulties.length > 1 ? "er" : ""
              }})
            </span>
          </p>
        </div>

        <div class="recipes-grid">
          <Card
            v-for="recipe in filteredRecipes.slice(0, 12)"
            :key="recipe.id"
            :href="`/oppskrift/${recipe.id}`"
            :title="recipe.title"
            :emoji="recipe.category"
            :image="recipe.imageurl"
            :description="recipe.description"
            :date="recipe.date"
            :recipe="recipe"
          />
        </div>

        <div v-if="filteredRecipes.length === 0" class="no-results">
          <p>Ingen oppskrifter matcher de valgte filtrene.</p>
          <button @click="clearFilters" class="clear-filters-btn">
            Fjern alle filtre
          </button>
        </div>
      </main>
    </div>

    <div class="divider">
      <h2>Neste-nivå forslag</h2>
    </div>

    <div class="suggestions-demo">
      <p class="suggestions-intro">
        Her er et eksempel på hvordan systemet foreslår neste-nivå oppskrifter.
        Velg en oppskrift fra listen over for å se forslag.
      </p>

      <NextLevelSuggestions
        v-if="filteredRecipes.length > 0"
        :currentRecipe="filteredRecipes[0]"
        :allRecipes="recipes"
        :maxSuggestions="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import DifficultyFilter from "./DifficultyFilter.vue";
import Card from "./cards/Card.vue";
import NextLevelSuggestions from "./NextLevelSuggestions.vue";

import { calculateDifficulty, type Recipe } from "../utils/recipeDifficulty";

interface Props {
  recipes: Recipe[];
}

const props = defineProps<Props>();

const selectedDifficulties = ref<string[]>([]);

// Pre-calculate difficulties for all recipes to avoid recalculating on every filter
const recipesWithDifficulty = computed(() => {
  return props.recipes.map((recipe) => ({
    recipe,
    difficulty: calculateDifficulty(recipe),
  }));
});

const filteredRecipes = computed(() => {
  if (selectedDifficulties.value.length === 0) {
    return props.recipes;
  }

  return recipesWithDifficulty.value
    .filter(({ difficulty }) =>
      selectedDifficulties.value.includes(difficulty.level)
    )
    .map(({ recipe }) => recipe);
});

const clearFilters = () => {
  selectedDifficulties.value = [];
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.demo-container h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.demo-description {
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.demo-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.filters-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.filter-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.filter-info h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1rem;
}

.filter-info ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.filter-info li {
  margin-bottom: 0.5rem;
}

.recipes-header {
  margin-bottom: 2rem;
}

.recipes-header h2 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.recipes-header p {
  color: #64748b;
  margin: 0;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.clear-filters-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.clear-filters-btn:hover {
  background: #2563eb;
}

.suggestions-demo {
  margin-top: 2rem;
}

.suggestions-intro {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.divider {
  text-align: center;
  margin: 3rem 0;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.divider h2 {
  color: #1e293b;
  font-size: 1.5rem;
  margin: 0;
}

@media (max-width: 1024px) {
  .demo-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
    order: 2;
  }

  .recipes-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .demo-container {
    padding: 1rem;
  }

  .demo-container h1 {
    font-size: 2rem;
  }

  .recipes-grid {
    grid-template-columns: 1fr;
  }

  .recipes-title {
    font-size: 1.1rem;
  }

  .suggestion-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

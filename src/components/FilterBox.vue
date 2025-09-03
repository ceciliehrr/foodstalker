<template>
  <div class="filter-box" v-if="showFilters">
    <h3 class="filter-box__title">Filtrer resultater</h3>

    <!-- Difficulty Filter -->
    <div v-if="availableDifficulties.length > 0" class="filter-box__section">
      <h4 class="filter-box__section-title">Vanskelighetsgrad</h4>
      <div class="filter-box__checkboxes">
        <label
          v-for="difficulty in availableDifficulties"
          :key="difficulty.level"
          class="filter-box__checkbox"
        >
          <input
            type="checkbox"
            :value="difficulty.level"
            :checked="selectedDifficulties.includes(difficulty.level)"
            @change="toggleDifficulty(difficulty.level)"
            class="filter-box__checkbox-input"
          />
          <span class="filter-box__checkbox-label">
            {{ difficulty.icon }} {{ difficulty.label }} ({{
              difficulty.count
            }})
          </span>
        </label>
      </div>
    </div>

    <!-- Category Filter -->
    <div v-if="availableCategories.length > 0" class="filter-box__section">
      <h4 class="filter-box__section-title">Kategori</h4>
      <div class="filter-box__checkboxes">
        <label
          v-for="category in availableCategories"
          :key="category.name"
          class="filter-box__checkbox"
        >
          <input
            type="checkbox"
            :value="category.name"
            :checked="selectedCategories.includes(category.name)"
            @change="toggleCategory(category.name)"
            class="filter-box__checkbox-input"
          />
          <span class="filter-box__checkbox-label">
            {{ category.name }} ({{ category.count }})
          </span>
        </label>
      </div>
    </div>

    <!-- Clear All Button -->
    <div v-if="hasActiveFilters" class="filter-box__actions">
      <button @click="clearAllFilters" class="filter-box__clear-btn">
        Fjern alle filtre
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  calculateDifficulty,
  getDifficultyDisplayName,
  getDifficultyIcon,
} from "../utils/recipeDifficulty";

interface Props {
  recipes: any[];
  searchResults?: any[];
  selectedDifficulties: string[];
  selectedCategories: string[];
}

interface Emits {
  (e: "update:selectedDifficulties", value: string[]): void;
  (e: "update:selectedCategories", value: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Show filters when there are search results or active filters
const showFilters = computed(() => {
  return (
    (props.searchResults && props.searchResults.length > 0) ||
    props.selectedDifficulties.length > 0 ||
    props.selectedCategories.length > 0
  );
});

// Calculate available difficulties from search results
const availableDifficulties = computed(() => {
  const difficulties = new Map<string, number>();

  if (props.searchResults && props.searchResults.length > 0) {
    props.searchResults.forEach((recipe) => {
      const difficulty = calculateDifficulty(recipe);
      const count = difficulties.get(difficulty.level) || 0;
      difficulties.set(difficulty.level, count + 1);
    });
  }

  return Array.from(difficulties.entries()).map(([level, count]) => ({
    level,
    count,
    label: getDifficultyDisplayName(level),
    icon: getDifficultyIcon(level),
  }));
});

// Calculate available categories from search results
const availableCategories = computed(() => {
  const categories = new Map<string, number>();

  if (props.searchResults && props.searchResults.length > 0) {
    props.searchResults.forEach((recipe) => {
      const count = categories.get(recipe.category) || 0;
      categories.set(recipe.category, count + 1);
    });
  }

  return Array.from(categories.entries()).map(([name, count]) => ({
    name,
    count,
  }));
});

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return (
    props.selectedDifficulties.length > 0 || props.selectedCategories.length > 0
  );
});

// Toggle difficulty filter
const toggleDifficulty = (difficultyLevel: string) => {
  const newDifficulties = props.selectedDifficulties.includes(difficultyLevel)
    ? props.selectedDifficulties.filter((level) => level !== difficultyLevel)
    : [...props.selectedDifficulties, difficultyLevel];

  emit("update:selectedDifficulties", newDifficulties);
};

// Toggle category filter
const toggleCategory = (categoryName: string) => {
  const newCategories = props.selectedCategories.includes(categoryName)
    ? props.selectedCategories.filter((name) => name !== categoryName)
    : [...props.selectedCategories, categoryName];

  emit("update:selectedCategories", newCategories);
};

// Clear all filters
const clearAllFilters = () => {
  emit("update:selectedDifficulties", []);
  emit("update:selectedCategories", []);
};
</script>

<style scoped>
.filter-box {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--fs-gray-200);
  min-width: 280px;
  max-width: 320px;
}

.filter-box__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--fs-gray-800);
  border-bottom: 2px solid var(--fs-berries-200);
  padding-bottom: 0.5rem;
}

.filter-box__section {
  margin-bottom: 1.5rem;
}

.filter-box__section:last-of-type {
  margin-bottom: 1rem;
}

.filter-box__section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--fs-gray-700);
}

.filter-box__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-box__checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--fs-gray-200);
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fs-gray-700);
}

.filter-box__checkbox:hover {
  border-color: var(--fs-berries-300);
  background-color: var(--fs-berries-50);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-box__checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--fs-berries-500);
  cursor: pointer;
  flex-shrink: 0;
}

.filter-box__checkbox-input:checked + .filter-box__checkbox-label {
  color: var(--fs-berries-600);
  font-weight: 600;
}

.filter-box__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.filter-box__actions {
  border-top: 1px solid var(--fs-gray-200);
  padding-top: 1rem;
  margin-top: 1rem;
}

.filter-box__clear-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--fs-gray-300);
  border-radius: 0.75rem;
  background: white;
  color: var(--fs-gray-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-box__clear-btn:hover {
  border-color: var(--fs-berries-400);
  background-color: var(--fs-berries-50);
  color: var(--fs-berries-600);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-box {
    min-width: auto;
    max-width: none;
    margin-bottom: 1rem;
  }

  .filter-box__checkbox {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }
}
</style>

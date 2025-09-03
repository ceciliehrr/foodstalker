<template>
  <div class="filter-chips" v-if="showFilters">
    <!-- Filter Chips Container -->
    <div class="filter-chips__container">
      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="filter-chips__active">
        <span class="filter-chips__active-label">Aktive filtre:</span>
        <div class="filter-chips__active-chips">
          <!-- Active Difficulty Chips -->
          <div
            v-for="difficulty in activeDifficulties"
            :key="`difficulty-${difficulty.level}`"
            class="filter-chips__chip filter-chips__chip--active"
          >
            <span class="filter-chips__chip-icon">{{ difficulty.icon }}</span>
            <span class="filter-chips__chip-text">{{ difficulty.label }}</span>
            <button
              @click="removeDifficulty(difficulty.level)"
              class="filter-chips__chip-remove"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path
                  d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5 2.5 3.205 5.295 6 2.5 8.795 3.205 9.5 6 6.705 8.795 9.5 9.5 8.795 6.705 6z"
                />
              </svg>
            </button>
          </div>

          <!-- Active Category Chips -->
          <div
            v-for="category in activeCategories"
            :key="`category-${category.name}`"
            class="filter-chips__chip filter-chips__chip--active"
          >
            <span class="filter-chips__chip-text">{{ category.name }}</span>
            <button
              @click="removeCategory(category.name)"
              class="filter-chips__chip-remove"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path
                  d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5 2.5 3.205 5.295 6 2.5 8.795 3.205 9.5 6 6.705 8.795 9.5 9.5 8.795 6.705 6z"
                />
              </svg>
            </button>
          </div>
        </div>
        <button @click="clearAllFilters" class="filter-chips__clear-all">
          Fjern alle
        </button>
      </div>

      <!-- Filter Options -->
      <div class="filter-chips__options">
        <!-- Difficulty Options -->
        <div
          v-if="availableDifficulties.length > 0"
          class="filter-chips__group"
        >
          <span class="filter-chips__group-label">Vanskelighetsgrad:</span>
          <div class="filter-chips__group-chips">
            <button
              v-for="difficulty in availableDifficulties"
              :key="difficulty.level"
              @click="toggleDifficulty(difficulty.level)"
              :class="[
                'filter-chips__chip',
                'filter-chips__chip--option',
                {
                  'filter-chips__chip--selected': selectedDifficulties.includes(
                    difficulty.level
                  ),
                },
              ]"
            >
              <span class="filter-chips__chip-icon">{{ difficulty.icon }}</span>
              <span class="filter-chips__chip-text">{{
                difficulty.label
              }}</span>
              <span class="filter-chips__chip-count"
                >({{ difficulty.count }})</span
              >
            </button>
          </div>
        </div>

        <!-- Category Options -->
        <div v-if="availableCategories.length > 0" class="filter-chips__group">
          <span class="filter-chips__group-label">Kategori:</span>
          <div class="filter-chips__group-chips">
            <button
              v-for="category in availableCategories"
              :key="category.name"
              @click="toggleCategory(category.name)"
              :class="[
                'filter-chips__chip',
                'filter-chips__chip--option',
                {
                  'filter-chips__chip--selected': selectedCategories.includes(
                    category.name
                  ),
                },
              ]"
            >
              <span class="filter-chips__chip-text">{{ category.name }}</span>
              <span class="filter-chips__chip-count"
                >({{ category.count }})</span
              >
            </button>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="filter-chips__summary">
        <span class="filter-chips__summary-text">
          Viser {{ totalResults }} resultater
          <span v-if="hasActiveFilters" class="filter-chips__summary-filters">
            med {{ activeFilterCount }} filter
          </span>
        </span>
      </div>
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
  totalResults: number;
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

// Get active difficulties with their details
const activeDifficulties = computed(() => {
  return props.selectedDifficulties.map((level) => {
    const difficulty = availableDifficulties.value.find(
      (d) => d.level === level
    );
    return (
      difficulty || {
        level,
        label: getDifficultyDisplayName(level),
        icon: getDifficultyIcon(level),
      }
    );
  });
});

// Get active categories with their details
const activeCategories = computed(() => {
  return props.selectedCategories.map((name) => {
    const category = availableCategories.value.find((c) => c.name === name);
    return category || { name };
  });
});

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return (
    props.selectedDifficulties.length > 0 || props.selectedCategories.length > 0
  );
});

const activeFilterCount = computed(() => {
  return props.selectedDifficulties.length + props.selectedCategories.length;
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

// Remove specific difficulty
const removeDifficulty = (difficultyLevel: string) => {
  const newDifficulties = props.selectedDifficulties.filter(
    (level) => level !== difficultyLevel
  );
  emit("update:selectedDifficulties", newDifficulties);
};

// Remove specific category
const removeCategory = (categoryName: string) => {
  const newCategories = props.selectedCategories.filter(
    (name) => name !== categoryName
  );
  emit("update:selectedCategories", newCategories);
};

// Clear all filters
const clearAllFilters = () => {
  emit("update:selectedDifficulties", []);
  emit("update:selectedCategories", []);
};
</script>

<style scoped>
.filter-chips {
  margin-bottom: 1.5rem;
}

.filter-chips__container {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--fs-gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Active Filters */
.filter-chips__active {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--fs-gray-200);
}

.filter-chips__active-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fs-gray-600);
  margin-right: 0.5rem;
}

.filter-chips__active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.filter-chips__clear-all {
  background: none;
  border: none;
  color: var(--fs-berries-500);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  margin-left: auto;
}

.filter-chips__clear-all:hover {
  background: var(--fs-berries-50);
}

/* Filter Options */
.filter-chips__options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-chips__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-chips__group-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--fs-gray-700);
}

.filter-chips__group-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Chips */
.filter-chips__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: var(--fs-gray-100);
  color: var(--fs-gray-700);
  white-space: nowrap;
}

.filter-chips__chip--option:hover {
  background: var(--fs-berries-100);
  border-color: var(--fs-berries-200);
  color: var(--fs-berries-700);
}

.filter-chips__chip--option.filter-chips__chip--selected {
  background: var(--fs-berries-500);
  border-color: var(--fs-berries-500);
  color: white;
}

.filter-chips__chip--active {
  background: var(--fs-berries-500);
  border-color: var(--fs-berries-500);
  color: white;
  padding-right: 0.5rem;
}

.filter-chips__chip-icon {
  font-size: 0.875rem;
}

.filter-chips__chip-text {
  font-weight: 500;
}

.filter-chips__chip-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

.filter-chips__chip-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.filter-chips__chip-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Results Summary */
.filter-chips__summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--fs-gray-200);
}

.filter-chips__summary-text {
  font-size: 0.875rem;
  color: var(--fs-gray-600);
}

.filter-chips__summary-filters {
  color: var(--fs-berries-600);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-chips__container {
    padding: 0.75rem;
  }

  .filter-chips__active {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .filter-chips__active-label {
    margin-right: 0;
  }

  .filter-chips__clear-all {
    margin-left: 0;
    align-self: flex-end;
  }

  .filter-chips__group-chips {
    gap: 0.375rem;
  }

  .filter-chips__chip {
    padding: 0.375rem 0.625rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .filter-chips__container {
    padding: 0.625rem;
  }

  .filter-chips__chip {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  .filter-chips__chip-count {
    font-size: 0.7rem;
  }
}
</style>

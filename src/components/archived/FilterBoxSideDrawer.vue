<template>
  <div class="filter-sidedrawer" v-if="showFilters">
    <!-- Side Drawer Overlay -->
    <div
      class="filter-sidedrawer__overlay"
      :class="{ 'filter-sidedrawer__overlay--open': isOpen }"
      @click="closeFilters"
    >
      <div
        class="filter-sidedrawer__drawer"
        :class="{ 'filter-sidedrawer__drawer--open': isOpen }"
        @click.stop
      >
        <!-- Header -->
        <div class="filter-sidedrawer__header">
          <h3 class="filter-sidedrawer__title">Filtrer resultater</h3>
          <button @click="closeFilters" class="filter-sidedrawer__close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        </div>

        <!-- Filter Content -->
        <div class="filter-sidedrawer__body">
          <!-- Difficulty Filter -->
          <div
            v-if="availableDifficulties.length > 0"
            class="filter-sidedrawer__section"
          >
            <h4 class="filter-sidedrawer__section-title">Vanskelighetsgrad</h4>
            <div class="filter-sidedrawer__options">
              <label
                v-for="difficulty in availableDifficulties"
                :key="difficulty.level"
                class="filter-sidedrawer__option"
              >
                <input
                  type="checkbox"
                  :value="difficulty.level"
                  :checked="selectedDifficulties.includes(difficulty.level)"
                  @change="toggleDifficulty(difficulty.level)"
                  class="filter-sidedrawer__checkbox"
                />
                <span class="filter-sidedrawer__option-content">
                  <span class="filter-sidedrawer__option-icon">{{
                    difficulty.icon
                  }}</span>
                  <span class="filter-sidedrawer__option-text">{{
                    difficulty.label
                  }}</span>
                  <span class="filter-sidedrawer__option-count"
                    >({{ difficulty.count }})</span
                  >
                </span>
              </label>
            </div>
          </div>

          <!-- Category Filter -->
          <div
            v-if="availableCategories.length > 0"
            class="filter-sidedrawer__section"
          >
            <h4 class="filter-sidedrawer__section-title">Kategori</h4>
            <div class="filter-sidedrawer__options">
              <label
                v-for="category in availableCategories"
                :key="category.name"
                class="filter-sidedrawer__option"
              >
                <input
                  type="checkbox"
                  :value="category.name"
                  :checked="selectedCategories.includes(category.name)"
                  @change="toggleCategory(category.name)"
                  class="filter-sidedrawer__checkbox"
                />
                <span class="filter-sidedrawer__option-content">
                  <span class="filter-sidedrawer__option-text">{{
                    category.name
                  }}</span>
                  <span class="filter-sidedrawer__option-count"
                    >({{ category.count }})</span
                  >
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="filter-sidedrawer__footer">
          <button @click="clearAllFilters" class="filter-sidedrawer__clear-btn">
            Fjern alle
          </button>
          <button @click="applyFilters" class="filter-sidedrawer__apply-btn">
            Se resultater ({{ totalResults }})
          </button>
        </div>
      </div>
    </div>

    <!-- Trigger Button -->
    <button @click="openFilters" class="filter-sidedrawer__trigger">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <span>Filtrer</span>
      <span v-if="hasActiveFilters" class="filter-sidedrawer__badge">{{
        activeFilterCount
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
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
  (e: "apply"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);

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

// Clear all filters
const clearAllFilters = () => {
  emit("update:selectedDifficulties", []);
  emit("update:selectedCategories", []);
};

// Open filters
const openFilters = () => {
  isOpen.value = true;
  document.body.style.overflow = "hidden";
};

// Close filters
const closeFilters = () => {
  isOpen.value = false;
  document.body.style.overflow = "";
};

// Apply filters
const applyFilters = () => {
  emit("apply");
  closeFilters();
};
</script>

<style scoped>
.filter-sidedrawer {
  position: relative;
}

/* Trigger Button */
.filter-sidedrawer__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid var(--fs-berries-300);
  border-radius: 0.75rem;
  color: var(--fs-berries-600);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-sidedrawer__trigger:hover {
  background: var(--fs-berries-50);
  border-color: var(--fs-berries-400);
}

.filter-sidedrawer__badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: var(--fs-berries-500);
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Side Drawer Overlay */
.filter-sidedrawer__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.filter-sidedrawer__overlay--open {
  opacity: 1;
  visibility: visible;
}

.filter-sidedrawer__drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 90vw;
  background: white;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}

.filter-sidedrawer__drawer--open {
  transform: translateX(0);
}

/* Header */
.filter-sidedrawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--fs-gray-200);
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-sidedrawer__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--fs-gray-800);
}

.filter-sidedrawer__close {
  background: none;
  border: none;
  color: var(--fs-gray-600);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.filter-sidedrawer__close:hover {
  background: var(--fs-gray-100);
  color: var(--fs-gray-800);
}

/* Body */
.filter-sidedrawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.filter-sidedrawer__section {
  margin-bottom: 1.5rem;
}

.filter-sidedrawer__section:last-child {
  margin-bottom: 0;
}

.filter-sidedrawer__section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--fs-gray-700);
}

.filter-sidedrawer__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-sidedrawer__option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 2px solid var(--fs-gray-200);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.filter-sidedrawer__option:hover {
  border-color: var(--fs-berries-300);
  background: var(--fs-berries-50);
}

.filter-sidedrawer__checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--fs-berries-500);
  cursor: pointer;
  margin-right: 0.75rem;
}

.filter-sidedrawer__option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.filter-sidedrawer__option-icon {
  font-size: 1.1rem;
}

.filter-sidedrawer__option-text {
  font-weight: 500;
  color: var(--fs-gray-800);
  font-size: 0.9rem;
}

.filter-sidedrawer__option-count {
  color: var(--fs-gray-500);
  font-size: 0.8rem;
  margin-left: auto;
}

/* Footer */
.filter-sidedrawer__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--fs-gray-200);
  background: white;
  display: flex;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
}

.filter-sidedrawer__clear-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--fs-gray-300);
  border-radius: 0.75rem;
  background: white;
  color: var(--fs-gray-600);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-sidedrawer__clear-btn:hover {
  border-color: var(--fs-gray-400);
  background: var(--fs-gray-50);
}

.filter-sidedrawer__apply-btn {
  flex: 2;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--fs-berries-500);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-sidedrawer__apply-btn:hover {
  background: var(--fs-berries-600);
}

/* Responsive */
@media (max-width: 480px) {
  .filter-sidedrawer__drawer {
    width: 100vw;
    max-width: 100vw;
  }

  .filter-sidedrawer__body {
    padding: 1rem;
  }

  .filter-sidedrawer__header {
    padding: 1rem;
  }

  .filter-sidedrawer__footer {
    padding: 1rem;
  }
}
</style>

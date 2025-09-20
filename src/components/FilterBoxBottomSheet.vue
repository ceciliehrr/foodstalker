<template>
  <div class="filter-bottomsheet" v-if="showFilters">
    <!-- Trigger Button -->
    <button @click="openFilters" class="filter-bottomsheet__trigger">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
      <span>Filtrer</span>
      <span v-if="hasActiveFilters" class="filter-bottomsheet__badge">{{
        activeFilterCount
      }}</span>
    </button>

    <!-- Swipe Modal -->
    <swipe-modal
      v-model="isOpen"
      @close="closeFilters"
      client:only="vue"
      class="modal-style"
    >
      <div class="filter-bottomsheet__content">
        <!-- Header -->
        <div class="filter-bottomsheet__header">
          <h3 class="filter-bottomsheet__title">Filtrer resultater</h3>
        </div>

        <!-- Filter Content -->
        <div class="filter-bottomsheet__body">
          <!-- Difficulty Filter -->
          <div
            v-if="availableDifficulties.length > 0"
            class="filter-bottomsheet__section"
          >
            <h4 class="filter-bottomsheet__section-title">Vanskelighetsgrad</h4>
            <div class="filter-bottomsheet__options">
              <label
                v-for="difficulty in availableDifficulties"
                :key="difficulty.level"
                class="filter-bottomsheet__option"
              >
                <input
                  type="checkbox"
                  :value="difficulty.level"
                  :checked="selectedDifficulties.includes(difficulty.level)"
                  @change="toggleDifficulty(difficulty.level)"
                  class="filter-bottomsheet__checkbox"
                />
                <span class="filter-bottomsheet__option-content">
                  <span class="filter-bottomsheet__option-icon">{{
                    difficulty.icon
                  }}</span>
                  <span class="filter-bottomsheet__option-text">{{
                    difficulty.label
                  }}</span>
                  <span class="filter-bottomsheet__option-count"
                    >({{ difficulty.count }})</span
                  >
                </span>
              </label>
            </div>
          </div>

          <!-- Category Filter -->
          <div
            v-if="availableCategories.length > 0"
            class="filter-bottomsheet__section"
          >
            <h4 class="filter-bottomsheet__section-title">Kategori</h4>
            <div class="filter-bottomsheet__options">
              <label
                v-for="category in availableCategories"
                :key="category.name"
                class="filter-bottomsheet__option"
              >
                <input
                  type="checkbox"
                  :value="category.name"
                  :checked="selectedCategories.includes(category.name)"
                  @change="toggleCategory(category.name)"
                  class="filter-bottomsheet__checkbox"
                />
                <span class="filter-bottomsheet__option-content">
                  <span class="filter-bottomsheet__option-text">{{
                    category.name
                  }}</span>
                  <span class="filter-bottomsheet__option-count"
                    >({{ category.count }})</span
                  >
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer with Apply Button -->
        <div class="filter-bottomsheet__footer">
          <div class="filter-bottomsheet__footer-content">
            <button @click="clearAllFilters" class="fs-btn fs-btn--secondary">
              Fjern filter
            </button>
            <button @click="applyFilters" class="filter-bottomsheet__apply-btn">
              Se resultater ({{ totalResults }})
            </button>
          </div>
        </div>
      </div>
    </swipe-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import swipeModal from "@takuma-ru/vue-swipe-modal";
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

<style lang="scss" scoped>
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;

.filter-bottomsheet {
  position: relative;
}

/* Modal styling for swipe modal */
.modal-style {
  background-color: white !important;
  color: var(--fs-black) !important;
  border-top-left-radius: 2.25rem !important;
  border-top-right-radius: 2.25rem !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Trigger Button */
.filter-bottomsheet__trigger {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bottomsheet__trigger:hover {
  background: var(--fs-berries-50);
  border-color: var(--fs-berries-400);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-bottomsheet__badge {
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

/* Modal Content */
.filter-bottomsheet__content {
  background: white;
  color: var(--fs-black);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Ensure all text is visible */
.filter-bottomsheet__content * {
  color: inherit;
}

/* Header */
.filter-bottomsheet__header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 2px solid var(--fs-berries-200);
  background: white;
}

.filter-bottomsheet__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--fs-black);
  text-align: center;
}

/* Body */
.filter-bottomsheet__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  padding-bottom: 0;
  background: white;
  color: var(--fs-black);
  min-height: 0; /* Allows flex item to shrink */
}

.filter-bottomsheet__section {
  margin-bottom: 1.5rem;
}

.filter-bottomsheet__section:last-child {
  margin-bottom: 0;
}

.filter-bottomsheet__section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--fs-black);
}

.filter-bottomsheet__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-bottomsheet__option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 2px solid var(--fs-gray-200);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--fs-black);
}

.filter-bottomsheet__option:hover {
  border-color: var(--fs-berries-300);
  background: var(--fs-berries-50);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bottomsheet__checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--fs-berries-500);
  cursor: pointer;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.filter-bottomsheet__option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-bottomsheet__option-icon {
  font-size: 1.1rem;
}

.filter-bottomsheet__option-text {
  font-weight: 500;
  color: var(--fs-black);
  font-size: 0.875rem;
}

.filter-bottomsheet__option-count {
  color: var(--fs-gray-600);
  font-size: 0.8rem;
  margin-left: auto;
}

.filter-bottomsheet__checkbox:checked
  + .filter-bottomsheet__option-content
  .filter-bottomsheet__option-text {
  color: var(--fs-berries-600);
  font-weight: 600;
}

/* Ensure labels are visible */
.filter-bottomsheet__option label {
  color: var(--fs-black);
}

.filter-bottomsheet__option input[type="checkbox"] {
  accent-color: var(--fs-berries-500);
}

/* Footer */
.filter-bottomsheet__footer {
  background: white;
  border-top: 1px solid var(--fs-gray-200);
  padding: 1.5rem 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  margin-top: auto;
}

.filter-bottomsheet__footer-content {
  display: flex;
  gap: 0.75rem;
}

.filter-bottomsheet__apply-btn {
  flex: 2;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--fs-berries-500);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bottomsheet__apply-btn:hover {
  background: var(--fs-berries-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-bottomsheet__apply-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 480px) {
  .filter-bottomsheet__content {
    height: 100%;
  }

  .filter-bottomsheet__body {
    padding: 1rem;
  }

  .filter-bottomsheet__header {
    padding: 1rem 1rem 0.5rem;
  }

  .filter-bottomsheet__footer {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }

  .filter-bottomsheet__option {
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
  }

  .filter-bottomsheet__title {
    font-size: 1.1rem;
  }

  .filter-bottomsheet__section-title {
    font-size: 0.95rem;
  }
}
</style>

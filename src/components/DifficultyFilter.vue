<template>
  <div class="difficulty-filter">
    <h3 class="filter-title">Vanskelighetsgrad</h3>

    <div class="difficulty-buttons">
      <button
        v-for="level in difficultyLevels"
        :key="level.value"
        @click="toggleDifficulty(level.value)"
        :class="[
          'difficulty-btn',
          `difficulty-${level.value}`,
          { active: selectedDifficulties.includes(level.value) },
        ]"
        :style="{ '--difficulty-color': level.color }"
      >
        <span class="difficulty-icon">{{ level.icon }}</span>
        <span class="difficulty-text">{{ level.label }}</span>
        <span class="recipe-count">({{ getRecipeCount(level.value) }})</span>
      </button>
    </div>

    <div class="filter-actions">
      <button @click="selectAll" class="action-btn select-all">
        Velg alle
      </button>
      <button @click="clearAll" class="action-btn clear-all">Fjern alle</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  getDifficultyDisplayName,
  getDifficultyColor,
  calculateDifficulty,
  difficultyLevels,
  type Recipe,
  type DifficultyLevel,
} from "../utils/recipeDifficulty";

interface Props {
  recipes: Recipe[];
  modelValue?: string[];
}

interface Emits {
  (e: "update:modelValue", value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits<Emits>();

const selectedDifficulties = ref<string[]>(props.modelValue);

const getRecipeCount = (level: string): number => {
  return props.recipes.filter((recipe) => {
    const difficulty = calculateDifficulty(recipe);
    return difficulty.level === level;
  }).length;
};

const toggleDifficulty = (level: string) => {
  if (selectedDifficulties.value.includes(level)) {
    selectedDifficulties.value = selectedDifficulties.value.filter(
      (d) => d !== level
    );
  } else {
    selectedDifficulties.value = [...selectedDifficulties.value, level];
  }
};

const selectAll = () => {
  selectedDifficulties.value = difficultyLevels.map((level) => level.value);
};

const clearAll = () => {
  selectedDifficulties.value = [];
};

// Watch for changes and emit updates
watch(
  selectedDifficulties,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedDifficulties.value = [...newValue];
  }
);
</script>

<style scoped>
.difficulty-filter {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #374151;
}

.difficulty-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.difficulty-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.difficulty-btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--difficulty-color);
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.difficulty-btn:hover {
  border-color: var(--difficulty-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.difficulty-btn:hover::before {
  transform: scaleY(1);
}

.difficulty-btn.active {
  border-color: var(--difficulty-color);
  background: color-mix(in srgb, var(--difficulty-color) 5%, white);
}

.difficulty-btn.active::before {
  transform: scaleY(1);
}

.difficulty-icon {
  font-size: 1.2rem;
}

.difficulty-text {
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.recipe-count {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 400;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.select-all {
  color: #059669;
  border-color: #10b981;
}

.select-all:hover {
  background: #ecfdf5;
}

.clear-all {
  color: #dc2626;
  border-color: #f87171;
}

.clear-all:hover {
  background: #fef2f2;
}

/* Responsive design */
@media (max-width: 640px) {
  .difficulty-filter {
    padding: 1rem;
  }

  .difficulty-buttons {
    gap: 0.5rem;
  }

  .difficulty-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .filter-actions {
    flex-direction: column;
  }
}
</style>

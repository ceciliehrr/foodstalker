<template>
  <div
    class="difficulty-badge"
    :class="`difficulty-${difficulty.level}`"
    :title="`Vanskelighetsgrad: ${difficulty.level} (${difficulty.score}/100)`"
  >
    <span class="difficulty-icon">{{
      getDifficultyIcon(difficulty.level)
    }}</span>
    <span class="difficulty-text">{{
      getDifficultyDisplayName(difficulty.level)
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  calculateDifficulty,
  getDifficultyDisplayName,
  getDifficultyIcon,
  type Recipe,
} from "../utils/recipeDifficulty";

interface Props {
  recipe: Recipe;
}

const props = defineProps<Props>();

const difficulty = computed(() => calculateDifficulty(props.recipe));
</script>

<style scoped>
.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--fs-berries-300);
  color: var(--fs-berries-500);
  background: var(--fs-white);
  transition: all 0.2s ease;
  cursor: help;
  user-select: none;
}

.difficulty-icon {
  font-size: 0.8rem;
}

.difficulty-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .difficulty-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .difficulty-icon {
    font-size: 0.75rem;
  }

  .difficulty-text {
    font-size: 0.65rem;
  }
}
</style>

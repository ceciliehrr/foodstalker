<template>
  <Badge
    type="difficulty"
    :icon="getDifficultyIcon(difficulty.level)"
    :text="getDifficultyDisplayName(difficulty.level)"
    :backgroundColor="difficultyColor"
    :title="`Vanskelighetsgrad: ${difficulty.level} (${difficulty.score}/100)`"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  calculateDifficulty,
  getDifficultyDisplayName,
  getDifficultyIcon,
  getDifficultyColor,
  type Recipe,
} from "../utils/recipeDifficulty";
import Badge from "./Badge.vue";

interface Props {
  recipe: Recipe;
}

const props = defineProps<Props>();

const difficulty = computed(() => calculateDifficulty(props.recipe));
const difficultyColor = computed(() =>
  getDifficultyColor(difficulty.value.level)
);
</script>

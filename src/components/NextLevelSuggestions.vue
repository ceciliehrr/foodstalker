<template>
  <div class="next-level-suggestions" v-if="suggestions.length > 0">
    <h3 class="suggestions-title">
      <span class="title-icon">🚀</span>
      Prøv deg på neste nivå
    </h3>
    <p class="suggestions-subtitle">
      Basert på at du kan lage "{{ currentRecipe.title }}", her er noen
      utfordringer:
    </p>

    <div class="suggestions-grid">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-card"
        @click="goToRecipe(suggestion.id)"
      >
        <div class="suggestion-image">
          <img
            :src="suggestion.imageurl"
            :alt="suggestion.alt || suggestion.title"
            loading="lazy"
          />
          <div class="difficulty-overlay">
            <DifficultyBadge :recipe="suggestion" />
          </div>
        </div>

        <div class="suggestion-content">
          <h4 class="suggestion-title">{{ suggestion.title }}</h4>
          <p class="suggestion-description">{{ suggestion.description }}</p>

          <div class="suggestion-meta">
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              {{ suggestion.time }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">👥</span>
              {{ suggestion.portions }} porsjoner
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { findNextLevelRecipes, type Recipe } from "../utils/recipeDifficulty";
import DifficultyBadge from "./DifficultyBadge.vue";

interface Props {
  currentRecipe: Recipe;
  allRecipes: Recipe[];
  maxSuggestions?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxSuggestions: 3,
});

const suggestions = computed(() =>
  findNextLevelRecipes(
    props.currentRecipe,
    props.allRecipes,
    props.maxSuggestions
  )
);

const goToRecipe = (recipeId: string) => {
  // Navigate to recipe page
  window.location.href = `/oppskrift/${recipeId}`;
};
</script>

<style scoped>
.next-level-suggestions {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
}

.suggestions-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.title-icon {
  font-size: 1.5rem;
}

.suggestions-subtitle {
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.suggestion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #cbd5e1;
}

.suggestion-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.suggestion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.suggestion-card:hover .suggestion-image img {
  transform: scale(1.05);
}

.difficulty-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.suggestion-content {
  padding: 1.25rem;
}

.suggestion-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  line-height: 1.3;
}

.suggestion-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.suggestion-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #64748b;
}

.meta-icon {
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .next-level-suggestions {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  .suggestions-title {
    font-size: 1.2rem;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .suggestion-image {
    height: 180px;
  }

  .suggestion-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .next-level-suggestions {
    padding: 1rem;
  }

  .suggestions-title {
    font-size: 1.1rem;
  }

  .suggestion-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

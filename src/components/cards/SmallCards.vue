<template>
  <a class="fs-small-cards" :href="href">
    <div
      class="fs-small-cards__container"
      :class="{ 'fs-small-cards__container--with-footer': hasBadges }"
    >
      <div class="fs-small-cards__image">
        <img :src="image" alt="" loading="lazy" />
      </div>

      <div class="fs-small-cards__content">
        <div class="fs-small-cards__text">
          <h2>{{ title }}</h2>
          <p class="fs-small-cards__description">{{ description }}</p>
          <p class="fs-small-cards__description-mobile">{{ truncatedText }}</p>
        </div>

        <!-- Footer with badges -->
        <div v-if="hasBadges" class="fs-small-cards__footer">
          <div class="fs-small-cards__badges">
            <!-- Difficulty Badge -->
            <Badge
              v-if="difficulty"
              type="difficulty"
              :icon="difficulty.icon"
              :text="difficulty.label"
              :backgroundColor="difficultyColor"
            />

            <!-- Category Badge -->
            <Badge
              v-if="categoryEmoji"
              type="category"
              :icon="categoryEmoji"
              :backgroundColor="'var(--fs-gray-100)'"
            />
          </div>
        </div>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { getCategoryEmoji } from "../../utils/categoryEmojis";
import { getDifficultyColor } from "../../utils/recipeDifficulty";
import Badge from "../Badge.vue";

export default {
  components: {
    Badge,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    href: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Object,
      required: false,
      default: null,
    },
    category: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    truncatedText() {
      return `${this.description.slice(0, 50)}... `;
    },
    categoryEmoji() {
      return this.category ? getCategoryEmoji(this.category) : null;
    },
    hasBadges() {
      return this.difficulty || this.categoryEmoji;
    },
    difficultyColor() {
      return this.difficulty ? getDifficultyColor(this.difficulty.level) : null;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../../styles/variables/" as *;
@use "../../styles/mixins/breakpoints" as *;
@use "../../styles/mixins/" as *;
.fs-small-cards {
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
  color: var(--fs-black);
  text-decoration: none;
  border-radius: 0.5rem;
  @include bp("tablet-big-up") {
    flex-direction: column;
  }
  &:focus-visible {
    outline: 2px solid var(--fs-berries-500);
  }
  &:focus-visible .fs-small-cards__container {
    background-color: var(--fs-gray-100);
  }
  &__container {
    position: relative;
    display: flex;
    border-radius: 0.75rem;
    border: 2px solid var(--fs-gray-300);
    box-shadow: 0px 10px 15px -3px rgba(64, 89, 90, 0.1);
    padding: 1rem;
    background-color: white;
    min-height: 120px; // Ensure consistent height

    &:hover {
      background-color: var(--fs-gray-100);
      color: var(--fs-black);
      outline: 2px solid var(--fs-berries-500);
    }

    &:active {
      background-color: var(--fs-gray-200);
      color: var(--fs-black);
    }

    // When footer exists, use new layout
    &--with-footer {
      .fs-small-cards__content {
        flex-direction: column;
        margin-left: 1rem;
      }

      .fs-small-cards__text {
        margin-left: 0; // Remove margin when using new layout
      }
    }
  }

  &__content {
    display: flex;
    flex: 1;
    // Default: original layout (image and text side by side)
  }
  &__image {
    flex-shrink: 0;

    & img {
      object-fit: cover;
      width: 5rem;
      height: 6rem; // Default height when no footer
      border-radius: 0.5rem;
    }
  }
  &__description {
    display: none;
    margin-top: 0.5rem;
    @include bp("tablet-up") {
      display: block;
    }
  }
  &__description-mobile {
    display: block;
    margin-top: 0.5rem;
    @include bp("tablet-up") {
      display: none;
    }
  }
  &__text {
    margin-left: 1rem; // Original layout spacing

    & h2 {
      @include get-text("fs-h6");
    }

    & p {
      font-weight: 400;
      //margin-top: 0.5rem;
      max-width: 500px;
    }
  }

  /* Footer */
  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--fs-gray-200);
  }

  /* Badges container in footer - inline layout */
  &__badges {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>

<template>
  <a :id="title" :href="href" class="fs-card">
    <div class="fs-card__image">
      <img
        class="fs-card__picture"
        :src="image"
        alt=""
        width="800"
        height="300"
        decoding="async"
        loading="lazy"
      />
    </div>
    <div class="fs-card__content">
      <div class="fs-card__text">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="fs-card__footer">
        <DifficultyBadge :recipe="recipe" />

        <div class="fs-card__footer-circle">
          <span>{{ emojiCategory(emoji) }}</span>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import DifficultyBadge from "../DifficultyBadge.vue";
import { getCategoryEmoji } from "../../utils/categoryEmojis";

interface Props {
  title: string;
  emoji: string;
  href: string;
  image: string;
  description: string;
  date: string;
  recipe: any;
}

defineProps<Props>();

function emojiCategory(cat: string): string {
  return getCategoryEmoji(cat);
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../../styles/variables/" as *;
@use "../../styles/mixins/breakpoints" as *;
@use "../../styles/mixins/" as *;

.fs-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--fs-gray-400);
  border-left-width: 1px;
  border-bottom-width: 1px;
  border-right-width: 1px;
  border-radius: 0.5rem;
  background-color: white;
  color: var(--fs-black);
  text-decoration: none;
  box-shadow: 0px 10px 15px -3px rgba(64, 89, 90, 0.1);

  @include bp("tablet-big-up") {
    flex-direction: row;
    border-top-width: 1px;
    max-width: 36rem;
  }

  &:hover {
    background-color: var(--fs-gray-100);
    color: var(--fs-black);
    outline: 2px solid var(--fs-berries-500);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-berries-500);
    background-color: var(--fs-gray-100);
  }

  &:active {
    background-color: var(--fs-gray-200);
    color: var(--fs-black);
  }

  &__image {
    flex-shrink: 0;
  }

  &__picture {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    width: 100%;
    height: 200px;
    object-fit: cover;

    @include bp("tablet-big-up") {
      border-radius: 0px;
      border-top-left-radius: 0.5rem;
      border-bottom-left-radius: 0.5rem;
      width: 12rem;
      height: 100%;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;
    padding: 1rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
    justify-content: flex-end;

    &-time {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--fs-gray-500);
      font-size: 0.875rem;
      font-weight: 500;
    }

    &-circle {
      display: grid;
      place-items: center;
      background: var(--fs-gray-100);
      border: 1px solid var(--fs-gray-300);
      border-radius: 9999px;
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }

  &__text {
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;

    h2 {
      @include get-text("fs-h6");
      margin-bottom: 1rem;
    }

    p {
      @include get-text("fs-body1");
      margin-bottom: 0.75rem;
    }
  }
}
</style>

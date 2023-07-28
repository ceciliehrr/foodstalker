<template>
  <a class="fs-small-cards" :href="href">
    <div class="fs-small-cards__container">
      <div class="fs-small-cards__image">
        <img :src="image" alt="" />
      </div>

      <div class="fs-small-cards__text">
        <h2>{{ title }}</h2>
        <p class="fs-small-cards__description">{{ description }}</p>
        <p class="fs-small-cards__description-mobile">{{ truncatedText }}</p>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
export default {
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
  },
  computed: {
    truncatedText() {
      return `${this.description.slice(0, 50)}... `;
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
    outline: 2px solid var(--fs-pink-500);
  }
  &:focus-visible .fs-small-cards__container {
    background-color: var(--fs-gray-100);
  }
  &__container {
    display: flex;
    border-radius: 0.75rem;
    border: 2px solid var(--fs-gray-300);
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: white;

    &:hover {
      background-color: var(--fs-gray-100);
      color: var(--fs-black);
      outline: 2px solid var(--fs-pink-500);
    }

    &:active {
      background-color: var(--fs-gray-200);
      color: var(--fs-black);
    }
  }
  &__image {
    flex-shrink: 0;

    & img {
      object-fit: cover;
      width: 5rem;
      height: 100%;
    }
  }
  &__description {
    display: none;
    @include bp("tablet-up") {
      display: block;
    }
  }
  &__description-mobile {
    display: block;
    @include bp("tablet-up") {
      display: none;
    }
  }
  &__text {
    margin-left: 1rem;

    & h2 {
      @include get-text("fs-h6");
      font-weight: 600;

      @include bp("tablet-up") {
        @include get-text("fs-h5");
        font-weight: 600;
      }
    }

    & p {
      font-weight: 400;
      //margin-top: 0.5rem;
      max-width: 500px;
    }
  }
}
</style>

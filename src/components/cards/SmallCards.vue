<template>
  <a class="fs-small-cards" :href="href">
    <div class="fs-small-cards__container">
      <div class="fs-small-cards__image">
        <img :src="image" alt="" />
      </div>

      <div class="fs-small-cards__text">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
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
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../../styles/variables/" as *;
@use "../../styles/mixins/breakpoints" as *;
.fs-small-cards {
  display: flex;
  flex-direction: column;
  font-weight: 400;
  margin-top: 0.5rem;
  color: var(--fs-black);
  text-decoration: none;

  @include bp("tablet-big-up") {
    flex-direction: column;
  }
  &:focus {
    outline: var(--fs-pink-500);
  }
  &:hover {
    background-color: var(--fs-gray-100);
  }
  &__container {
    display: flex;
    border-radius: 0.75rem;
    border: 2px solid var(--fs-gray-300);
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: white;
  }
  &__image {
    flex-shrink: 0;

    & img {
      object-fit: cover;
      width: 5rem;
      height: 100%;
    }
  }
  &__text {
    margin-left: 1rem;
    & h2 {
      font-weight: 600;
    }
    & p {
      margin-top: 0.5rem;
      max-width: 500px;
    }
  }
}
</style>

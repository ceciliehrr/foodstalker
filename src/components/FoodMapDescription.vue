<template>
  <div class="fs-small-cards">
    <div class="fs-small-cards__container">
      <div class="fs-small-cards__image">
        <img :src="imageUrl" alt="" />
      </div>

      <div class="fs-small-cards__text">
        <h2>{{ title }}</h2>
        <p v-if="dateVisited" class="fs-small-cards__date">
          Besøkt: {{ dateVisited }}
        </p>

        <p
          class="fs-small-cards__description"
          v-html="formatDescription(description)"
        ></p>
        <a
          v-if="webPage"
          :href="webPage"
          target="_blank"
          rel="noopener noreferrer"
          class="fs-small-cards__link"
          >Besøk nettside</a
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    description: String,
    category: String,
    imageUrl: String,
    webPage: String,
    dateVisited: String,
  },
  methods: {
    formatDescription(text) {
      return text.replace(/\n/g, "<br>");
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;
@use "../styles/mixins/" as *;
.fs-small-cards {
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
  color: var(--fs-black);
  text-decoration: none;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;

  @include bp("tablet-big-up") {
    flex-direction: column;
  }

  &__container {
    display: flex;
    border-radius: 0.75rem;
    border: 2px solid var(--fs-gray-300);
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: white;
    width: 100%;
  }
  &__image {
    flex-shrink: 0;
    max-height: 120px;

    & img {
      object-fit: cover;
      width: 5rem;
      height: 100%;
    }
  }
  &__description {
    margin-top: 0.5rem;
  }
  &__date {
    color: var(--fs-gray-500);
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

  &__link {
    @include get-text("fs-body2");
    color: var(--fs-berries-500);
    text-decoration: none;
    font-weight: 600;
    padding: map.get($spacing, "size-4") map.get($spacing, "size-8");
    border: 2px solid var(--fs-berries-500);
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    display: inline-block;
    margin-top: 0.5rem;

    &:hover {
      background: var(--fs-berries-500);
      color: var(--fs-white);
    }
  }
}
</style>

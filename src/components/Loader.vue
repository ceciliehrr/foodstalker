<template>
  <div class="fs-loader">
    <div class="fs-loader__spinner">
      <img src="/logo-pink35x35.svg" alt="Loading" class="fs-loader__logo" />
    </div>
    <p v-if="text" class="fs-loader__text">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: "Loader",
  props: {
    text: {
      type: String,
      default: "Laster...",
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "../styles/variables/" as *;
@use "../styles/mixins/breakpoints" as *;
@use "../styles/mixins/" as *;

.fs-loader {
  text-align: center;
  padding: map.get($spacing, "size-32") map.get($spacing, "size-16");
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: map.get($spacing, "size-16");

  &__spinner {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid var(--fs-berries-100);
      border-top: 3px solid var(--fs-berries-500);
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
    }
  }

  &__logo {
    width: 35px;
    height: 35px;
    animation: pulse 1.5s ease-in-out infinite;
    z-index: 1;
  }

  &__text {
    @include get-text("fs-body1");
    color: var(--fs-gray-600);
    font-weight: 500;
    margin: 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
}
</style>


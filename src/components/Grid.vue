<template>
  <div class="fs-grid__container">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
/* Custom SCSS styles for fs-grid */
.fs-grid__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

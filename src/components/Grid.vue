<template>
  <div
    class="fs-grid__container"
    :class="{ 'fs-grid__container--single': singleColumn }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  singleColumn?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
/* Custom SCSS styles for fs-grid */
.fs-grid__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  &--single {
    grid-template-columns: 1fr !important;
  }
}
</style>

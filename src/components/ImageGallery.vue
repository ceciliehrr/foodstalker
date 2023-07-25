<template>
  <div class="image-gallery fade-in" id="gallery">
    <div class="image-gallery__images" v-for="image in images" :key="image.id">
      <img class="image-gallery__image" :src="image.url" :alt="image.alt" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    images: {
      type: Array,
      required: true,
    } as any, // the typecast causes TS to stop trying to match the type
  },
};
</script>

<style lang="scss" scoped>
.image-gallery {
  margin-top: 3em;
  -webkit-column-count: 3;
  -moz-column-count: 3;
  column-count: 3;
  -webkit-column-width: 33%;
  -moz-column-width: 33%;
  column-width: 33%;

  &__images {
    -webkit-transition: all 350ms ease;
    transition: all 350ms ease;
    margin-bottom: 1rem;
  }

  &__image {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 450px) {
    .image-gallery {
      -webkit-column-count: 1;
      -moz-column-count: 1;
      column-count: 1;
      -webkit-column-width: 100%;
      -moz-column-width: 100%;
      column-width: 100%;
    }
  }
}
</style>

<template>
  <a :href=href>
    <div class="flex flex-col mt-4 md:flex-row">
      <div class="flex items-start p-4 rounded-xl shadow-lg bg-white">

        <div class="flex flex-col shrink-0">
          <img class="object-cover h-full w-20 text-blue-400" :src=image alt="" />
        </div>

        <div class="ml-4">
          <h2 class="font-semibold">{{ title }}</h2>
          <p class="mt-2 text-sm">{{ description }}</p>
        </div>
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
    }

  }
}
</script>

<style></style>

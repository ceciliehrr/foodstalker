<template>
  <button @click="toggleTheme" aria-label="Toggle themes">
    <span>Toggle Theme</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      theme: "" as string, //When this property is empty, the theme is set to the default theme i.e. light mode.
    };
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme == "darkMode" ? "" : "darkMode"; //toggles theme value
      document.documentElement.setAttribute("data-theme", this.theme); // sets the data-theme attribute
      localStorage.setItem("theme", this.theme); // stores theme value on local storage
    },
  },
});
</script>

<style>
</style>
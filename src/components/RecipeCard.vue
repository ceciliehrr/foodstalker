<template>
  <a href="" class="no-underline">
    <Card>
      <template #header>
        <div class="emoji-container">
          <img
            alt="user header"
            src="https://foodstalker.b-cdn.net/2022/chili-skrei/DSC02431-2.jpg"
          />
          <div class="emoji">🌽</div>
        </div>
      </template>

      <template #title>
        <p class="text-left">Advanced Card with long tekst</p>
      </template>
      <template #content>
        <p class="text-left">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore
          sed consequuntur error repudiandae numquam deserunt quisquam repellat
          libero asperiores earum nam nobis, culpa ratione quam perferendis
          esse, cupiditate neque quas!
        </p>
      </template>
      <template #footer>
        <p class="text-right">Dato: 02.02.2022</p>
      </template>
    </Card></a
  >
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RecipeCard",
});
</script>

<style lang="scss" scoped>
.p-card {
  background-color: var(--card-background-color);
  color: var(--card-text-color);
}
.p-card:hover,
.p-card:focus,
.p-card:active {
  box-shadow: 0 8px 16px 0 var(--card-shadow);
  opacity: 0.9;
  filter: alpha(opacity=20);
  /* For IE8 and earlier */
}
:deep(.p-card-title) {
  color: var(--card-title-color);
}
:deep(.p-card-footer) {
  color: var(--card-date-color);
}
.p-card .emoji-container {
  position: relative;
  display: inline;
}
.p-card .emoji {
  background-color: var(--card-theme-circle);
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  min-height: 3rem;
  min-width: 3rem;

  padding: 10px 0;
  position: absolute;

  text-align: center;
  text-transform: uppercase;

  bottom: -15px;
  right: 5px;
}
</style>
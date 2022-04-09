<template>
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

    <template #title> Advanced Card </template>
    <template #content>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed
      consequuntur error repudiandae numquam deserunt quisquam repellat libero
      asperiores earum nam nobis, culpa ratione quam perferendis esse,
      cupiditate neque quas!
    </template>
    <template #footer>
      <p>Dato: 02.02.2022</p>
    </template>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RecipeCard",
});
</script>

<style scoped>
.p-card .emoji-container {
  position: relative;
  display: inline;
}
.p-card .emoji {
  background-color: pink;
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
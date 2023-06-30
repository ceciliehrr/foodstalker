import { defineConfig } from "astro/config";

import image from "@astrojs/image";

import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import storyblok from "@storyblok/astro";

import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "STORYBLOK");

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    tailwind(),
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        // Add your components here
      },
      apiOptions: {
        // Choose your Storyblok space region
        region: "eu", // optional,  or 'eu' (default)
      },
    }),
  ],
});

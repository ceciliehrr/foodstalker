import { defineConfig } from "astro/config";

import image from "@astrojs/image";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    image({
      serviceEntryPoint: "@astrojs/image/sharp",
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "~/*": ["./*"],
        "@/*": ["./*"],
        "~~/*": ["./*"],
        "@@/*": ["./*"],
      },
    },
  },
});

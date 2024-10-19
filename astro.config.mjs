import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  image: {
    domains: ["https://foodstalker.b-cdn.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "foodstalker.b-cdn.net",
      },
    ],
  },

  vite: {
    resolve: {
      alias: {
        "~/*": ["./*"],
        "@/*": ["./*"],
        "~~/*": ["./*"],
        "@@/*": ["./*"],
      },
    },
    css: {
      preprocessorOptions: {
          scss: {
          api: 'modern'
          }
      }
    },
  },

  output: "hybrid",
  adapter: netlify({
    imageCDN: false,
  }),
});

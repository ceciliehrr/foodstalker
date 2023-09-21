import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
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
  },
  adapter: netlify(),
});

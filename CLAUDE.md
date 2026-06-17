# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server with cached data (no Notion fetch)
npm run dev:with-data    # Dev server with fresh data fetched from Notion
npm run fetch-data       # Fetch Notion restaurant data only (outputs src/data/notion_restaurants.json)
npm run build            # Fetch Notion data + build static site
npm run preview          # Preview the production build
```

All scripts wrap commands through `scripts/with-nvm.sh` to enforce the Node version in `.nvmrc`.

## Architecture

**Astro 6 static site** with Vue 3 for interactive components, deployed as a Norwegian food blog at foodstalker.no.

### Data sources

- **Recipes**: `src/data/recipes.json` — committed static JSON, source of truth for all recipe pages.
- **Restaurants (map)**: `src/data/notion_restaurants.json` — generated at build time by `scripts/fetch-notion-data.js`, gitignored. Falls back to `src/data/food_map.json` if Notion is unavailable.

Notion credentials are required for fresh restaurant data:
```
NOTION_TOKEN=...
NOTION_DATABASE_ID=...
```

The `src/services/dataService.js` singleton wraps `notion_restaurants.json` for use in Vue components.

### Pages

| Route | File | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | Recipe index, sorted by date |
| `/oppskrift/[id]` | `src/pages/oppskrift/[id].astro` | Individual recipe detail |
| `/oppskrift/[kategori]` | `src/pages/oppskrift/[kategori].astro` | Recipes filtered by category |
| `/spise-hvor` | `src/pages/spise-hvor.astro` | Interactive restaurant map |
| `/[theme]` | `src/pages/[theme].astro` | Seasonal theme pages (jul, sitron, etc.) |

### Theme system

Seasonal/easter-egg pages are configured in `src/config/themes.js`. Adding a new theme object there automatically creates a new static route via `[theme].astro` + `getStaticPaths`.

### Component conventions

- **Astro components** (`.astro`): server-rendered, no interactivity — layouts, structural elements, recipe steps.
- **Vue components** (`.vue`): interactive UI — search, ingredient scaling, cooking mode, the Leaflet map (`FoodMap.vue`).
- Vue components are hydrated with `client:idle`, `client:load`, or `client:only="vue"` depending on criticality.

### Styles

SCSS with a `src/styles/variables/` and `src/styles/mixins/` system. The `get-text()` mixin handles typography scale; `bp()` handles breakpoints. Import pattern in component `<style lang="scss">` blocks:

```scss
@use "../../styles/variables/" as *;
@use "../../styles/mixins/breakpoints" as *;
@use "../../styles/mixins/" as *;
```

CSS custom properties (e.g. `var(--fs-brokkoli)`) are used for brand colors.

### Image CDN

Images are served from `foodstalker.b-cdn.net`. The Astro `<Image>` component is used for recipe images with `format="webp"` and explicit `width`/`height`.

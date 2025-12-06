# Lighthouse Performance Optimizations

This document outlines all the optimizations made to improve Lighthouse scores.

## Summary of Changes

### 1. Image Optimizations ✅

**Card Component (`src/components/cards/Card.astro`):**

- Reduced image quality from `100` to `80` (good balance between quality and file size)
- Added `format="webp"` for modern image format
- Added proper `alt` text using recipe title (accessibility improvement)
- Added `sizes` attribute for responsive images

**Recipe Page (`src/pages/oppskrift/[id].astro`):**

- Changed image quality from `"max"` to `85`
- Added proper `alt` text using recipe title

**Image Gallery (`src/components/ImageGallery.vue`):**

- Added `loading="lazy"` for lazy loading
- Added `decoding="async"` for better performance
- Improved alt text fallback

**Footer Component (`src/components/Footer.vue`):**

- Added `loading="lazy"` to logo and Instagram images
- Added `decoding="async"` for better performance

### 2. Client-Side Hydration Optimizations ✅

Changed `client:load` to `client:idle` in multiple components to delay hydration until the browser is idle:

- **Layout Component:**

  - Navbar: `client:load` → `client:idle`
  - Footer: `client:load` → `client:idle`

- **Recipe Page:**

  - Ingredients component: `client:load` → `client:idle`
  - LeftoversRecommendations: `client:load` → `client:idle`

- **Card Component:**

  - DifficultyBadge: `client:load` → `client:idle`

- **Description Component:**

  - DifficultyBadge: `client:load` → `client:idle`
  - Badge components: `client:load` → `client:idle`

- **Index Page:**

  - SearchBar: `client:load` → `client:idle`

- **Category Page:**
  - SearchBar: `client:only="vue"` → `client:idle`

**Impact:** Components now load after initial page render, improving First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

### 3. Resource Hints ✅

Added resource hints to `Layout.astro` for better DNS and connection prefetching:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://plausible.io" />
<link rel="dns-prefetch" href="https://foodstalker.b-cdn.net" />
```

**Impact:** Reduces connection time for external resources (fonts, analytics, CDN).

### 4. Build Optimizations ✅

Added build optimizations to `astro.config.mjs`:

```javascript
vite: {
  build: {
    cssMinify: true,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
        },
      },
    },
  },
}
```

**Impact:**

- Minified CSS and JavaScript for smaller bundle sizes
- Code splitting for Vue framework (better caching)

### 5. Accessibility Improvements ✅

- Added proper `alt` text to all images (using recipe titles where appropriate)
- Improved alt text fallbacks in ImageGallery

## Expected Lighthouse Score Improvements

These optimizations should improve:

1. **Performance Score:**

   - Reduced image file sizes (quality optimization + WebP format)
   - Deferred JavaScript loading (client:idle)
   - Resource hints for faster DNS resolution

2. **Best Practices:**

   - Proper image attributes
   - Optimized resource loading

3. **Accessibility:**
   - Better alt text for images

## Additional Recommendations (Not Yet Implemented)

For further improvements, consider:

1. **Font Loading:**

   - Move Google Fonts from CSS `@import` to `<link>` tags in `<head>` with `font-display: swap`
   - Consider self-hosting fonts

2. **Service Worker:**

   - Add a service worker for offline support and caching

3. **Preloading:**

   - Add `<link rel="preload">` for critical resources

4. **Image CDN:**

   - Consider using Astro's built-in image optimization or a dedicated image CDN

5. **Bundle Analysis:**

   - Run bundle analysis to identify and optimize large dependencies

6. **Lazy Loading:**
   - Consider using `client:visible` for below-the-fold components

## Testing

After deploying these changes:

1. Run Lighthouse in Chrome DevTools (Desktop & Mobile)
2. Test in production build mode: `npm run build && npm run preview`
3. Compare before/after scores
4. Monitor Core Web Vitals in production

## Notes

- These optimizations focus on development mode performance
- Production builds will have additional optimizations (minification, compression)
- Some optimizations may need production environment testing to see full benefits

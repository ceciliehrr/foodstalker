# Archived FilterBox Components

This folder contains alternative FilterBox components that were created for testing different mobile-friendly filtering patterns. These components are kept for future reference and potential use.

## Components

### FilterBoxFullscreen.vue

**Pattern:** Fullscreen Overlay Filters

- **Best for:** Complex filtering with many options
- **Features:** Full screen overlay, slide-up animation, large touch targets, sticky header/footer
- **Use case:** When you need maximum space and clarity for filtering

### FilterBoxSideDrawer.vue

**Pattern:** Side Drawer / Overlay Filters

- **Best for:** Quick filtering while preserving context
- **Features:** Slides in from right, semi-transparent overlay, compact layout
- **Use case:** When you want to preserve background context while filtering

### FilterBoxChips.vue

**Pattern:** Filter Chips & Context

- **Best for:** Quick, visual filtering with immediate feedback
- **Features:** Inline filter chips, active filter display, grouped options
- **Use case:** When you want immediate visual feedback without modals

## Current Implementation

The main SearchBar component now uses:

- **Desktop (769px+):** Original FilterBox (side-by-side layout)
- **Mobile/Tablet (≤768px):** FilterBoxBottomSheet (bottom sheet pattern)

## Usage

To use any of these archived components:

1. Move the desired component from `archived/` to `components/`
2. Import it in SearchBar.vue
3. Add it to the components list
4. Use responsive CSS classes to show/hide based on screen size

## Responsive Breakpoints

- **Desktop:** 769px and up
- **Tablet:** 768px and below
- **Mobile:** Below 768px

The current implementation uses 768px as the breakpoint between desktop and mobile patterns.

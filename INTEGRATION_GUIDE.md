# 🍳 Recipe Difficulty System - Integration Guide

## What We've Built

We've created a comprehensive recipe difficulty system that automatically calculates difficulty levels based on:

- **Ingredients** (50% weight) - Number of ingredients
- **Steps** (50% weight) - Number of cooking steps

_Note: Time is no longer used as it's not a reliable indicator of complexity. Technique difficulty will be added when recipes are tagged._

## 🚀 Quick Start

### 1. View the Demo

Visit `/difficulty-demo` to see all features in action.

### 2. Add Difficulty Badges to Existing Cards

Replace your current `<Card>` components with `<CardWithDifficulty>`:

```astro

```

### 3. Add Difficulty Filtering to Search

Integrate difficulty filtering into your existing `SearchBar.vue`:

```vue
<template>
  <!-- Add this after your existing category filters -->
  <div
    class="fs-search-bar__difficulty-filters"
    v-if="search.length && filteredRecipes.length > 0"
  >
    <p>Vanskelighetsgrad</p>
    <div class="fs-search-bar__difficulty-tabs">
      <button
        v-for="level in difficultyLevels"
        :key="level.value"
        @click="toggleDifficultyFilter(level.value)"
        :class="[
          'fs-search-bar__difficulty-tab',
          {
            'fs-search-bar__difficulty-tab--active':
              selectedDifficulties.includes(level.value),
          },
        ]"
      >
        {{ level.icon }} {{ level.label }} ({{
          getDifficultyCount(level.value)
        }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { calculateDifficulty } from '../utils/recipeDifficulty';

// Add to your existing data
const selectedDifficulties = ref([]);
const difficultyLevels = [
  { value: 'beginner', label: 'Nybegynner', icon: '🌱' },
  { value: 'intermediate', label: 'Mellomnivå', icon: '🌿' },
  { value: 'advanced', label: 'Avansert', icon: '🌳' }
];

// Add difficulty filtering to your search logic
const filteredRecipes = computed(() => {
  let filtered = // your existing search logic

  // Add difficulty filtering
  if (selectedDifficulties.value.length > 0) {
    filtered = filtered.filter(recipe => {
      const difficulty = calculateDifficulty(recipe);
      return selectedDifficulties.value.includes(difficulty.level);
    });
  }

  return filtered;
});

const toggleDifficultyFilter = (level) => {
  if (selectedDifficulties.value.includes(level)) {
    selectedDifficulties.value = selectedDifficulties.value.filter(d => d !== level);
  } else {
    selectedDifficulties.value = [...selectedDifficulties.value, level];
  }
};

const getDifficultyCount = (level) => {
  return filteredRecipes.value.filter(recipe => {
    const difficulty = calculateDifficulty(recipe);
    return difficulty.level === level;
  }).length;
};
</script>
```

## 📊 Difficulty Calculation Examples

| Recipe       | Ingredients | Steps | Difficulty | Level           |
| ------------ | ----------- | ----- | ---------- | --------------- |
| Simple salad | 6           | 3     | 30/100     | 🌱 Beginner     |
| Pasta dish   | 8           | 5     | 50/100     | 🌿 Intermediate |
| Complex cake | 15          | 10    | 80/100     | 🌳 Advanced     |

## 🎯 Next Level Suggestions

Add progression suggestions to your recipe pages:

```vue
<template>
  <!-- Add this to your recipe detail pages -->
  <NextLevelSuggestions
    :currentRecipe="currentRecipe"
    :allRecipes="allRecipes"
    :maxSuggestions="3"
  />
</template>
```

## 🔧 Customization Options

### Adjust Difficulty Weights

Modify `src/utils/recipeDifficulty.ts`:

```typescript
// Change these weights to adjust difficulty calculation
const totalScore = Math.round(
  ingredientsScore * 0.5 + // Ingredients importance
    stepsScore * 0.5 // Steps importance
);

// Future: When technique is added
// const totalScore = Math.round(
//   ingredientsScore * 0.4 + // Ingredients importance
//   stepsScore * 0.4 + // Steps importance
//   techniqueScore * 0.2 // Technique importance
// );
```

### Add New Difficulty Levels

Extend the difficulty system:

```typescript
// Add more granular levels
if (totalScore <= 20) level = "very-beginner";
else if (totalScore <= 40) level = "beginner";
else if (totalScore <= 60) level = "intermediate";
else if (totalScore <= 80) level = "advanced";
else level = "expert";
```

## 📱 Mobile Responsiveness

All components are fully responsive and work on mobile devices. The difficulty badges automatically adjust their size and positioning.

## 🎨 Styling Integration

The difficulty system uses your existing design tokens and follows your current styling patterns. Difficulty badges use:

- Green (#10b981) for Beginner
- Amber (#f59e0b) for Intermediate
- Red (#ef4444) for Advanced

## 🚨 Troubleshooting

### Difficulty Badges Not Showing

- Ensure you're using `<CardWithDifficulty>` instead of `<Card>`
- Check that the `recipe` prop contains the full recipe object
- Verify the recipe has `time`, `portions`, and `steps` fields

### Filter Not Working

- Check that `selectedDifficulties` is properly reactive
- Ensure `calculateDifficulty()` is imported correctly
- Verify the filtering logic is applied to your search results

### Build Errors

- Run `npm run build` to check for TypeScript errors
- Ensure all Vue components are properly imported
- Check that all dependencies are installed

## 📈 Future Enhancements

Consider these next steps:

1. **Seasonal Difficulty**: Adjust difficulty based on ingredient availability
2. **User Skill Tracking**: Remember what users have cooked to suggest progression
3. **Difficulty Analytics**: Show difficulty distribution across your recipe collection
4. **Social Features**: Let users rate recipe difficulty and share tips

## 🤝 Need Help?

The system is designed to be self-contained and easy to integrate. If you run into issues:

1. Check the demo page at `/difficulty-demo`
2. Review the console for any JavaScript errors
3. Verify all components are properly imported
4. Test with a simple recipe first

Happy cooking! 🍳✨

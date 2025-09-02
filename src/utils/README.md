# Recipe Difficulty System

This system automatically calculates recipe difficulty based on two main factors:

- **Ingredients** (50% weight) - Number of ingredients
- **Steps** (50% weight) - Number of cooking steps

_Note: Time is no longer used as it's not a reliable indicator of complexity. Technique difficulty will be added when recipes are tagged._

## Difficulty Levels

- **🌱 Beginner (0-35 points)**: Simple recipes, few ingredients, few steps
- **🌿 Intermediate (36-70 points)**: Medium complexity, moderate ingredients and steps
- **🌳 Advanced (71-100 points)**: Complex recipes, many ingredients, many steps

## Usage

### Basic Difficulty Calculation

```typescript
import { calculateDifficulty } from "./recipeDifficulty";

const recipe = {
  id: "example",
  title: "Example Recipe",
  ingredients: [
    {
      title: "Main",
      ingredients: [
        { quantity: "400g", name: "pasta" },
        { quantity: "2", name: "hvitløk" },
        { quantity: "1", name: "løk" },
      ],
    },
  ],
  steps: [
    { description: "Step 1" },
    { description: "Step 2" },
    { description: "Step 3" },
  ],
};

const difficulty = calculateDifficulty(recipe);
console.log(difficulty.level); // 'intermediate'
console.log(difficulty.score); // 45
```

### Ingredients Analysis

The system counts total ingredients including:

- Individual ingredients in each group
- Handles nested ingredient structures
- More ingredients = higher complexity
- Special ingredients may indicate advanced techniques

### Next Level Suggestions

```typescript
import { findNextLevelRecipes } from "./recipeDifficulty";

const suggestions = findNextLevelRecipes(currentRecipe, allRecipes, 3);
// Returns 3 recipes with slightly higher difficulty
```

## Components

### DifficultyFilter.vue

Filter recipes by difficulty level with interactive buttons.

### DifficultyBadge.vue

Display difficulty level as a colored badge on recipe cards.

### CardWithDifficulty.vue

Enhanced recipe card component that includes difficulty badges.

### NextLevelSuggestions.vue

Suggest next-level recipes based on current difficulty.

## Demo Page

Visit `/difficulty-demo` to see all features in action.

## Integration

To add difficulty badges to existing recipe cards:

1. Replace `<Card>` with `<CardWithDifficulty>`
2. Pass the full recipe object as `recipe` prop
3. The difficulty badge will automatically appear

## Customization

You can adjust the difficulty calculation by modifying the scoring weights in `calculateDifficulty()`:

```typescript
// Current weights
const totalScore = Math.round(ingredientsScore * 0.5 + stepsScore * 0.5);

// Future: When technique is added
// const totalScore = Math.round(
//   ingredientsScore * 0.4 + stepsScore * 0.4 + techniqueScore * 0.2
// );
```

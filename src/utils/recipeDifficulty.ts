export interface RecipeDifficulty {
  score: number;
  level: "easy" | "medium" | "hard";
  factors: {
    ingredientsScore: number;
    stepsScore: number;
    timeScore: number;
  };
}

export interface DifficultyLevel {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageurl?: string;
  alt?: string;
  date?: string;
  category?: string;
  description?: string;
  longDescription?: string;
  time?: string;
  portions?: number | string;
  tips?: string;
  chef?: string;
  tipsurl?: string;
  ingredients?: Array<{
    title?: string;
    ingredients: Array<{
      quantity: string;
      name: string;
    }>;
  }>;
  steps?: Array<{
    title?: string;
    description: string;
  }>;
  keywords?: string[];
}

/**
 * Parse time string to minutes
 * Handles various Norwegian time formats like "30 min", "2 timer", "1 døgn", etc.
 */
function parseTimeToMinutes(time: string): number {
  if (!time) return 0;

  const timeStr = time.toLowerCase().trim();

  // Handle "X min" or "X minutter"
  const minMatch = timeStr.match(/(\d+)\s*(?:min|minutter?)/);
  if (minMatch) return parseInt(minMatch[1]);

  // Handle "X timer" or "X h"
  const hourMatch = timeStr.match(/(\d+(?:[.,]\d+)?)\s*(?:timer?|h)/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1].replace(",", "."));
    return Math.round(hours * 60);
  }

  // Handle "X døgn" or "X dager"
  const dayMatch = timeStr.match(/(\d+)\s*(?:døgn|dager?)/);
  if (dayMatch) return parseInt(dayMatch[1]) * 24 * 60;

  // Handle ranges like "2-3 timer"
  const rangeMatch = timeStr.match(/(\d+)\s*-\s*(\d+)\s*(?:timer?|h)/);
  if (rangeMatch) {
    const minHours = parseInt(rangeMatch[1]);
    const maxHours = parseInt(rangeMatch[2]);
    return Math.round(((minHours + maxHours) / 2) * 60);
  }

  // Handle "ca X timer" or "maks X timer"
  const approxMatch = timeStr.match(
    /(?:ca|maks|omkring)\s*(\d+)\s*(?:timer?|h)/
  );
  if (approxMatch) return parseInt(approxMatch[1]) * 60;

  // Default fallback
  return 30;
}

/**
 * Count total ingredients from recipe
 * Handles nested ingredient structures and counts each individual ingredient
 */
function countIngredients(
  ingredients?: Array<{
    title?: string;
    ingredients: Array<{
      quantity: string;
      name: string;
    }>;
  }>
): number {
  if (!ingredients) return 0;

  let totalCount = 0;

  ingredients.forEach((group) => {
    if (group.ingredients) {
      totalCount += group.ingredients.length;
    }
  });

  return totalCount;
}

/**
 * Get technique difficulty score (placeholder for future implementation)
 * This will be used when recipes are tagged with technique difficulty
 */
function getTechniqueScore(technique: string): number {
  switch (technique) {
    case "easy":
      return 20;
    case "medium":
      return 50;
    case "hard":
      return 80;
    default:
      return 50; // Default to medium
  }
}

/**
 * Calculate difficulty score based on time, portions, and steps
 * Returns a score from 0-100 where higher = more difficult
 */
export function calculateDifficulty(recipe: Recipe): RecipeDifficulty {
  // Count ingredients
  const ingredientsCount = countIngredients(recipe.ingredients);

  // Count steps
  const stepsCount = recipe.steps?.length || 0;

  // Parse time to minutes
  const timeInMinutes = parseTimeToMinutes(recipe.time || "");

  // TODO: Add technique difficulty when recipes are tagged
  // const techniqueScore = getTechniqueScore(recipe.technique || 'medium');

  // Calculate individual scores (0-100 each)
  let ingredientsScore = 0;
  if (ingredientsCount <= 5) ingredientsScore = 20;
  else if (ingredientsCount <= 8) ingredientsScore = 40;
  else if (ingredientsCount <= 12) ingredientsScore = 60;
  else if (ingredientsCount <= 18) ingredientsScore = 80;
  else ingredientsScore = 100;

  let stepsScore = 0;
  if (stepsCount <= 3) stepsScore = 20;
  else if (stepsCount <= 5) stepsScore = 40;
  else if (stepsCount <= 8) stepsScore = 60;
  else if (stepsCount <= 12) stepsScore = 80;
  else stepsScore = 100;

  let timeScore = 0;
  if (timeInMinutes <= 30) timeScore = 20;
  else if (timeInMinutes <= 60) timeScore = 40;
  else if (timeInMinutes <= 120) timeScore = 60;
  else if (timeInMinutes <= 240) timeScore = 80;
  else timeScore = 100;

  // Calculate weighted total score
  // Ingredients: 50%, Steps: 30%, Time: 20%
  // TODO: When technique is added, adjust weights to:
  // - Ingredients: 45%
  // - Steps: 25%
  // - Time: 20%
  // - Technique: 10%
  const totalScore = Math.round(
    ingredientsScore * 0.5 + stepsScore * 0.3 + timeScore * 0.2
  );

  // Determine difficulty level
  let level: "easy" | "medium" | "hard";
  if (totalScore <= 35) level = "easy";
  else if (totalScore <= 70) level = "medium";
  else level = "hard";

  return {
    score: totalScore,
    level,
    factors: {
      ingredientsScore,
      stepsScore,
      timeScore,
    },
  };
}

/**
 * Get difficulty level display name in Norwegian
 */
export function getDifficultyDisplayName(level: string): string {
  switch (level) {
    case "beginner":
    case "easy":
      return "Enkel";
    case "intermediate":
    case "medium":
      return "Middels";
    case "advanced":
    case "hard":
      return "Vanskelig";
    default:
      return "Ukjent";
  }
}

/**
 * Get difficulty level color for UI
 */
export function getDifficultyColor(level: string): string {
  switch (level) {
    case "beginner":
    case "easy":
      return "var(--fs-lime)"; // Your lime green color
    case "intermediate":
    case "medium":
      return "var(--fs-berries-300)"; // Your berries orange color
    case "advanced":
    case "hard":
      return "var(--fs-berries-500)"; // Your berries red color
    default:
      return "var(--fs-gray-400)"; // Your gray color
  }
}

/**
 * Get difficulty level icon (stars)
 */
export function getDifficultyIcon(level: string): string {
  switch (level) {
    case "beginner":
    case "easy":
      return "🔪";
    case "intermediate":
    case "medium":
      return "🔪🔪";
    case "advanced":
    case "hard":
      return "🔪🔪🔪";
    default:
      return "🔪";
  }
}

/**
 * Get full difficulty level label with stars and Norwegian text
 */
export function getDifficultyLabel(level: string): string {
  const icon = getDifficultyIcon(level);
  const name = getDifficultyDisplayName(level);
  return `${icon} ${name}`;
}

/**
 * Predefined difficulty levels with Norwegian labels and star ratings
 */
export const difficultyLevels: DifficultyLevel[] = [
  {
    value: "easy",
    label: "Enkel",
    icon: "🔪",
    color: getDifficultyColor("easy"),
  },
  {
    value: "medium",
    label: " Middels",
    icon: "🔪🔪",
    color: getDifficultyColor("medium"),
  },
  {
    value: "hard",
    label: "Vanskelig",
    icon: "🔪🔪🔪",
    color: getDifficultyColor("hard"),
  },
];

/**
 * Find next-level recipe suggestions based on current difficulty
 */
export function findNextLevelRecipes(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  count: number = 3
): Recipe[] {
  const currentDifficulty = calculateDifficulty(currentRecipe);

  // Get recipes with slightly higher difficulty
  let targetLevel: string;
  let targetScoreRange: [number, number];

  switch (currentDifficulty.level) {
    case "easy":
      targetLevel = "medium";
      targetScoreRange = [31, 60];
      break;
    case "medium":
      targetLevel = "hard";
      targetScoreRange = [61, 100];
      break;
    case "hard":
      // For hard recipes, suggest other hard recipes
      targetLevel = "hard";
      targetScoreRange = [61, 100];
      break;
    default:
      targetLevel = "medium";
      targetScoreRange = [31, 60];
  }

  // Filter recipes by target difficulty and score range
  const candidates = allRecipes
    .filter((recipe) => recipe.id !== currentRecipe.id)
    .map((recipe) => ({
      recipe,
      difficulty: calculateDifficulty(recipe),
    }))
    .filter(
      ({ difficulty }) =>
        difficulty.level === targetLevel &&
        difficulty.score >= targetScoreRange[0] &&
        difficulty.score <= targetScoreRange[1]
    )
    .sort((a, b) => a.difficulty.score - b.difficulty.score);

  return candidates.slice(0, count).map(({ recipe }) => recipe);
}

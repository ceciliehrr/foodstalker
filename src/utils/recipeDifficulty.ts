import {
  analyzeCookingTechniques,
  getTechniqueDifficultyScore,
  getTechniqueSummary,
} from "./cookingTechniques";

export interface RecipeDifficulty {
  score: number;
  level: "easy" | "medium" | "hard";
  factors: {
    ingredientsScore: number;
    stepsScore: number;
    timeScore: number;
    techniqueScore: number;
  };
  techniques?: {
    found: string[];
    summary: string;
    breakdown: {
      basic: number;
      intermediate: number;
      advanced: number;
    };
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
 * Get technique difficulty score from cooking techniques analysis
 */
function getTechniqueScore(techniqueAnalysis: any): number {
  if (!techniqueAnalysis || techniqueAnalysis.techniqueCount === 0) return 20; // Default to easy if no techniques found

  // Base score from max difficulty
  let baseScore = 0;
  switch (techniqueAnalysis.maxDifficulty) {
    case 1:
      baseScore = 20;
      break;
    case 2:
      baseScore = 50;
      break;
    case 3:
      baseScore = 80;
      break;
    default:
      baseScore = 20;
  }

  // Bonus for multiple advanced techniques
  if (techniqueAnalysis.breakdown.advanced > 0) {
    baseScore += Math.min(techniqueAnalysis.breakdown.advanced * 5, 20);
  }

  // Bonus for high technique count (complexity)
  if (techniqueAnalysis.techniqueCount > 5) {
    baseScore += Math.min((techniqueAnalysis.techniqueCount - 5) * 2, 10);
  }

  return Math.min(baseScore, 100);
}

/**
 * Calculate difficulty score based on time, portions, steps, and cooking techniques
 * Returns a score from 0-100 where higher = more difficult
 */
export function calculateDifficulty(recipe: Recipe): RecipeDifficulty {
  // Count ingredients
  const ingredientsCount = countIngredients(recipe.ingredients);

  // Count steps
  const stepsCount = recipe.steps?.length || 0;

  // Parse time to minutes
  const timeInMinutes = parseTimeToMinutes(recipe.time || "");

  // Analyze cooking techniques
  const techniqueAnalysis = recipe.steps
    ? analyzeCookingTechniques(recipe.steps)
    : null;
  const techniqueScore = techniqueAnalysis
    ? getTechniqueDifficultyScore(techniqueAnalysis)
    : 20;

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
  // Techniques: 35%, Ingredients: 30%, Steps: 20%, Time: 15%
  const totalScore = Math.round(
    techniqueScore * 0.35 +
      ingredientsScore * 0.3 +
      stepsScore * 0.2 +
      timeScore * 0.15
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
      techniqueScore,
    },
    techniques: techniqueAnalysis
      ? {
          found: techniqueAnalysis.techniques.map((t) => t.name),
          summary: getTechniqueSummary(techniqueAnalysis),
          breakdown: techniqueAnalysis.breakdown,
        }
      : undefined,
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
    label: "Middels",
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

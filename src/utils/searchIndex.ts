// Search index utility for improved recipe search performance
export interface SearchIndex {
  [term: string]: {
    [recipeId: string]: {
      score: number;
      fields: string[];
    };
  };
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  description?: string;
  longDescription?: string;
  keywords?: string[];
  ingredients?: Array<{
    ingredients: Array<{
      name: string;
      quantity: string;
    }>;
  }>;
  steps?: Array<{
    description: string;
  }>;
  time?: string | number;
}

export class RecipeSearchIndex {
  private index: SearchIndex = {};
  private recipes: Recipe[] = [];
  private originalTerms: Map<string, string> = new Map(); // Store original terms for suggestions

  constructor(recipes: Recipe[]) {
    this.recipes = recipes;
    this.buildIndex();
  }

  private buildIndex() {
    this.index = {};

    this.recipes.forEach((recipe) => {
      this.indexRecipe(recipe);
    });
  }

  private indexRecipe(recipe: Recipe) {
    // Index title
    this.addToIndex(recipe.title, recipe.id, 10, ["title"]);

    // Index category
    this.addToIndex(recipe.category, recipe.id, 8, ["category"]);

    // Index keywords
    if (recipe.keywords) {
      recipe.keywords.forEach((keyword) => {
        this.addToIndex(keyword, recipe.id, 6, ["keywords"]);
      });
    }

    // Index description
    if (recipe.description) {
      this.addToIndex(recipe.description, recipe.id, 5, ["description"]);
    }

    // Index long description
    if (recipe.longDescription) {
      this.addToIndex(recipe.longDescription, recipe.id, 4, [
        "longDescription",
      ]);
    }

    // Index ingredients
    if (recipe.ingredients) {
      recipe.ingredients.forEach((group) => {
        if (group.ingredients) {
          group.ingredients.forEach((ingredient) => {
            this.addToIndex(ingredient.name, recipe.id, 6, ["ingredients"]);
          });
        }
      });
    }

    // Index steps
    if (recipe.steps) {
      recipe.steps.forEach((step) => {
        this.addToIndex(step.description, recipe.id, 3, ["steps"]);
      });
    }
  }

  private addToIndex(
    text: string,
    recipeId: string,
    baseScore: number,
    fields: string[]
  ) {
    if (!text) return;

    // Store original text for suggestions
    const originalText = text;

    // Split text into words and normalize for indexing
    const words = this.normalizeText(text)
      .split(/\s+/)
      .filter((word) => word.length > 1);

    words.forEach((word) => {
      if (!this.index[word]) {
        this.index[word] = {};
      }

      if (!this.index[word][recipeId]) {
        this.index[word][recipeId] = { score: 0, fields: [] };
      }

      this.index[word][recipeId].score += baseScore;
      fields.forEach((field) => {
        if (!this.index[word][recipeId].fields.includes(field)) {
          this.index[word][recipeId].fields.push(field);
        }
      });

      // Store original term for this normalized word
      this.originalTerms.set(word, originalText);
    });
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[æøå]/g, (match) => {
        const replacements: { [key: string]: string } = {
          æ: "ae",
          ø: "oe",
          å: "aa",
        };
        return replacements[match];
      })
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ") // Normalize multiple spaces to single space
      .trim();
  }

  public search(
    query: string,
    filters?: {
      category?: string;
      time?: string;
    }
  ): Array<{ recipe: Recipe; score: number; matchedTerms: string[] }> {
    if (!query.trim()) return [];

    const searchTerms = this.normalizeText(query)
      .split(/\s+/)
      .filter((term) => term.length > 1);
    const results = new Map<
      string,
      {
        recipe: Recipe;
        score: number;
        matchedTerms: string[];
        fieldMatches: string[];
      }
    >();

    // Track which fields each term matches for better scoring
    const fieldWeights = {
      title: 10,
      category: 8,
      keywords: 6,
      ingredients: 6,
      description: 5,
      longDescription: 4,
      steps: 3,
    };

    searchTerms.forEach((term) => {
      // Find exact matches with field-specific scoring
      if (this.index[term]) {
        Object.entries(this.index[term]).forEach(([recipeId, indexData]) => {
          const recipe = this.recipes.find((r) => r.id === recipeId);
          if (!recipe) return;

          // Apply filters
          if (filters?.category && recipe.category !== filters.category) return;
          if (filters?.time) {
            const timeMinutes = this.parseTimeToMinutes(recipe.time || "");
            if (filters.time === "quick" && timeMinutes > 30) return;
            if (
              filters.time === "medium" &&
              (timeMinutes <= 30 || timeMinutes > 60)
            )
              return;
            if (filters.time === "long" && timeMinutes <= 60) return;
          }

          if (!results.has(recipeId)) {
            results.set(recipeId, {
              recipe,
              score: 0,
              matchedTerms: [],
              fieldMatches: [],
            });
          }

          const result = results.get(recipeId)!;

          // Calculate field-weighted score
          let fieldScore = 0;
          indexData.fields.forEach((field) => {
            fieldScore += fieldWeights[field as keyof typeof fieldWeights] || 1;
          });

          result.score += fieldScore;
          if (!result.matchedTerms.includes(term)) {
            result.matchedTerms.push(term);
          }
          // Track which fields matched
          indexData.fields.forEach((field) => {
            if (!result.fieldMatches.includes(field)) {
              result.fieldMatches.push(field);
            }
          });
        });
      }

      // More restrictive fuzzy matching - only for longer terms and higher similarity
      if (term.length > 3) {
        Object.keys(this.index).forEach((indexTerm) => {
          const similarity = this.calculateSimilarity(term, indexTerm);
          // Increased threshold for fuzzy matching to reduce noise
          if (similarity > 0.8) {
            Object.entries(this.index[indexTerm]).forEach(
              ([recipeId, indexData]) => {
                const recipe = this.recipes.find((r) => r.id === recipeId);
                if (!recipe) return;

                // Apply filters
                if (filters?.category && recipe.category !== filters.category)
                  return;
                if (filters?.time) {
                  const timeMinutes = this.parseTimeToMinutes(
                    recipe.time || ""
                  );
                  if (filters.time === "quick" && timeMinutes > 30) return;
                  if (
                    filters.time === "medium" &&
                    (timeMinutes <= 30 || timeMinutes > 60)
                  )
                    return;
                  if (filters.time === "long" && timeMinutes <= 60) return;
                }

                if (!results.has(recipeId)) {
                  results.set(recipeId, {
                    recipe,
                    score: 0,
                    matchedTerms: [],
                    fieldMatches: [],
                  });
                }

                const result = results.get(recipeId)!;

                // Calculate field-weighted score for fuzzy matches (much lower)
                let fieldScore = 0;
                indexData.fields.forEach((field) => {
                  fieldScore +=
                    (fieldWeights[field as keyof typeof fieldWeights] || 1) *
                    0.3;
                });

                result.score += Math.floor(fieldScore * similarity);
                if (!result.matchedTerms.includes(term)) {
                  result.matchedTerms.push(term);
                }
                // Track which fields matched
                indexData.fields.forEach((field) => {
                  if (!result.fieldMatches.includes(field)) {
                    result.fieldMatches.push(field);
                  }
                });
              }
            );
          }
        });
      }
    });

    // Enhanced scoring with field-specific bonuses
    results.forEach((result) => {
      // Bonus for recipes that match multiple search terms
      if (result.matchedTerms.length > 1) {
        result.score += result.matchedTerms.length * 3;
      }

      // Bonus for title matches (most important)
      if (result.fieldMatches.includes("title")) {
        result.score += 15;
      }

      // Bonus for category matches
      if (result.fieldMatches.includes("category")) {
        result.score += 10;
      }

      // Bonus for keyword matches
      if (result.fieldMatches.includes("keywords")) {
        result.score += 8;
      }

      // Penalty for only step matches (less relevant)
      if (
        result.fieldMatches.length === 1 &&
        result.fieldMatches.includes("steps")
      ) {
        result.score *= 0.5;
      }
    });

    // Filter out very low scoring results and limit results
    const filteredResults = Array.from(results.values())
      .filter((result) => result.score > 5) // Minimum relevance threshold
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.recipe.title.localeCompare(b.recipe.title);
      })
      .slice(0, 20); // Limit to top 20 results

    return filteredResults;
  }

  private parseTimeToMinutes(timeStr: string | number): number {
    if (!timeStr) return 0;

    // If it's already a number, return it (assuming it's in minutes)
    if (typeof timeStr === "number") {
      return Math.round(timeStr);
    }

    // If it's not a string, try to convert it
    if (typeof timeStr !== "string") {
      const num = parseFloat(timeStr.toString());
      if (!isNaN(num)) {
        return Math.round(num);
      }
      return 0;
    }

    const hours = timeStr.match(/(\d+)\s*timer?/);
    const minutes = timeStr.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);

    return totalMinutes;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0) return 0;
    if (str2.length === 0) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  public getSuggestions(query: string, limit: number = 8): string[] {
    if (!query.trim() || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Priority 1: Recipe titles (preserve Norwegian characters)
    this.recipes.forEach((recipe) => {
      if (recipe.title.toLowerCase().includes(queryLower)) {
        suggestions.add(recipe.title);
      }
    });

    // Priority 2: Categories (preserve Norwegian characters)
    this.recipes.forEach((recipe) => {
      if (recipe.category.toLowerCase().includes(queryLower)) {
        suggestions.add(recipe.category);
      }
    });

    // Priority 3: Keywords (preserve Norwegian characters)
    this.recipes.forEach((recipe) => {
      if (recipe.keywords) {
        recipe.keywords.forEach((keyword) => {
          if (keyword.toLowerCase().includes(queryLower)) {
            suggestions.add(keyword);
          }
        });
      }
    });

    // Priority 4: Individual ingredients (extract just the ingredient name)
    this.recipes.forEach((recipe) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((group) => {
          if (group.ingredients) {
            group.ingredients.forEach((ingredient) => {
              if (ingredient.name.toLowerCase().includes(queryLower)) {
                suggestions.add(ingredient.name);
              }
            });
          }
        });
      }
    });

    // Convert to array, sort by relevance (shorter, more specific items first)
    return Array.from(suggestions)
      .sort((a, b) => {
        // Prefer shorter, more specific suggestions
        if (a.length !== b.length) {
          return a.length - b.length;
        }
        // If same length, prefer exact matches
        const aExact = a.toLowerCase().startsWith(queryLower);
        const bExact = b.toLowerCase().startsWith(queryLower);
        if (aExact !== bExact) {
          return aExact ? -1 : 1;
        }
        return a.localeCompare(b);
      })
      .slice(0, limit);
  }

  public getIndexStats() {
    return {
      totalTerms: Object.keys(this.index).length,
      totalRecipes: this.recipes.length,
      originalTermsCount: this.originalTerms.size,
    };
  }
}

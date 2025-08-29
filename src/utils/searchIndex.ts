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
  time?: string;
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
      { recipe: Recipe; score: number; matchedTerms: string[] }
    >();

    searchTerms.forEach((term) => {
      // Find exact matches
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
            });
          }

          const result = results.get(recipeId)!;
          result.score += indexData.score;
          if (!result.matchedTerms.includes(term)) {
            result.matchedTerms.push(term);
          }
        });
      }

      // Find fuzzy matches for longer terms
      if (term.length > 2) {
        Object.keys(this.index).forEach((indexTerm) => {
          if (this.calculateSimilarity(term, indexTerm) > 0.7) {
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
                  });
                }

                const result = results.get(recipeId)!;
                result.score += Math.floor(indexData.score * 0.5); // Lower score for fuzzy matches
                if (!result.matchedTerms.includes(term)) {
                  result.matchedTerms.push(term);
                }
              }
            );
          }
        });
      }
    });

    // Bonus for recipes that match multiple search terms
    results.forEach((result) => {
      if (result.matchedTerms.length > 1) {
        result.score += result.matchedTerms.length * 2;
      }
    });

    // Convert to array and sort by score
    return Array.from(results.values()).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.recipe.title.localeCompare(b.recipe.title);
    });
  }

  private parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

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

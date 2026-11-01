export async function getTopList(apiKey, recipes) {
    try {
      // Fetch data from Plausible API
      const response = await fetch(
        `https://plausible.io/api/v1/stats/breakdown?site_id=foodstalker.no&period=30d&property=event:page&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch top list");
      }
  
      // Parse response to JSON
      const pages = await response.json();
  
      // Regex pattern to extract the recipe ID from the URL
      const recipeIdRegex = /^\/oppskrift\/([^/]+)/;
  
      // Extract recipe IDs and visitor numbers
      const recipesData = pages.results
        .filter((page) => page.page.startsWith("/oppskrift/"))
        .map((page) => {
          const match = page.page.match(recipeIdRegex);
          if (match) {
            const id = match[1]; // Extract recipe ID from the URL
            return {
              id,
              visitors: parseInt(page.visitors), // Parse visitor count to integer
            };
          }
          return null;
        })
        .filter((page) => page !== null); // Filter out any null entries
  
  
      // Keep only real recipes (skips category pages like /oppskrift/helg/),
      // sort by visitors and take the top 5
      const sortedRecipes = recipesData
        .map(({ id, visitors }) => {
          const recipe = recipes.find((recipe) => recipe.id === id);
          return recipe ? { ...recipe, visitors } : null;
        })
        .filter((recipe) => recipe !== null)
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5);

      return sortedRecipes;
    } catch (error) {
      console.error("Error in getTopList:", error);
      return [];
    }
  }
  
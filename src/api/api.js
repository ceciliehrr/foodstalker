export async function getTopList(apiKey, recipes) {
    try {
      // Fetch data from Plausible API
      const response = await fetch(
        `https://plausible.io/api/v1/stats/breakdown?site_id=foodstalker.no&period=30d&property=event:page&limit=10`,
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
  
  
      // Sort recipes by visitors in descending order
      recipesData.sort((a, b) => b.visitors - a.visitors);
  
      // Take the top 5 recipes
      const topFiveRecipes = recipesData.slice(0, 5);
  
      // Map recipe IDs to the actual recipes from the input recipes array
      const sortedRecipes = topFiveRecipes.map(({ id, visitors }) => {
        const recipe = recipes.find((recipe) => recipe.id === id);
        if (recipe) {
          return {
            ...recipe, // Spread recipe details
            visitors,  // Add the visitors count
          };
        }
        return null;
      }).filter(recipe => recipe !== null); // Filter out any null recipes
  
      return sortedRecipes;
    } catch (error) {
      console.error("Error in getTopList:", error);
      return [];
    }
  }
  
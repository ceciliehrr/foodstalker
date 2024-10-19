export async function getTopList(apiKey, recipes) {
    try {
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
        throw new Error('Failed to fetch top list');
      }
  
      const pages = await response.json();
  console.log(pages);
      const recipeIdRegex = /^\/oppskrift\/([^/]+)/;
  
      // Extract recipe IDs and visitors
      const recipesData = pages.results
        .filter((page) => page.page.startsWith("/oppskrift/"))
        .map((page) => {
          const match = page.page.match(recipeIdRegex);
          if (match) {
            const id = match[1]; // Extract the recipe ID from the URL
            return {
              id,
              visitors: parseInt(page.visitors),
            };
          }
          return null;
        })
        .filter((page) => page !== null);
  
      // Sort recipes by visitors in descending order
      recipesData.sort((a, b) => b.visitors - a.visitors);
  
      // Take the top 5 recipes
      const topFiveRecipes = recipesData.slice(0, 5);
  
      // Extract recipe IDs
      const recipeIds = topFiveRecipes.map((recipe) => recipe.id);
  
      // Filter recipes based on the top 5 IDs
      const sortedRecipes = recipeIds.map((id) =>
        recipes.find((recipe) => recipe.id === id)
      );
  
      return sortedRecipes;
    } catch (error) {
      console.error("Error in getTopList:", error);
      return [];
    }
  }

const recipeData = require("./old_recipes.json"); // Assuming the recipe data is in a file named recipe.json

// Function to convert ingredients object to the new format
function convertIngredients(ingredients) {
  const convertedIngredients = [];

  for (const key in ingredients) {
    if (Array.isArray(ingredients[key])) {
      const title = key ? key : "";
      const ingredientList = ingredients[key].map((ingredient) => {
        return {
          quantity: ingredient.quantity,
          name: ingredient.name,
        };
      });

      convertedIngredients.push({
        title: title,
        ingredients: ingredientList,
      });
    }
  }

  return convertedIngredients;
}

// Function to convert the recipe JSON to the new format
function convertRecipe(recipe) {
  const convertedRecipe = {
    id: recipe.id,
    imageurl: recipe.imageurl,
    alt: recipe.alt,
    title: recipe.title,
    date: recipe.date,
    category: recipe.category,
    description: recipe.description,
    longDescription: recipe.longDescription,
    time: recipe.time,
    portions: recipe.portions,
    tips: recipe.tips,
    chef: recipe.chef,
    tipsurl: recipe.tipsurl,
    ingredients: convertIngredients(recipe.ingredients),
    steps: recipe.steps,
    images: recipe.images,
    keyword: recipe.keyword,
  };

  return convertedRecipe;
}

// Convert each recipe in the array to the new format
const convertedRecipes = recipeData.map((recipe) => convertRecipe(recipe));

// Create a new JSON object with the converted recipe data
const convertedJSON = JSON.stringify(convertedRecipes, null, 2);

// Write the converted JSON to a file
const fs = require("fs");
fs.writeFile("converted_recipe.json", convertedJSON, "utf8", (err) => {
  if (err) {
    console.log(
      "An error occurred while writing the converted JSON to file:",
      err
    );
  } else {
    console.log(
      "Conversion completed. The converted JSON has been saved to converted_recipe.json"
    );
  }
});

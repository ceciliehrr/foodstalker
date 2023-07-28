const recipeData = require("./old_recipes.json"); // Assuming the recipe data is in a file named recipe.json

// Function to convert the recipe steps
function convertSteps(steps) {
  const convertedSteps = [];

  for (let i = 0; i < steps.length; i++) {
    let title = "";
    let description = steps[i];

    if (typeof description === "string") {
      try {
        description = JSON.parse(description);
      } catch (error) {
        // Handle JSON parsing error if needed
      }
    }

    if (typeof description === "object") {
      if (description.title) {
        title = description.title;
      }
      if (description.description) {
        description = description.description;
      }
    }

    convertedSteps.push({
      title: title,
      description: description.trim(),
    });
  }

  return convertedSteps;
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
    ingredients: recipe.ingredients,
    steps: convertSteps(recipe.steps),
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

const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/admin-panel.html");
});

app.post("/add-recipe", (req, res) => {
  try {
    const newRecipe = req.body;

    // Validate and transform the recipe data
    const validatedRecipe = validateAndTransformRecipe(newRecipe);

    // Read the existing recipes from the file
    const existingRecipes = JSON.parse(
      fs.readFileSync("../../data/new_recipes.json")
    );

    // Add the new recipe to the existing recipes
    existingRecipes.push(validatedRecipe);

    // Write the updated recipes back to the file
    fs.writeFileSync(
      "../../data/new_recipes.json",
      JSON.stringify(existingRecipes, null, 2)
    );

    res.redirect("/?success=true");
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.redirect("/?error=" + encodeURIComponent(error.message));
  }
});

// Validation and transformation function
function validateAndTransformRecipe(recipe) {
  // Validate required fields
  if (!recipe.id || !recipe.title || !recipe.time || !recipe.portions) {
    throw new Error("Missing required fields: id, title, time, or portions");
  }

  // Transform time to number (assuming it's already in minutes from the form)
  const time = parseInt(recipe.time);
  if (isNaN(time) || time < 1) {
    throw new Error("Time must be a positive number");
  }

  // Transform portions to number
  const portions = parseInt(recipe.portions);
  if (isNaN(portions) || portions < 1) {
    throw new Error("Portions must be a positive number");
  }

  // Transform ingredients
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients = recipe.ingredients.map((group) => {
      if (group.ingredients && Array.isArray(group.ingredients)) {
        group.ingredients = group.ingredients.map((ingredient) => {
          // Combine amount and unit into quantity string
          const amount = ingredient.amount || "";
          const unit = ingredient.unit || "";

          if (amount && unit) {
            ingredient.quantity = `${amount} ${unit}`;
          } else if (amount) {
            ingredient.quantity = amount.toString();
          } else {
            ingredient.quantity = "";
          }

          // Remove the separate amount and unit fields
          delete ingredient.amount;
          delete ingredient.unit;

          return ingredient;
        });
      }
      return group;
    });
  }

  // Return the transformed recipe
  return {
    ...recipe,
    time: time,
    portions: portions,
  };
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

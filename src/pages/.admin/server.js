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
  const newRecipe = req.body;

  // Read the existing recipes from the file
  const existingRecipes = JSON.parse(
    fs.readFileSync("../../data/new_recipes.json")
  );

  // Add the new recipe to the existing recipes
  existingRecipes.push(newRecipe);

  // Write the updated recipes back to the file
  fs.writeFileSync(
    "../../data/new_recipes.json",
    JSON.stringify(existingRecipes, null, 2)
  );

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

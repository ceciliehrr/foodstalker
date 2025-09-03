/**
 * Category emoji mapping for recipe categories
 */
export const categoryEmojis: Record<string, string> = {
  hverdag: "🥦", // Everyday meals (broccoli)
  helg: "🌮", // Weekend/special occasions (taco)
  søtt: "🍩", // Sweet/desserts (donut)
  tilbehør: "🥗", // Side dishes
  drikke: "🍹", // Drinks (tropical drink)
  turmat: "🔥", // Travel/hiking food (flames)
  vegetar: "🥬", // Vegetarian
  fisk: "🐟", // Fish
  kjøtt: "🥩", // Meat
  kylling: "🐔", // Chicken
  grønnsaker: "🥕", // Vegetables
  pasta: "🍝", // Pasta
  pizza: "🍕", // Pizza
  suppe: "🍲", // Soup
  salat: "🥙", // Salad
  brød: "🍞", // Bread
  kake: "🧁", // Cake
  kaffe: "☕", // Coffee
  te: "🍵", // Tea
  smoothie: "🥤", // Smoothie
  frokost: "🥞", // Breakfast
  lunsj: "🥪", // Lunch
  middag: "🍽️", // Dinner
  snacks: "🍿", // Snacks
  krydder: "🌶️", // Spices
  default: "🍜", // Default fallback
};

/**
 * Get emoji for a category
 */
export function getCategoryEmoji(category: string): string {
  return categoryEmojis[category] || categoryEmojis.default;
}

/**
 * Get all available categories with their emojis
 */
export function getAllCategoriesWithEmojis(): Array<{
  name: string;
  emoji: string;
}> {
  return Object.entries(categoryEmojis)
    .filter(([key]) => key !== "default")
    .map(([name, emoji]) => ({ name, emoji }));
}

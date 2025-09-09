// Static data service for build-time generated data
import foodmapMarkers from "../data/food_map.json";
import notionRestaurants from "../data/notion_restaurants.json";

class DataService {
  constructor() {
    // Use Notion data directly since it's available at build time
    this.restaurants = notionRestaurants;
    this.notionDataLoaded = true;
    console.log("DataService: Using Notion data directly");
  }

  /**
   * Get all restaurants (static data, no async needed)
   * @returns {Array} Array of restaurant objects
   */
  getRestaurants() {
    return this.restaurants;
  }

  /**
   * Get restaurants by city
   * @param {string} city - City name
   * @returns {Array} Filtered restaurants
   */
  getRestaurantsByCity(city) {
    const restaurants = this.getRestaurants();
    return restaurants.filter(
      (restaurant) => restaurant.city.toLowerCase() === city.toLowerCase()
    );
  }

  /**
   * Get restaurants by category
   * @param {string} category - Category name
   * @returns {Array} Filtered restaurants
   */
  getRestaurantsByCategory(category) {
    const restaurants = this.getRestaurants();
    return restaurants.filter(
      (restaurant) =>
        restaurant.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get unique cities from restaurants
   * @returns {Array} Array of unique city names
   */
  getUniqueCities() {
    const restaurants = this.getRestaurants();
    const cities = new Set();

    restaurants.forEach((restaurant) => {
      const cityName =
        restaurant.city.charAt(0).toUpperCase() +
        restaurant.city.slice(1).toLowerCase();
      cities.add(cityName);
    });

    return Array.from(cities);
  }

  /**
   * Get data source info
   * @returns {Object} Information about data source
   */
  getDataSourceInfo() {
    return {
      source: this.notionDataLoaded ? "notion" : "fallback",
      count: this.restaurants.length,
      lastUpdated: this.notionDataLoaded ? "build-time" : "original",
    };
  }

  /**
   * Process image URL from Notion data
   * Handles both direct URLs and Notion file objects
   * @param {string|Object} imageData - Image URL or Notion file object
   * @returns {string} Processed image URL
   */
  processImageUrl(imageData) {
    if (!imageData) return null;

    // If it's already a string URL, return it
    if (typeof imageData === "string") {
      return imageData;
    }

    // If it's a Notion file object, extract the URL
    if (imageData.type === "external") {
      return imageData.external.url;
    }

    if (imageData.type === "file") {
      return imageData.file.url;
    }

    return null;
  }

  /**
   * Get restaurants with processed image URLs
   * @returns {Array} Array of restaurant objects with processed images
   */
  getRestaurantsWithProcessedImages() {
    return this.restaurants.map((restaurant) => ({
      ...restaurant,
      imageUrl: this.processImageUrl(restaurant.imageUrl),
    }));
  }
}

export default new DataService();

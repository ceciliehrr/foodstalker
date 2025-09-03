// Static data service for build-time generated data
import foodmapMarkers from "../data/food_map.json";

// Try to import build-time generated data, fallback to original
let notionRestaurants = null;
try {
  notionRestaurants = await import("../data/notion_restaurants.json");
} catch (error) {
  console.log("No build-time data found, using fallback");
}

class DataService {
  constructor() {
    this.restaurants = notionRestaurants?.default || foodmapMarkers;
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
      source: notionRestaurants ? "notion" : "fallback",
      count: this.restaurants.length,
      lastUpdated: notionRestaurants ? "build-time" : "original",
    };
  }
}

export default new DataService();

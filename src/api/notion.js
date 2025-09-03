// Notion API service for Foodstalker
import { Client } from "@notionhq/client";

class NotionService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });
    this.databaseId = process.env.NOTION_DATABASE_ID;
  }

  /**
   * Fetch all restaurants from Notion database
   * @returns {Promise<Array>} Array of restaurant objects
   */
  async getRestaurants() {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: "Date Visited",
            direction: "descending",
          },
        ],
      });

      return this.transformNotionData(response.results);
    } catch (error) {
      console.error("Error fetching from Notion:", error);
      throw error;
    }
  }

  /**
   * Transform Notion data to match your current JSON structure
   * @param {Array} notionResults - Raw Notion API results
   * @returns {Array} Transformed restaurant data
   */
  transformNotionData(notionResults) {
    return notionResults.map((page) => {
      const properties = page.properties;

      return {
        id: page.id,
        position: [
          this.getNumberValue(properties["Latitude"]),
          this.getNumberValue(properties["Longitude"]),
        ],
        city: this.getSelectValue(properties["City"]),
        title: this.getTitleValue(properties["Title"]),
        description: this.getRichTextValue(properties["Description"]),
        category: this.getSelectValue(properties["Category"]),
        imageUrl: this.getUrlValue(properties["Image URL"]),
        webPage: this.getUrlValue(properties["Website"]),
        dateVisited: this.getDateValue(properties["Date Visited"]),
        tags: this.getMultiSelectValue(properties["Tags"]),
      };
    });
  }

  // Helper methods to extract values from Notion properties
  getTitleValue(property) {
    return property?.title?.[0]?.plain_text || "";
  }

  getRichTextValue(property) {
    return property?.rich_text?.map((text) => text.plain_text).join("") || "";
  }

  getSelectValue(property) {
    return property?.select?.name || "";
  }

  getMultiSelectValue(property) {
    return property?.multi_select?.map((item) => item.name) || [];
  }

  getUrlValue(property) {
    return property?.url || "";
  }

  getNumberValue(property) {
    return property?.number || 0;
  }

  getDateValue(property) {
    if (property?.date?.start) {
      const date = new Date(property.date.start);
      return date.toLocaleDateString("nb-NO", {
        year: "numeric",
        month: "long",
      });
    }
    return "";
  }

  /**
   * Get restaurants by city
   * @param {string} city - City name
   * @returns {Promise<Array>} Filtered restaurants
   */
  async getRestaurantsByCity(city) {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(
      (restaurant) => restaurant.city.toLowerCase() === city.toLowerCase()
    );
  }

  /**
   * Get restaurants by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Filtered restaurants
   */
  async getRestaurantsByCategory(category) {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(
      (restaurant) =>
        restaurant.category.toLowerCase() === category.toLowerCase()
    );
  }
}

export default new NotionService();

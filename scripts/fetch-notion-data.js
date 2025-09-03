#!/usr/bin/env node

// Build-time script to fetch data from Notion and save as JSON
import { Client } from "@notionhq/client";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NotionDataFetcher {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });
    this.databaseId = process.env.NOTION_DATABASE_ID;
  }

  /**
   * Fetch all restaurants from Notion database
   */
  async fetchRestaurants() {
    if (!this.notion || !this.databaseId) {
      console.log("⚠️  Notion API not configured, skipping data fetch");
      return null;
    }

    try {
      console.log("🔄 Fetching data from Notion API...");

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

      const restaurants = this.transformNotionData(response.results);
      console.log(`✅ Fetched ${restaurants.length} restaurants from Notion`);

      return restaurants;
    } catch (error) {
      console.error("❌ Error fetching from Notion:", error.message);
      return null;
    }
  }

  /**
   * Transform Notion data to match your current JSON structure
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
   * Save data to JSON file
   */
  async saveData(restaurants, outputPath) {
    try {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, restaurants, { spaces: 2 });
      console.log(
        `💾 Saved ${restaurants.length} restaurants to ${outputPath}`
      );
    } catch (error) {
      console.error("❌ Error saving data:", error.message);
      throw error;
    }
  }

  /**
   * Load fallback data from existing JSON
   */
  async loadFallbackData(fallbackPath) {
    try {
      const fallbackData = await fs.readJson(fallbackPath);
      console.log(`📁 Using fallback data: ${fallbackData.length} restaurants`);
      return fallbackData;
    } catch (error) {
      console.error("❌ Error loading fallback data:", error.message);
      return [];
    }
  }
}

/**
 * Main function to fetch and save data
 */
async function main() {
  const fetcher = new NotionDataFetcher();

  // Paths
  const outputPath = path.join(
    __dirname,
    "../src/data/notion_restaurants.json"
  );
  const fallbackPath = path.join(__dirname, "../src/data/food_map.json");

  try {
    // Try to fetch from Notion
    const restaurants = await fetcher.fetchRestaurants();

    if (restaurants && restaurants.length > 0) {
      // Save Notion data
      await fetcher.saveData(restaurants, outputPath);

      // Also update the main data file for compatibility
      await fetcher.saveData(restaurants, fallbackPath);

      console.log("🎉 Build-time data fetch completed successfully!");
    } else {
      // Use fallback data
      console.log("⚠️  No data from Notion, using fallback data");
      const fallbackData = await fetcher.loadFallbackData(fallbackPath);
      await fetcher.saveData(fallbackData, outputPath);
    }
  } catch (error) {
    console.error("❌ Build-time data fetch failed:", error.message);

    // Try to use fallback data
    try {
      const fallbackData = await fetcher.loadFallbackData(fallbackPath);
      await fetcher.saveData(fallbackData, outputPath);
      console.log("✅ Using fallback data as backup");
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
      process.exit(1);
    }
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});

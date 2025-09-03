// Notion API Configuration
export const notionConfig = {
  // Set these in your environment variables or .env file
  token: process.env.NOTION_TOKEN || "",
  databaseId: process.env.NOTION_DATABASE_ID || "",

  // Feature flags
  useNotionApi: process.env.USE_NOTION_API === "true" || false,

  // Fallback to JSON data if Notion fails
  fallbackToJson: true,

  // Cache settings
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

// Environment variable names for reference
export const ENV_VARS = {
  NOTION_TOKEN: "NOTION_TOKEN",
  NOTION_DATABASE_ID: "NOTION_DATABASE_ID",
  USE_NOTION_API: "USE_NOTION_API",
};

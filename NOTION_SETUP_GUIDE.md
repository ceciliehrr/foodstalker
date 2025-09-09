# 🚀 Notion API Integration Setup Guide (Build-Time)

This guide will help you set up the Notion API integration for your Foodstalker project using **build-time data fetching** for optimal static site performance.

## 📋 Prerequisites

- A Notion account
- Access to your Notion workspace
- Your project already has the Notion client installed

## 🛠️ Step 1: Create Notion Integration

1. Go to [notion.so/my-integrations](https://notion.so/my-integrations)
2. Click **"New integration"**
3. Fill in the details:
   - **Name**: `Foodstalker API`
   - **Logo**: (optional)
   - **Associated workspace**: Select your workspace
4. Click **"Submit"**
5. Copy the **Internal Integration Token** (starts with `secret_`)

## 🗄️ Step 2: Create Notion Database

1. In your Notion workspace, create a new page
2. Add a **Database** block
3. Choose **"Table"** view
4. Set up the following properties:

### Database Properties

| Property Name  | Type         | Description            | Example                                   |
| -------------- | ------------ | ---------------------- | ----------------------------------------- |
| `Title`        | Title        | Restaurant/place name  | "Ahaan"                                   |
| `City`         | Select       | City options           | Oslo, Stavanger, Bergen, Firenze, Venezia |
| `Category`     | Select       | Category options       | Restaurant, Casual, Drinks, Søtt, Home    |
| `Description`  | Rich Text    | Long description       | "Ahaan ligger i det nyrestaurerte..."     |
| `Image URL`    | URL          | Image link             | "https://foodstalker.b-cdn.net/..."       |
| `Website`      | URL          | Restaurant website     | "https://ahaan.no/"                       |
| `Date Visited` | Date         | When you visited       | 2023-07-15                                |
| `Tags`         | Multi-select | Tags                   | thai, smart casual                        |
| `Latitude`     | Number       | GPS latitude           | 59.91532463794866                         |
| `Longitude`    | Number       | GPS longitude          | 10.719338497578114                        |
| `Published`    | Checkbox     | Whether to show on map | ✅ \*\*\*\*                               |

### Select Options Setup

**City Select Options:**

- Oslo
- Stavanger
- Bergen
- Firenze
- Venezia

**Category Select Options:**

- Restaurant
- Casual
- Drinks
- Søtt
- Home

**Tags Multi-select Options:**

- thai
- smart casual
- fine dining
- casual
- bar
- drinks
- pizza
- italiensk
- nordisk
- fransk
- kinesisk
- lunsj
- brunsj
- middag
- uteservering
- take away
- street food
- vinbar
- gelato
- is
- søtt

## 🔑 Step 3: Get Database ID

1. Open your database in Notion
2. Copy the URL from your browser
3. The Database ID is the 32-character string between the last `/` and `?` in the URL
   - Example: `https://notion.so/your-workspace/32-character-database-id?v=...`
   - Database ID: `32-character-database-id`

## 🔐 Step 4: Share Database with Integration

1. In your database, click **"Share"** in the top right
2. Click **"Add people, emails, groups, or integrations"**
3. Search for **"Foodstalker API"** (your integration name)
4. Select it and click **"Invite"**

## ⚙️ Step 5: Environment **Variables**

Create a `.env` file in your project root:

```bash
**# Notion API Configuration
NOTION_TOKEN=secret_your_integration_token_here
NOTION_DATABASE_ID=your_32_character_database_id_here

# Optional: Enable/disable Notion API (fallback to JSON)
USE_NOTION_API=true**
```

## 📊 Step 6: Import Your Data

You can import your existing JSON data into Notion:

1. **Manual Import**: Copy each restaurant from your JSON file into Notion rows
2. **CSV Import**: Convert your JSON to CSV and import (requires some data transformation)
3. **API Import**: Use the Notion API to bulk import (advanced)

### Manual Import Example

For each restaurant in your JSON:

1. Create a new row in Notion
2. Fill in the Title
3. Select the City from dropdown
4. Select the Category from dropdown
5. Paste the Description
6. Add the Image URL
7. Add the Website URL
8. Set the Date Visited
9. Add Tags (multiple selections)
10. Add Latitude and Longitude numbers
11. Check the Published checkbox

## 🚀 Step 7: Test the Integration

### Development Mode

1. Install dependencies:

   ```bash
   npm install
   ```

2. **Option A: Development with fresh data**

   ```bash
   npm run dev:with-data
   ```

   This will fetch the latest data from Notion and start the dev server.

3. **Option B: Regular development**
   ```bash
   npm run dev
   ```
   This uses cached data or fallback data.

### Build Mode

1. **Build with fresh data:**

   ```bash
   npm run build
   ```

   This automatically fetches data from Notion before building.

2. **Manual data fetch:**
   ```bash
   npm run fetch-data
   ```
   This only fetches data without building.

### Check the Results

- **Build logs**: Look for `"✅ Fetched X restaurants from Notion"` or `"📁 Using fallback data"`
- **Browser console**: Look for `"Loaded X restaurants from notion (build-time)"` or `"Loaded X restaurants from fallback (original)"`

## 🔧 Troubleshooting

### Common Issues

**"Invalid API key"**

- Check that your `NOTION_TOKEN` is correct
- Ensure the token starts with `secret_`

**"Database not found"**

- Verify your `NOTION_DATABASE_ID` is correct
- Make sure you've shared the database with your integration

**"No data showing"**

- Check that you have rows with `Published` checkbox checked
- Verify your database properties match the expected names

**"CORS errors"**

- Notion API should work from server-side, not client-side
- Make sure you're using the data service correctly

### Debug Mode

Add this to your component to see what's happening:

```javascript
// In your component
console.log("Notion config:", notionConfig);
console.log("Cache status:", dataService.getCacheStatus());
```

## 📈 Performance Benefits

1. **Build-Time Fetching**: Data is fetched once during build, not on every page load
2. **Static Generation**: No runtime API calls, perfect for static sites
3. **Fast Loading**: Data is embedded in the build, no network requests needed
4. **Reliable Fallback**: Always falls back to your original JSON data if Notion fails
5. **CDN Friendly**: Static files can be cached and served from CDN

## 🔄 Migration Strategy

1. **Phase 1**: Set up Notion database and import some test data
2. **Phase 2**: Test the build process with `npm run fetch-data`
3. **Phase 3**: Import all your data to Notion
4. **Phase 4**: Deploy with build-time data fetching
5. **Phase 5**: Keep JSON as fallback for reliability

## 📝 Next Steps

- [ ] Create your Notion integration
- [ ] Set up the database with proper properties
- [ ] Import your existing data
- [ ] Test the build process with `npm run fetch-data`
- [ ] Deploy with environment variables
- [ ] Set up CI/CD to fetch data on each build

## 🆘 Need Help?

- Check the [Notion API documentation](https://developers.notion.com/)
- Review the console logs for error messages
- Ensure all environment variables are set correctly
- Verify database permissions and sharing settings

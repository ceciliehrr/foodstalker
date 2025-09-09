# 🔐 GitHub Secrets Setup Guide

This guide shows you how to securely store your API keys and tokens in GitHub Secrets instead of using a `.env` file.

## 🚀 Why Use GitHub Secrets?

- **Security**: API keys are encrypted and never visible in logs
- **Team Safety**: No risk of accidentally committing secrets to code
- **CI/CD Ready**: Works seamlessly with GitHub Actions
- **Easy Management**: Centralized secret management

## 📋 Required Secrets

You need to add these secrets to your GitHub repository:

### Required Secrets

| Secret Name            | Description                 | How to Get                                                                          |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `NOTION_TOKEN`         | Notion integration token    | From [notion.so/my-integrations](https://notion.so/my-integrations)                 |
| `NOTION_DATABASE_ID`   | Your Notion database ID     | From your database URL                                                              |
| `NETLIFY_ACCESS_TOKEN` | Netlify API token           | From [app.netlify.com/user/applications](https://app.netlify.com/user/applications) |
| `NETLIFY_SITE_ID`      | Your Netlify site ID        | From your site settings                                                             |
| `PLAUSIBLE_API_KEY`    | Plausible Analytics API key | From [plausible.io/settings](https://plausible.io/settings)                         |

### Optional Secrets (for image optimization)

| Secret Name             | Description           | How to Get                                    |
| ----------------------- | --------------------- | --------------------------------------------- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From [cloudinary.com](https://cloudinary.com) |
| `CLOUDINARY_API_KEY`    | Cloudinary API key    | From Cloudinary dashboard                     |

## 🛠️ Step-by-Step Setup

### Step 1: Add Secrets to GitHub

1. **Go to your GitHub repository**
2. **Click "Settings"** (in the repository menu)
3. **Click "Secrets and variables"** → **"Actions"**
4. **Click "New repository secret"**
5. **Add each secret** with the name and value from the table above

### Step 2: Get Your API Keys

#### Notion API Setup

1. Go to [notion.so/my-integrations](https://notion.so/my-integrations)
2. Click **"New integration"**
3. Fill in details:
   - **Name**: `Foodstalker API`
   - **Associated workspace**: Select your workspace
4. Click **"Submit"**
5. Copy the **Internal Integration Token** (starts with `secret_`)
6. Add this as `NOTION_TOKEN` secret

#### Notion Database ID

1. Open your Notion database
2. Copy the URL from your browser
3. The Database ID is the 32-character string between the last `/` and `?`
   - Example: `https://notion.so/your-workspace/32-character-database-id?v=...`
   - Database ID: `32-character-database-id`
4. Add this as `NOTION_DATABASE_ID` secret

#### Netlify API Setup

1. Go to [app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Click **"New access token"**
3. Give it a name like "Foodstalker Deploy"
4. Copy the token
5. Add this as `NETLIFY_ACCESS_TOKEN` secret

#### Netlify Site ID

1. Go to your site in Netlify dashboard
2. Go to **"Site settings"** → **"General"**
3. Copy the **Site ID**
4. Add this as `NETLIFY_SITE_ID` secret

#### Plausible API Key

1. Go to [plausible.io/settings](https://plausible.io/settings)
2. Click on **"API Keys"** in the sidebar
3. Click **"Create API Key"**
4. Give it a name like "Foodstalker Analytics"
5. Copy the generated API key
6. Add this as `PLAUSIBLE_API_KEY` secret

### Step 3: Test the Setup

1. **Go to your repository's "Actions" tab**
2. **Click on "Netlify Scheduled Deployment"**
3. **Click "Run workflow"** (manual trigger)
4. **Watch the workflow run** and check for any errors

## 🔧 How It Works

### GitHub Actions Workflow

The workflow now:

1. **Checks out your code**
2. **Sets up Node.js**
3. **Installs dependencies**
4. **Fetches data from Notion** (using secrets)
5. **Builds the project** (using secrets)
6. **Triggers Netlify deployment**

### Environment Variables in Actions

The secrets are available as environment variables:

```yaml
env:
  NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
  CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
  # ... etc
```

### Local Development

For local development, you can still use a `.env` file:

```bash
# .env (for local development only)
NOTION_TOKEN=secret_your_token_here
NOTION_DATABASE_ID=your_database_id_here
```

**Important**: Add `.env` to your `.gitignore` file!

## 📁 File Structure

```
your-repo/
├── .github/
│   └── workflows/
│       └── netlify-deploy.yml  # Updated workflow
├── scripts/
│   └── fetch-notion-data.js    # Uses environment variables
├── .env                        # Local development only
├── .gitignore                  # Should include .env
└── ...
```

## 🚨 Security Best Practices

### ✅ Do

- Use GitHub Secrets for all API keys
- Add `.env` to `.gitignore`
- Use different tokens for different environments
- Regularly rotate your API keys
- Use least-privilege access for tokens

### ❌ Don't

- Commit `.env` files to git
- Share secrets in chat/email
- Use production keys in development
- Hardcode secrets in your code
- Use the same token for multiple projects

## 🔍 Troubleshooting

### Common Issues

**"Notion API not configured"**

- Check that `NOTION_TOKEN` secret is set correctly
- Verify the token starts with `secret_`
- Make sure the integration has access to your database

**"Database not found"**

- Check that `NOTION_DATABASE_ID` secret is set correctly
- Verify the database ID is exactly 32 characters
- Make sure you've shared the database with your integration

**"Build failed"**

- Check the Actions logs for specific error messages
- Verify all required secrets are set
- Test the `fetch-data` script locally first

**"Netlify deployment failed"**

- Check that `NETLIFY_ACCESS_TOKEN` is valid
- Verify `NETLIFY_SITE_ID` is correct
- Make sure the token has deploy permissions

### Debug Steps

1. **Check secrets are set**:

   - Go to Settings → Secrets and variables → Actions
   - Verify all required secrets are listed

2. **Test locally**:

   ```bash
   # Test with your .env file
   npm run fetch-data
   ```

3. **Check workflow logs**:

   - Go to Actions tab
   - Click on the latest workflow run
   - Check each step for errors

4. **Verify API access**:
   - Test your Notion integration manually
   - Check Netlify API access

## 📈 Benefits

### Security

- **Encrypted storage** of all sensitive data
- **No accidental commits** of API keys
- **Audit trail** of secret usage

### Automation

- **Automatic deployments** with fresh data
- **Scheduled builds** every Sunday
- **Manual triggers** when needed

### Team Collaboration

- **Safe sharing** of repository
- **No local setup** required for deployments
- **Consistent environment** across team

## 🔄 Migration from .env

If you're currently using a `.env` file:

1. **Add all secrets to GitHub** (as described above)
2. **Test the workflow** to make sure it works
3. **Remove sensitive data from .env** (keep only non-sensitive config)
4. **Add .env to .gitignore** if not already there
5. **Delete the .env file** from your repository

## 📞 Need Help?

- Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
- Review the [Notion API documentation](https://developers.notion.com/)
- Check the workflow logs for specific error messages
- Test locally first with a `.env` file

## ✅ Checklist

- [ ] Added `NOTION_TOKEN` secret
- [ ] Added `NOTION_DATABASE_ID` secret
- [ ] Added `NETLIFY_ACCESS_TOKEN` secret
- [ ] Added `NETLIFY_SITE_ID` secret
- [ ] Added `PLAUSIBLE_API_KEY` secret
- [ ] Added optional Cloudinary secrets (if using)
- [ ] Tested the workflow manually
- [ ] Verified data is fetched correctly
- [ ] Confirmed Netlify deployment works
- [ ] Added `.env` to `.gitignore`
- [ ] Removed sensitive data from `.env`

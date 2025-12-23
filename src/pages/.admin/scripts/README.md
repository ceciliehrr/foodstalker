# Data Cleaning Scripts

This directory contains scripts to clean and standardize recipe data.

## clean-existing-data.js

This script cleans existing recipe data in `recipes.json` to ensure consistent formatting.

### What it does:

1. **Time standardization**: Converts time strings like "30 min", "1.5 timer", "12-20 timer" to numbers (minutes)
2. **Portions standardization**: Ensures portions field is always a number
3. **Ingredient quantity standardization**: Standardizes ingredient quantities with proper units

### Usage:

```bash
cd src/pages/.admin/scripts
node clean-existing-data.js
```

### Before running:

- The script will create a backup of your original data as `recipes_backup.json`
- Make sure you have a backup of your data before running the script

### Time format examples:

- "30 min" → 30
- "1.5 timer" → 90
- "12-20 timer" → 960 (average)
- "45 minutter" → 45

### Ingredient quantity examples:

- "4 stk" → "4 stk"
- "150 gram" → "150 g"
- "2 spiseskje" → "2 ss"
- "1 teskje" → "1 ts"

### Supported units:

- stk (stykker)
- g (gram)
- kg (kilo)
- ss (spiseskje)
- ts (teskje)
- dl (desiliter)
- l (liter)
- fedd
- biter
- klype
- dash

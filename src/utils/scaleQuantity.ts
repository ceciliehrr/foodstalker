// Skalerer en mengde (f.eks. "2 dl", "1/2-1 ts", "4-5 stk") fra
// oppskriftens standardporsjoner til valgt antall porsjoner.
export function scaleQuantity(
  originalQuantity: string,
  basePortions: number,
  portion: number
): string {
  // Adjust the quantity based on the selected portion

  // Handle empty or invalid quantities
  if (!originalQuantity || originalQuantity.trim() === "") {
    return "";
  }

  // Handle ranges with fractions first (like "1/2-1 dl", "1/4-2 stk")
  const rangeWithFractionMatch = originalQuantity.match(
    /(\d+\/\d+)\s*-\s*([\d.]+)\s*([^\d\s\/-]+)/
  );
  if (rangeWithFractionMatch) {
    const fraction = rangeWithFractionMatch[1];
    const secondValue = rangeWithFractionMatch[2];
    const unit = rangeWithFractionMatch[3];

    // Convert fraction to decimal for calculation
    const [numerator, denominator] = fraction.split("/").map(Number);
    const decimalValue = numerator / denominator;
    const secondNumericValue = parseFloat(secondValue);

    // Adjust both values based on the selected portion
    const adjustedFirst = (decimalValue / basePortions) * portion;
    const adjustedSecond =
      (secondNumericValue / basePortions) * portion;

    // Format both values as decimals for consistency in ranges
    const formattedFirst =
      adjustedFirst % 1 === 0
        ? adjustedFirst.toFixed(0)
        : adjustedFirst.toFixed(1);

    const formattedSecond =
      adjustedSecond % 1 === 0
        ? adjustedSecond.toFixed(0)
        : adjustedSecond.toFixed(1);

    return `${formattedFirst}-${formattedSecond} ${unit}`;
  }

  // Handle simple fractions (like "1/2 dl", "1/4 stk")
  const fractionMatch = originalQuantity.match(
    /(\d+\/\d+)\s*([^\d\s\/-]+)/
  );
  if (fractionMatch) {
    const fraction = fractionMatch[1];
    const unit = fractionMatch[2];

    // Convert fraction to decimal for calculation
    const [numerator, denominator] = fraction.split("/").map(Number);
    const decimalValue = numerator / denominator;

    // Adjust the numeric value based on the selected portion
    const adjustedValue = (decimalValue / basePortions) * portion;

    // Always format as decimal for consistency
    const formattedValue =
      adjustedValue % 1 === 0
        ? adjustedValue.toFixed(0)
        : adjustedValue.toFixed(1);
    return `${formattedValue} ${unit}`;
  }

  // Extract the numeric value and unit from the original quantity
  // Updated regex to handle ranges with spaces around hyphen
  const match = originalQuantity.match(/([\d.\s-]+)\s*([^\d\s-]+)/);

  if (match) {
    // Clean up the numeric part by removing extra spaces
    const numericPart = match[1].trim();
    const unit = match[2];

    // Check if it's a range (contains hyphen and has spaces around it)
    const isRange =
      numericPart.includes("-") ||
      numericPart.includes(" -") ||
      numericPart.includes("- ");

    if (isRange) {
      // Handle the case where the original quantity is a range
      // Split on hyphen and clean up spaces
      const rangeParts = numericPart
        .split(/-|\s-\s|\s-/)
        .map((part) => part.trim())
        .filter((part) => part);
      const unit = match[2];

      // Adjust each part of the range based on the selected portion
      const adjustedRange = rangeParts.map((part) => {
        const numericValue = parseFloat(part);

        // Validate that we have a valid number
        if (isNaN(numericValue)) {
          return part; // Return original if not a valid number
        }

        const adjustedValue = (numericValue / basePortions) * portion;
        const formattedValue =
          adjustedValue % 1 === 0
            ? adjustedValue.toFixed(0)
            : adjustedValue.toFixed(1);

        return formattedValue;
      });

      // You may want to format the quantity here if needed
      return `${adjustedRange.join("-")} ${unit}`;
    } else {
      // Handle the case where the original quantity is a single value
      const numericValue = parseFloat(numericPart);

      // Validate that we have a valid number
      if (isNaN(numericValue)) {
        return originalQuantity; // Return original if not a valid number
      }

      const unit = match[2];

      // Adjust the numeric value based on the selected portion
      const adjustedValue = (numericValue / basePortions) * portion;

      const formattedValue =
        adjustedValue % 1 === 0
          ? adjustedValue.toFixed(0)
          : adjustedValue.toFixed(1);

      // You may want to format the quantity here if needed
      return formattedValue + " " + unit;
    }
  } else {
    // If no numeric value and unit are found, return the original quantity
    return originalQuantity;
  }
}

export function getIngredientDisplayName(ingredient: {
  name: string;
  details?: string;
}): string {
  if (ingredient.details) {
    return `${ingredient.name} (${ingredient.details})`;
  }
  return ingredient.name;
}

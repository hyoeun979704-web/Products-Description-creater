// Single source of truth for Unsplash category vocabulary.
// Must match:
//   - the CSV `category` column supplied by the user
//   - the allowed values of `output_json.category` from Claude
//   - the `unsplash_images.category` rows in Postgres
// Add categories here first, then regenerate CSV + redeploy prompts.

export const UNSPLASH_CATEGORIES = [
  "food",
  "beverage",
  "beauty",
  "fashion",
  "home",
  "kitchen",
  "electronics",
  "outdoor",
  "health",
  "pet",
  "baby",
  "stationery",
  "other",
] as const;

export type UnsplashCategory = (typeof UNSPLASH_CATEGORIES)[number];

export const SLOT_HINTS = ["hero", "feature", "spec", "any"] as const;
export type SlotHint = (typeof SLOT_HINTS)[number];

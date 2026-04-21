import type { UnsplashCategory, SlotHint } from "@/lib/unsplash/categories";
import { UNSPLASH_FIXTURES } from "@/lib/fixtures/unsplash";

export type UnsplashImage = {
  id: string;
  url: string;          // url_regular
  thumbnailUrl: string; // url_small
  photographer: string;
  photographerUrl: string;
  category: UnsplashCategory;
  slotHint: SlotHint | null;
};

export type UnsplashPool = {
  /** Pick a random image for a given category/slot, excluding any ids already used in this generation. */
  pickFor(
    category: UnsplashCategory,
    slot: SlotHint,
    excludeIds?: readonly string[]
  ): Promise<UnsplashImage | null>;
  /** All images for a category, for "re-roll" UX in the editor. */
  listFor(category: UnsplashCategory): Promise<UnsplashImage[]>;
};

function toImage(row: (typeof UNSPLASH_FIXTURES)[number]): UnsplashImage {
  return {
    id: row.unsplash_id,
    url: row.url_regular,
    thumbnailUrl: row.url_small,
    photographer: row.photographer,
    photographerUrl: row.photographer_url,
    category: row.category,
    slotHint: row.slot_hint,
  };
}

/**
 * Fixture-backed pool. Swap for a Supabase-backed implementation once the
 * unsplash_images table is seeded — consumers only import `unsplashPool`.
 */
export const unsplashPool: UnsplashPool = {
  async pickFor(category, slot, excludeIds = []) {
    const all = UNSPLASH_FIXTURES.map(toImage);
    const pool = all.filter(
      (img) =>
        img.category === category &&
        (img.slotHint === slot || img.slotHint === "any" || img.slotHint === null) &&
        !excludeIds.includes(img.id)
    );
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  async listFor(category) {
    return UNSPLASH_FIXTURES.filter((img) => img.category === category).map(toImage);
  },
};

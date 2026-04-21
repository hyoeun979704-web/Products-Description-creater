import type { UnsplashCategory, SlotHint } from "@/lib/unsplash/categories";
import { UNSPLASH_FIXTURES } from "@/lib/fixtures/unsplash";

export type UnsplashImage = {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl: string;
  category: UnsplashCategory;
  slotHint: SlotHint | null;
  tags: string[];
};

export type PickOptions = {
  excludeIds?: readonly string[];
  /** Deterministic pick when provided — same seed → same image. */
  seed?: string;
};

export type PickRequest = {
  slotId: string;
  hint: SlotHint;
  seed?: string;
};

export type UnsplashPool = {
  pickFor(
    category: UnsplashCategory,
    slot: SlotHint,
    opts?: PickOptions
  ): Promise<UnsplashImage | null>;
  /**
   * Batch-pick for multiple slots. Guarantees no duplicate ids within the
   * returned map. Supabase impl can do this in a single query.
   */
  pickManyFor(
    category: UnsplashCategory,
    requests: readonly PickRequest[],
    excludeIds?: readonly string[]
  ): Promise<Record<string, UnsplashImage | null>>;
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
    tags: row.tags,
  };
}

// FNV-1a 32-bit. Used for seeded picks so repeated renders of the same
// generation produce the same Unsplash images.
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function filterPool(
  all: UnsplashImage[],
  category: UnsplashCategory,
  slot: SlotHint,
  excludeIds: readonly string[]
) {
  return all.filter(
    (img) =>
      img.category === category &&
      (img.slotHint === slot || img.slotHint === "any" || img.slotHint === null) &&
      !excludeIds.includes(img.id)
  );
}

/**
 * Fixture-backed pool. Swap for a Supabase-backed implementation once the
 * unsplash_images table is seeded — consumers only import `unsplashPool`.
 */
export const unsplashPool: UnsplashPool = {
  async pickFor(category, slot, opts = {}) {
    const { excludeIds = [], seed } = opts;
    const pool = filterPool(UNSPLASH_FIXTURES.map(toImage), category, slot, excludeIds);
    if (pool.length === 0) return null;
    const idx = seed === undefined
      ? Math.floor(Math.random() * pool.length)
      : hash32(seed) % pool.length;
    return pool[idx];
  },

  async pickManyFor(category, requests, excludeIds = []) {
    const all = UNSPLASH_FIXTURES.map(toImage);
    const used = [...excludeIds];
    const out: Record<string, UnsplashImage | null> = {};
    for (const req of requests) {
      const pool = filterPool(all, category, req.hint, used);
      if (pool.length === 0) {
        out[req.slotId] = null;
        continue;
      }
      const idx = req.seed === undefined
        ? Math.floor(Math.random() * pool.length)
        : hash32(req.seed) % pool.length;
      const pick = pool[idx];
      out[req.slotId] = pick;
      used.push(pick.id);
    }
    return out;
  },

  async listFor(category) {
    return UNSPLASH_FIXTURES.filter((img) => img.category === category).map(toImage);
  },
};

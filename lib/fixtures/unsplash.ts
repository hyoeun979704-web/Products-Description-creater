import type { UnsplashCategory, SlotHint } from "@/lib/unsplash/categories";

export type FixtureUnsplashImage = {
  unsplash_id: string;
  url_regular: string;
  url_small: string;
  photographer: string;
  photographer_url: string;
  category: UnsplashCategory;
  tags: string[];
  slot_hint: SlotHint | null;
};

// Real Unsplash photo IDs + hotlinks. Attributed per Unsplash TOS.
// Replace with the user's curated CSV once Supabase is connected.
export const UNSPLASH_FIXTURES: FixtureUnsplashImage[] = [
  {
    unsplash_id: "photo-1509042239860-f550ce710b93",
    url_regular: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80",
    url_small: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    photographer: "Nathan Dumlao",
    photographer_url: "https://unsplash.com/@nate_dumlao",
    category: "beverage",
    tags: ["coffee", "beans"],
    slot_hint: "feature",
  },
  {
    unsplash_id: "photo-1495474472287-4d71bcdd2085",
    url_regular: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    url_small: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    photographer: "Nathan Dumlao",
    photographer_url: "https://unsplash.com/@nate_dumlao",
    category: "beverage",
    tags: ["coffee", "pour"],
    slot_hint: "feature",
  },
  {
    unsplash_id: "photo-1587080413959-06b859fb107d",
    url_regular: "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=1200&q=80",
    url_small: "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=400&q=80",
    photographer: "Mike Kenneally",
    photographer_url: "https://unsplash.com/@asthetik",
    category: "beverage",
    tags: ["coffee", "beans", "texture"],
    slot_hint: "hero",
  },
  {
    unsplash_id: "photo-1497935586351-b67a49e012bf",
    url_regular: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200&q=80",
    url_small: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80",
    photographer: "Clay Banks",
    photographer_url: "https://unsplash.com/@claybanks",
    category: "beverage",
    tags: ["coffee", "shop"],
    slot_hint: "any",
  },
  {
    unsplash_id: "photo-1565299624946-b28f40a0ae38",
    url_regular: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
    url_small: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    photographer: "Alena Jarrett",
    photographer_url: "https://unsplash.com/@alenajarrett",
    category: "food",
    tags: ["pizza"],
    slot_hint: "hero",
  },
];

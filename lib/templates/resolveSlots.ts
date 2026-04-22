import type { GenerationPhoto } from "@/lib/data/generations";
import type { TemplateDef, ResolvedSlot } from "@/components/templates/registry";
import type { UnsplashPool, PickRequest } from "@/lib/data/unsplash";
import type { UnsplashCategory } from "@/lib/unsplash/categories";

/**
 * Bind each template slot to a concrete image URL.
 *  - "user" slots → the user's uploaded photos in order
 *  - "user-or-unsplash" → user photo if available, else Unsplash
 *  - "unsplash" → always Unsplash
 *
 * Deterministic when `seedPrefix` is provided: the same inputs produce the
 * same Unsplash picks across requests, so re-rendering the preview doesn't
 * shuffle images.
 */
export async function resolveSlots(
  template: TemplateDef,
  userPhotos: GenerationPhoto[],
  category: UnsplashCategory,
  pool: UnsplashPool,
  seedPrefix?: string
): Promise<Record<string, ResolvedSlot>> {
  const out: Record<string, ResolvedSlot> = {};
  const userQueue = [...userPhotos];
  const unsplashRequests: PickRequest[] = [];

  for (const slot of template.slots) {
    const wantsUser = slot.source === "user" || slot.source === "user-or-unsplash";
    const userPhoto = wantsUser ? userQueue.shift() : undefined;

    if (userPhoto) {
      out[slot.id] = { slotId: slot.id, url: userPhoto.url, source: "user" };
      continue;
    }
    if (slot.source === "user") continue; // required user slot left empty — Step 6 UI surfaces it

    unsplashRequests.push({
      slotId: slot.id,
      hint: slot.slotHint,
      seed: seedPrefix ? `${seedPrefix}:${slot.id}` : undefined,
    });
  }

  const picks = await pool.pickManyFor(category, unsplashRequests);
  for (const req of unsplashRequests) {
    const pick = picks[req.slotId];
    if (!pick) continue;
    out[req.slotId] = {
      slotId: req.slotId,
      url: pick.url,
      source: "unsplash",
      unsplashId: pick.id,
      credit: {
        photographer: pick.photographer,
        photographerUrl: pick.photographerUrl,
      },
    };
  }
  return out;
}

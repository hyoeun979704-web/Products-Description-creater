import type { GenerationPhoto } from "@/lib/data/generations";
import type { TemplateDef, ResolvedSlot } from "@/components/templates/registry";
import type { UnsplashPool } from "@/lib/data/unsplash";
import type { UnsplashCategory, SlotHint } from "@/lib/unsplash/categories";

/**
 * Bind each template slot to a concrete image URL.
 *  - "user" slots → the user's uploaded photos in order
 *  - "user-or-unsplash" → user photo if available, else Unsplash
 *  - "unsplash" → always Unsplash
 *
 * Deterministic for a given input + pool; re-rolling is done by the editor
 * via pool.pickFor with an exclude list.
 */
export async function resolveSlots(
  template: TemplateDef,
  userPhotos: GenerationPhoto[],
  category: UnsplashCategory,
  pool: UnsplashPool
): Promise<Record<string, ResolvedSlot>> {
  const out: Record<string, ResolvedSlot> = {};
  const userQueue = [...userPhotos];
  const usedUnsplashIds: string[] = [];

  for (const slot of template.slots) {
    const slotHint = sectionToSlotHint(slot.section);
    const wantsUser = slot.source === "user" || slot.source === "user-or-unsplash";
    const userPhoto = wantsUser ? userQueue.shift() : undefined;

    if (userPhoto) {
      out[slot.id] = { slotId: slot.id, url: userPhoto.url, source: "user" };
      continue;
    }
    if (slot.source === "user") continue; // required user slot left empty — let UI surface it

    const pick = await pool.pickFor(category, slotHint, usedUnsplashIds);
    if (!pick) continue;
    usedUnsplashIds.push(pick.id);
    out[slot.id] = {
      slotId: slot.id,
      url: pick.url,
      source: "unsplash",
      credit: {
        photographer: pick.photographer,
        photographerUrl: pick.photographerUrl,
      },
    };
  }
  return out;
}

function sectionToSlotHint(section: string): SlotHint {
  if (section === "hero") return "hero";
  if (section === "features") return "feature";
  return "any";
}

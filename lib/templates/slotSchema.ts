import { z } from "zod";

/**
 * Canonical schema for a resolved image slot. Used by:
 *  - `components/templates/registry.ts` (re-exports the inferred type)
 *  - `lib/actions/generations.ts` (validates autosave patches)
 *  - `lib/templates/resolveSlots.ts` (produces values of this shape)
 */
export const resolvedSlotSchema = z.object({
  slotId: z.string(),
  url: z.string().url(),
  source: z.enum(["user", "unsplash"]),
  /** Unsplash photo id when source === "unsplash". Lets the editor exclude
   * currently-visible images when re-sampling without fragile URL parsing. */
  unsplashId: z.string().optional(),
  credit: z
    .object({
      photographer: z.string(),
      photographerUrl: z.string().url(),
    })
    .optional(),
});

export type ResolvedSlot = z.infer<typeof resolvedSlotSchema>;

"use server";

import {
  generationStore,
  type GenerationEditPatch,
} from "@/lib/data/generations";
import { unsplashPool } from "@/lib/data/unsplash";
import { getTemplate } from "@/components/templates/registry";
import type { ResolvedSlot } from "@/lib/templates/slotSchema";
import { resolvedSlotSchema } from "@/lib/templates/slotSchema";
import {
  generationOutputSchema,
  type GenerationOutput,
} from "@/lib/claude/schema";
import { z } from "zod";

const editPatchSchema = z.object({
  edited: generationOutputSchema.optional(),
  imageSlots: z.record(z.string(), resolvedSlotSchema).optional(),
});

export async function saveGenerationEdits(
  id: string,
  rawPatch: GenerationEditPatch
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = editPatchSchema.safeParse(rawPatch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  try {
    await generationStore.saveEdits(id, parsed.data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "save failed" };
  }
}

/**
 * Pick a different Unsplash image for a given slot, excluding the current
 * image plus any other already-visible Unsplash picks so the editor doesn't
 * swap in a duplicate of another slot.
 */
export async function pickUnsplashForSlot(
  generationId: string,
  slotId: string,
  excludeIds: readonly string[]
): Promise<ResolvedSlot | null> {
  const gen = await generationStore.getById(generationId);
  if (!gen) return null;
  const data: GenerationOutput = gen.editedJson ?? gen.outputJson;
  const tpl = getTemplate(data.selected_template_id);
  if (!tpl) return null;
  const slot = tpl.slots.find((s) => s.id === slotId);
  if (!slot) return null;

  const pick = await unsplashPool.pickFor(data.category, slot.slotHint, {
    excludeIds,
  });
  if (!pick) return null;
  return {
    slotId,
    url: pick.url,
    source: "unsplash",
    unsplashId: pick.id,
    credit: {
      photographer: pick.photographer,
      photographerUrl: pick.photographerUrl,
    },
  };
}

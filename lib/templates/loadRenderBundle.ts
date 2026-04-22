import type { GenerationOutput } from "@/lib/claude/schema";
import { generationStore, type Generation } from "@/lib/data/generations";
import { unsplashPool } from "@/lib/data/unsplash";
import { getTemplate, type TemplateDef } from "@/components/templates/registry";
import type { ResolvedSlot } from "@/lib/templates/slotSchema";
import { resolveSlots } from "./resolveSlots";

export type RenderBundle = {
  generation: Generation;
  template: TemplateDef;
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
};

/**
 * Shared loader used by preview, editor, and PNG export so slot-resolution
 * logic doesn't drift between call sites.
 *
 * `generation.imageSlots` is a user-authored override of specific slots.
 * Precedence: override wins where present, defaults fill the rest. When the
 * override already covers every slot in the template, resolveSlots is
 * skipped entirely — the Unsplash pool is not hit at all.
 */
export async function loadRenderBundle(id: string): Promise<RenderBundle | null> {
  const generation = await generationStore.getById(id);
  if (!generation) return null;
  const data = generation.editedJson ?? generation.outputJson;
  const template = getTemplate(data.selected_template_id);
  if (!template) return null;

  const override = generation.imageSlots;
  const fullyCovered = template.slots.every((s) => override[s.id]);
  const defaults: Record<string, ResolvedSlot> = fullyCovered
    ? {}
    : await resolveSlots(
        template,
        generation.inputPhotos,
        data.category,
        unsplashPool,
        id
      );
  const slots = { ...defaults, ...override };
  return { generation, template, data, slots };
}

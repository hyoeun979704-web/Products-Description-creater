import type { GenerationOutput } from "@/lib/claude/schema";
import { generationStore, type Generation } from "@/lib/data/generations";
import { unsplashPool } from "@/lib/data/unsplash";
import {
  getTemplate,
  type TemplateDef,
  type ResolvedSlot,
} from "@/components/templates/registry";
import { resolveSlots } from "./resolveSlots";

export type RenderBundle = {
  generation: Generation;
  template: TemplateDef;
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
};

/**
 * Shared loader used by preview, editor (Step 6), and PNG export (Step 7) so
 * slot-resolution logic doesn't drift between call sites.
 */
export async function loadRenderBundle(id: string): Promise<RenderBundle | null> {
  const generation = await generationStore.getById(id);
  if (!generation) return null;
  const data = generation.editedJson ?? generation.outputJson;
  const template = getTemplate(data.selected_template_id);
  if (!template) return null;
  const slots = await resolveSlots(
    template,
    generation.inputPhotos,
    data.category,
    unsplashPool,
    id
  );
  return { generation, template, data, slots };
}

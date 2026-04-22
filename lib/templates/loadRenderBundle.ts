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
 * Shared loader used by preview, editor, and PNG export so slot-resolution
 * logic doesn't drift between call sites.
 *
 * Precedence: persisted `generation.imageSlots` overrides → resolveSlots()
 * default. Any non-empty override is treated as authoritative; a partial
 * override is merged so unassigned slots still get the default auto-pick.
 */
export async function loadRenderBundle(id: string): Promise<RenderBundle | null> {
  const generation = await generationStore.getById(id);
  if (!generation) return null;
  const data = generation.editedJson ?? generation.outputJson;
  const template = getTemplate(data.selected_template_id);
  if (!template) return null;
  const defaults = await resolveSlots(
    template,
    generation.inputPhotos,
    data.category,
    unsplashPool,
    id
  );
  const slots = { ...defaults, ...generation.imageSlots };
  return { generation, template, data, slots };
}

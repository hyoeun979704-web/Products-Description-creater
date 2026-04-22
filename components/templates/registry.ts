// Server-safe template metadata. Does NOT export the React components —
// TemplateRenderer (client) resolves template_id → component via a separate
// client-side map. This keeps `getTemplate()` callable from server code like
// loadRenderBundle without pulling client components into a server bundle.

import type { SlotHint } from "@/lib/unsplash/categories";
import { DUMMY_TEMPLATE_DEF } from "./dummy/def";

export const TEMPLATE_SECTIONS = ["hero", "features", "specs", "notice"] as const;
export type TemplateSection = (typeof TEMPLATE_SECTIONS)[number];

export type TemplateSlot = {
  id: string;
  section: TemplateSection;
  source: "user" | "unsplash" | "user-or-unsplash";
  slotHint: SlotHint;
};

export type TemplateConstraints = {
  features: { min: number; max: number };
  specs: { min: number; max: number };
};

export type ResolvedSlot = {
  slotId: string;
  url: string;
  source: "user" | "unsplash";
  /** Unsplash photo id when source === "unsplash". Lets the editor exclude
   * currently-visible images when re-sampling without fragile URL parsing. */
  unsplashId?: string;
  credit?: {
    photographer: string;
    photographerUrl: string;
  };
};

/** Stable ref-callback map. Parent should memoize callbacks (useCallback)
 * so identity is stable across re-renders. */
export type SectionRefs = Partial<
  Record<TemplateSection, (el: HTMLDivElement | null) => void>
>;

import type { GenerationOutput } from "@/lib/claude/schema";

export type TemplateProps = {
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
  showWatermark: boolean;
  sectionRefs?: SectionRefs;
};

export type TemplateDef = {
  id: string;
  label: string;
  description: string;
  sections: readonly TemplateSection[];
  slots: readonly TemplateSlot[];
  constraints: TemplateConstraints;
};

const REGISTRY: Record<string, TemplateDef> = {
  [DUMMY_TEMPLATE_DEF.id]: DUMMY_TEMPLATE_DEF,
};

export function getTemplate(id: string): TemplateDef | null {
  return REGISTRY[id] ?? null;
}

export function listTemplates(): TemplateDef[] {
  return Object.values(REGISTRY);
}

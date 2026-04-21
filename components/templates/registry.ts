import type { ComponentType } from "react";
import type { GenerationOutput } from "@/lib/claude/schema";
import { DummyTemplate, DUMMY_TEMPLATE_DEF } from "./dummy";

export type TemplateSection = "hero" | "features" | "specs" | "notice";

export type TemplateSlot = {
  id: string;
  section: TemplateSection;
  source: "user" | "unsplash" | "user-or-unsplash";
};

export type TemplateConstraints = {
  features: { min: number; max: number };
  specs: { min: number; max: number };
};

export type ResolvedSlot = {
  slotId: string;
  url: string;
  source: "user" | "unsplash";
  credit?: {
    photographer: string;
    photographerUrl: string;
  };
};

export type TemplateProps = {
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
  showWatermark: boolean;
  /** Optional: called once per section with the capture-ready element. Used by Step 7 (PNG export). */
  registerSectionRef?: (section: TemplateSection, el: HTMLDivElement | null) => void;
};

export type TemplateDef = {
  id: string;
  label: string;
  description: string;
  sections: readonly TemplateSection[];
  slots: readonly TemplateSlot[];
  constraints: TemplateConstraints;
  component: ComponentType<TemplateProps>;
};

const REGISTRY: Record<string, TemplateDef> = {
  [DUMMY_TEMPLATE_DEF.id]: { ...DUMMY_TEMPLATE_DEF, component: DummyTemplate },
};

export function getTemplate(id: string): TemplateDef | null {
  return REGISTRY[id] ?? null;
}

export function listTemplates(): TemplateDef[] {
  return Object.values(REGISTRY);
}

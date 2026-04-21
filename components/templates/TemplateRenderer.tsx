"use client";

import type { ComponentType } from "react";
import { getTemplate, type ResolvedSlot, type SectionRefs, type TemplateProps } from "./registry";
import type { GenerationOutput } from "@/lib/claude/schema";
import { DummyTemplate } from "./dummy";

// Client-side map: template id → React component. Add templates here as they
// ship. Separated from `registry.ts` (server-safe metadata) so a server
// component can read template metadata without dragging React components
// across the server/client boundary.
const COMPONENTS: Record<string, ComponentType<TemplateProps>> = {
  "dummy-v1": DummyTemplate,
};

type Props = {
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
  showWatermark: boolean;
  sectionRefs?: SectionRefs;
};

export function TemplateRenderer({
  data,
  slots,
  showWatermark,
  sectionRefs,
}: Props) {
  const tpl = getTemplate(data.selected_template_id);
  const Component = tpl ? COMPONENTS[tpl.id] : undefined;
  if (!tpl || !Component) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        알 수 없는 템플릿 ID: <code>{data.selected_template_id}</code>
      </div>
    );
  }
  return (
    <Component
      data={data}
      slots={slots}
      showWatermark={showWatermark}
      sectionRefs={sectionRefs}
    />
  );
}

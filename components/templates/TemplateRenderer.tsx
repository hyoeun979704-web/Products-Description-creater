import { getTemplate, type ResolvedSlot, type TemplateSection } from "./registry";
import type { GenerationOutput } from "@/lib/claude/schema";

type Props = {
  data: GenerationOutput;
  slots: Record<string, ResolvedSlot>;
  showWatermark: boolean;
  registerSectionRef?: (section: TemplateSection, el: HTMLDivElement | null) => void;
};

export function TemplateRenderer({
  data,
  slots,
  showWatermark,
  registerSectionRef,
}: Props) {
  const tpl = getTemplate(data.selected_template_id);
  if (!tpl) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        알 수 없는 템플릿 ID: <code>{data.selected_template_id}</code>
      </div>
    );
  }
  const Component = tpl.component;
  return (
    <Component
      data={data}
      slots={slots}
      showWatermark={showWatermark}
      registerSectionRef={registerSectionRef}
    />
  );
}

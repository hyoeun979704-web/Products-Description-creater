"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { GenerationOutput } from "@/lib/claude/schema";
import type {
  ResolvedSlot,
  TemplateDef,
} from "@/components/templates/registry";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { TextForm } from "./TextForm";
import { ImageSlotsPanel } from "./ImageSlotsPanel";
import { useAutosave, type AutosaveStatus } from "@/lib/editor/useAutosave";
import { saveGenerationEdits } from "@/lib/actions/generations";

type Props = {
  generationId: string;
  template: TemplateDef;
  initialData: GenerationOutput;
  initialSlots: Record<string, ResolvedSlot>;
};

export function Editor({ generationId, template, initialData, initialSlots }: Props) {
  const [data, setData] = useState<GenerationOutput>(initialData);
  const [slots, setSlots] = useState<Record<string, ResolvedSlot>>(initialSlots);

  const patch = useMemo(
    () => ({ edited: data, imageSlots: slots }),
    [data, slots]
  );

  const save = useCallback(
    async (p: typeof patch) => {
      const res = await saveGenerationEdits(generationId, p);
      if (!res.ok) throw new Error(res.error);
    },
    [generationId]
  );

  const status = useAutosave(patch, save, 500);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-base font-semibold">편집 · {template.label}</h1>
            <p className="text-xs text-gray-500">
              <code>{generationId}</code> · 자동 저장됨
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill status={status} />
            <Link
              href={`/create/preview?id=${generationId}`}
              className="rounded-md bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
            >
              미리보기 →
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-8">
          <TextForm data={data} constraints={template.constraints} onChange={setData} />
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">이미지 슬롯</h3>
            <ImageSlotsPanel
              generationId={generationId}
              template={template}
              slots={slots}
              onChange={setSlots}
            />
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mx-auto w-[860px] max-w-full shadow-sm">
            {/* Editor preview always shows paid look (no watermark); the PNG
                export path reapplies watermark based on session state. */}
            <TemplateRenderer data={data} slots={slots} showWatermark={false} />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: AutosaveStatus }) {
  const label: Record<AutosaveStatus, string> = {
    idle: "저장됨",
    pending: "입력중…",
    saving: "저장중…",
    saved: "저장됨",
    error: "저장 실패",
  };
  const color: Record<AutosaveStatus, string> = {
    idle: "text-gray-500",
    pending: "text-gray-500",
    saving: "text-gray-700",
    saved: "text-emerald-600",
    error: "text-red-600",
  };
  return <span className={`text-xs ${color[status]}`}>{label[status]}</span>;
}

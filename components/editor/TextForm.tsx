"use client";

import type { GenerationOutput, FeatureItem, SpecItem } from "@/lib/claude/schema";
import type { TemplateConstraints } from "@/components/templates/registry";
import { LabeledInput, LabeledTextarea } from "./fields";

type Props = {
  data: GenerationOutput;
  constraints: TemplateConstraints;
  onChange: (next: GenerationOutput) => void;
};

export function TextForm({ data, constraints, onChange }: Props) {
  const { texts } = data;

  function setTexts(patch: Partial<typeof texts>) {
    onChange({ ...data, texts: { ...texts, ...patch } });
  }

  function setFeature(i: number, patch: Partial<FeatureItem>) {
    const next = texts.features.map((f, idx) => (idx === i ? { ...f, ...patch } : f));
    setTexts({ features: next });
  }

  function addFeature() {
    if (texts.features.length >= constraints.features.max) return;
    setTexts({ features: [...texts.features, { title: "", content: "" }] });
  }

  function removeFeature(i: number) {
    if (texts.features.length <= constraints.features.min) return;
    setTexts({ features: texts.features.filter((_, idx) => idx !== i) });
  }

  function setSpec(i: number, patch: Partial<SpecItem>) {
    const next = texts.specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setTexts({ specs: next });
  }

  function addSpec() {
    if (texts.specs.length >= constraints.specs.max) return;
    setTexts({ specs: [...texts.specs, { label: "", value: "" }] });
  }

  function removeSpec(i: number) {
    if (texts.specs.length <= constraints.specs.min) return;
    setTexts({ specs: texts.specs.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-8">
      <Section title="히어로">
        <LabeledInput
          label="헤드라인"
          value={texts.hero.headline}
          onChange={(headline) => setTexts({ hero: { ...texts.hero, headline } })}
          max={40}
        />
        <LabeledInput
          label="서브카피"
          value={texts.hero.sub}
          onChange={(sub) => setTexts({ hero: { ...texts.hero, sub } })}
          max={80}
        />
      </Section>

      <Section
        title={`특징 (${texts.features.length} / ${constraints.features.max})`}
        actions={
          <button
            type="button"
            onClick={addFeature}
            disabled={texts.features.length >= constraints.features.max}
            className="text-xs text-gray-700 underline disabled:text-gray-300"
          >
            + 항목 추가
          </button>
        }
      >
        {texts.features.map((f, i) => (
          <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500">#{i + 1}</span>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                disabled={texts.features.length <= constraints.features.min}
                className="text-[11px] text-gray-500 hover:text-red-600 disabled:text-gray-300"
              >
                삭제
              </button>
            </div>
            <LabeledInput
              label="제목"
              value={f.title}
              onChange={(title) => setFeature(i, { title })}
              max={20}
            />
            <LabeledTextarea
              label="내용"
              value={f.content}
              onChange={(content) => setFeature(i, { content })}
              rows={2}
              max={100}
            />
          </div>
        ))}
      </Section>

      <Section
        title={`스펙 (${texts.specs.length} / ${constraints.specs.max})`}
        actions={
          <button
            type="button"
            onClick={addSpec}
            disabled={texts.specs.length >= constraints.specs.max}
            className="text-xs text-gray-700 underline disabled:text-gray-300"
          >
            + 항목 추가
          </button>
        }
      >
        {texts.specs.map((s, i) => (
          <div key={i} className="flex items-start gap-2 rounded-md border border-gray-200 p-3">
            <div className="flex-1">
              <LabeledInput
                label="항목명"
                value={s.label}
                onChange={(label) => setSpec(i, { label })}
                max={20}
              />
            </div>
            <div className="flex-1">
              <LabeledInput
                label="값"
                value={s.value}
                onChange={(value) => setSpec(i, { value })}
                max={40}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSpec(i)}
              disabled={texts.specs.length <= constraints.specs.min}
              className="mt-5 text-[11px] text-gray-500 hover:text-red-600 disabled:text-gray-300"
              aria-label={`스펙 ${i + 1} 삭제`}
            >
              삭제
            </button>
          </div>
        ))}
      </Section>

      <Section title="안내">
        <LabeledTextarea
          label="안내 문구"
          value={texts.notice}
          onChange={(notice) => setTexts({ notice })}
          rows={4}
          max={300}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {actions}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

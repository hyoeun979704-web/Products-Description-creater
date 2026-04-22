"use client";

import { memo } from "react";
import type { GenerationOutput, FeatureItem, SpecItem } from "@/lib/claude/schema";
import type { TemplateConstraints } from "@/components/templates/registry";
import { LabeledInput, LabeledTextarea } from "./fields";

type Props = {
  data: GenerationOutput;
  constraints: TemplateConstraints;
  onChange: (next: GenerationOutput) => void;
};

function TextFormImpl({ data, constraints, onChange }: Props) {
  const { texts } = data;

  function setTexts(patch: Partial<typeof texts>) {
    onChange({ ...data, texts: { ...texts, ...patch } });
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

      <ArrayFieldEditor<FeatureItem>
        title="특징"
        items={texts.features}
        onChange={(features) => setTexts({ features })}
        min={constraints.features.min}
        max={constraints.features.max}
        empty={{ title: "", content: "" }}
        renderItem={(f, update) => (
          <div className="space-y-2">
            <LabeledInput
              label="제목"
              value={f.title}
              onChange={(title) => update({ title })}
              max={20}
            />
            <LabeledTextarea
              label="내용"
              value={f.content}
              onChange={(content) => update({ content })}
              rows={2}
              max={100}
            />
          </div>
        )}
      />

      <ArrayFieldEditor<SpecItem>
        title="스펙"
        items={texts.specs}
        onChange={(specs) => setTexts({ specs })}
        min={constraints.specs.min}
        max={constraints.specs.max}
        empty={{ label: "", value: "" }}
        renderItem={(s, update) => (
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <LabeledInput
                label="항목명"
                value={s.label}
                onChange={(label) => update({ label })}
                max={20}
              />
            </div>
            <div className="flex-1">
              <LabeledInput
                label="값"
                value={s.value}
                onChange={(value) => update({ value })}
                max={40}
              />
            </div>
          </div>
        )}
      />

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

export const TextForm = memo(TextFormImpl);

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

type ArrayFieldEditorProps<T> = {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  min: number;
  max: number;
  empty: T;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
};

function ArrayFieldEditor<T>({
  title,
  items,
  onChange,
  min,
  max,
  empty,
  renderItem,
}: ArrayFieldEditorProps<T>) {
  const canAdd = items.length < max;
  const canRemove = items.length > min;

  function update(i: number, patch: Partial<T>) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <Section
      title={`${title} (${items.length} / ${max})`}
      actions={
        <button
          type="button"
          onClick={() => canAdd && onChange([...items, empty])}
          disabled={!canAdd}
          className="text-xs text-gray-700 underline disabled:text-gray-300"
        >
          + 항목 추가
        </button>
      }
    >
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500">#{i + 1}</span>
            <button
              type="button"
              onClick={() => canRemove && onChange(items.filter((_, idx) => idx !== i))}
              disabled={!canRemove}
              className="text-[11px] text-gray-500 hover:text-red-600 disabled:text-gray-300"
            >
              삭제
            </button>
          </div>
          {renderItem(item, (patch) => update(i, patch))}
        </div>
      ))}
    </Section>
  );
}

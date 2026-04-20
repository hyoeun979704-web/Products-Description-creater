"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
};

export function KeywordsInput({ value, onChange, max = 8 }: Props) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const t = raw.trim().replace(/,/g, "");
    if (!t) return;
    if (value.includes(t)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 p-2 focus-within:border-gray-900">
        {value.map((t, i) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-gray-500 hover:text-gray-900"
              aria-label={`${t} 제거`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => addTag(draft)}
          placeholder={value.length === 0 ? "예) 프리미엄, 선물용 (Enter로 추가)" : ""}
          className="min-w-[8rem] flex-1 bg-transparent p-1 text-sm focus:outline-none"
          disabled={value.length >= max}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        선택 입력 · 최대 {max}개. Enter 또는 쉼표로 추가.
      </p>
    </div>
  );
}

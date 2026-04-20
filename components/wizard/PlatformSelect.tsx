"use client";

import { PLATFORMS, type PlatformId } from "@/lib/platforms/types";

type Props = {
  value: PlatformId | null;
  onChange: (id: PlatformId) => void;
};

export function PlatformSelect({ value, onChange }: Props) {
  return (
    <div className="grid gap-3">
      {PLATFORMS.map((p) => {
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={!p.active}
            onClick={() => p.active && onChange(p.id)}
            className={
              "flex flex-col rounded-lg border px-5 py-4 text-left transition " +
              (!p.active
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : selected
                  ? "border-gray-900 bg-gray-900/5"
                  : "border-gray-200 hover:border-gray-400")
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">{p.label}</span>
              {!p.active && (
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  준비중
                </span>
              )}
            </div>
            <span className="mt-1 text-sm">{p.description}</span>
          </button>
        );
      })}
    </div>
  );
}

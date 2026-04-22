"use client";

import { useState, useTransition } from "react";
import type { TemplateDef, ResolvedSlot } from "@/components/templates/registry";
import { pickUnsplashForSlot } from "@/lib/actions/generations";

type Props = {
  generationId: string;
  template: TemplateDef;
  slots: Record<string, ResolvedSlot>;
  onChange: (next: Record<string, ResolvedSlot>) => void;
};

// Native HTML5 drag & drop. Only slots with the same `source` may swap.
export function ImageSlotsPanel({ generationId, template, slots, onChange }: Props) {
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [busySlotId, setBusySlotId] = useState<string | null>(null);

  function onDragStart(slotId: string) {
    return () => setDragFrom(slotId);
  }

  function onDragOver(targetId: string) {
    return (e: React.DragEvent) => {
      if (!dragFrom || dragFrom === targetId) return;
      const a = slots[dragFrom];
      const b = slots[targetId];
      if (!a || !b || a.source !== b.source) return;
      e.preventDefault();
    };
  }

  function onDrop(targetId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragFrom || dragFrom === targetId) return;
      const a = slots[dragFrom];
      const b = slots[targetId];
      if (!a || !b || a.source !== b.source) return;
      const next: Record<string, ResolvedSlot> = {
        ...slots,
        [dragFrom]: { ...b, slotId: dragFrom },
        [targetId]: { ...a, slotId: targetId },
      };
      onChange(next);
      setDragFrom(null);
    };
  }

  function resampleUnsplash(slotId: string) {
    const excludeIds = Object.values(slots)
      .filter((s) => s?.source === "unsplash" && s.unsplashId)
      .map((s) => s!.unsplashId!);
    setBusySlotId(slotId);
    startTransition(async () => {
      try {
        const next = await pickUnsplashForSlot(generationId, slotId, excludeIds);
        if (next) onChange({ ...slots, [slotId]: next });
      } finally {
        setBusySlotId(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        같은 종류(사용자/Unsplash)의 슬롯끼리 드래그해서 교체할 수 있습니다.
        Unsplash 슬롯은 &quot;다른 이미지&quot; 버튼으로 다른 사진을 가져옵니다.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {template.slots.map((slot) => {
          const resolved = slots[slot.id];
          if (!resolved) return null;
          const canDrag = true;
          const isUnsplash = resolved.source === "unsplash";
          const dimmed = dragFrom && slots[dragFrom]?.source !== resolved.source;
          return (
            <div
              key={slot.id}
              draggable={canDrag}
              onDragStart={onDragStart(slot.id)}
              onDragOver={onDragOver(slot.id)}
              onDrop={onDrop(slot.id)}
              onDragEnd={() => setDragFrom(null)}
              className={
                "group relative overflow-hidden rounded-md border border-gray-200 " +
                (dimmed ? "opacity-40 " : "") +
                (dragFrom === slot.id ? "ring-2 ring-gray-900 " : "")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolved.url}
                alt={slot.id}
                className="h-32 w-full object-cover"
                draggable={false}
              />
              <div className="flex items-center justify-between bg-white px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      "rounded px-1.5 py-0.5 text-[10px] " +
                      (isUnsplash
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700")
                    }
                  >
                    {isUnsplash ? "Unsplash" : "사용자"}
                  </span>
                  <span className="text-[10px] text-gray-500">{slot.id}</span>
                </div>
                {isUnsplash && (
                  <button
                    type="button"
                    onClick={() => resampleUnsplash(slot.id)}
                    disabled={isPending && busySlotId === slot.id}
                    className="text-[11px] text-gray-700 underline hover:text-gray-900 disabled:text-gray-300"
                  >
                    {busySlotId === slot.id ? "교체중…" : "다른 이미지"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

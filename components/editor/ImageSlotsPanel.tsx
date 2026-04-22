"use client";

import { memo, useState } from "react";
import type {
  TemplateDef,
  ResolvedSlot,
} from "@/components/templates/registry";
import { pickUnsplashForSlot } from "@/lib/actions/generations";

type Props = {
  generationId: string;
  template: TemplateDef;
  slots: Record<string, ResolvedSlot>;
  onChange: (next: Record<string, ResolvedSlot>) => void;
};

function canSwap(a: ResolvedSlot | undefined, b: ResolvedSlot | undefined) {
  return !!a && !!b && a.source === b.source;
}

// Native HTML5 drag & drop. Only slots with matching `source` may swap.
function ImageSlotsPanelImpl({ generationId, template, slots, onChange }: Props) {
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());

  function allowDrop(targetId: string, e: React.DragEvent) {
    if (!dragFrom || dragFrom === targetId) return;
    if (!canSwap(slots[dragFrom], slots[targetId])) return;
    e.preventDefault();
  }

  function commitDrop(targetId: string, e: React.DragEvent) {
    e.preventDefault();
    if (!dragFrom || dragFrom === targetId) return;
    const a = slots[dragFrom];
    const b = slots[targetId];
    if (!canSwap(a, b)) return;
    onChange({
      ...slots,
      [dragFrom]: { ...b!, slotId: dragFrom },
      [targetId]: { ...a!, slotId: targetId },
    });
    setDragFrom(null);
  }

  async function resampleUnsplash(slotId: string) {
    setBusy((prev) => {
      const next = new Set(prev);
      next.add(slotId);
      return next;
    });
    try {
      // Recompute exclude list from the *current* slots map so a concurrent
      // re-sample on another slot doesn't produce a duplicate.
      const excludeIds = Object.values(slots)
        .filter((s): s is ResolvedSlot & { unsplashId: string } =>
          s?.source === "unsplash" && !!s.unsplashId
        )
        .map((s) => s.unsplashId);
      const next = await pickUnsplashForSlot(generationId, slotId, excludeIds);
      if (next) onChange({ ...slots, [slotId]: next });
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });
    }
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
          const isUnsplash = resolved.source === "unsplash";
          const dimmed = dragFrom && !canSwap(slots[dragFrom], resolved);
          const isBusy = busy.has(slot.id);
          return (
            <div
              key={slot.id}
              draggable
              onDragStart={() => setDragFrom(slot.id)}
              onDragOver={(e) => allowDrop(slot.id, e)}
              onDrop={(e) => commitDrop(slot.id, e)}
              onDragEnd={() => setDragFrom(null)}
              className={
                "relative overflow-hidden rounded-md border border-gray-200 " +
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
                    disabled={isBusy}
                    className="text-[11px] text-gray-700 underline hover:text-gray-900 disabled:text-gray-300"
                  >
                    {isBusy ? "교체중…" : "다른 이미지"}
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

export const ImageSlotsPanel = memo(ImageSlotsPanelImpl);

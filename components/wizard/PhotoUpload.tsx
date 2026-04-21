"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils/image";

export type UploadedItem = {
  blob: Blob;
  previewUrl: string;
  originalName: string;
};

type Props = {
  items: UploadedItem[];
  onChange: (next: UploadedItem[]) => void;
  max?: number;
};

export function PhotoUpload({ items, onChange, max = 3 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const room = max - items.length;
      const batch = Array.from(files).slice(0, room);
      for (const f of batch) {
        if (!f.type.startsWith("image/")) {
          throw new Error(`이미지 파일만 업로드 가능합니다: ${f.name}`);
        }
      }
      const processed = await Promise.all(
        batch.map(async (f) => {
          const { blob, previewUrl } = await compressImage(f);
          return { blob, previewUrl, originalName: f.name };
        })
      );
      onChange([...items, ...processed]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(i: number) {
    const next = [...items];
    URL.revokeObjectURL(next[i].previewUrl);
    next.splice(i, 1);
    onChange(next);
  }

  const canAdd = items.length < max;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div
            key={it.previewUrl}
            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.previewUrl}
              alt={it.originalName}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
            >
              삭제
            </button>
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white">
                슬롯 #1
              </span>
            )}
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            {busy ? "처리중…" : "+ 사진 추가"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-gray-500">
        1~{max}장까지 업로드 가능. 첫 번째 사진이 자동으로 슬롯 #1에 배치됩니다.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

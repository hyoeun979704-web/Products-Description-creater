"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WizardShell } from "@/components/wizard/WizardShell";
import { PlatformSelect } from "@/components/wizard/PlatformSelect";
import {
  PhotoUpload,
  type UploadedItem,
} from "@/components/wizard/PhotoUpload";
import { MaterialsInput } from "@/components/wizard/MaterialsInput";
import { KeywordsInput } from "@/components/wizard/KeywordsInput";
import type { PlatformId } from "@/lib/platforms/types";

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <Wizard />
    </Suspense>
  );
}

type WizardState = {
  platform: PlatformId | null;
  photos: UploadedItem[];
  materials: string;
  keywords: string[];
};

type StepDef = {
  title: string;
  subtitle?: string;
  canAdvance: (s: WizardState) => boolean;
  render: (s: WizardState, setS: (patch: Partial<WizardState>) => void) => React.ReactNode;
  nextLabel?: string;
};

function Wizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState>({
    platform: null,
    photos: [],
    materials: "",
    keywords: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Track live object URLs via a ref so the unmount cleanup sees the latest
  // set even though the effect itself has no deps.
  const photosRef = useRef(state.photos);
  photosRef.current = state.photos;
  useEffect(
    () => () =>
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)),
    []
  );

  const steps: StepDef[] = [
    {
      title: "어디에 업로드하시나요?",
      subtitle: "MVP는 스마트스토어만 지원합니다. 나머지는 곧 추가됩니다.",
      canAdvance: (s) => s.platform !== null,
      render: (s, setS) => (
        <PlatformSelect
          value={s.platform}
          onChange={(platform) => setS({ platform })}
        />
      ),
    },
    {
      title: "상품 사진을 올려주세요",
      subtitle: "1~3장. 첫 번째 사진이 상세페이지 메인에 배치됩니다.",
      canAdvance: (s) => s.photos.length >= 1,
      render: (s, setS) => (
        <PhotoUpload items={s.photos} onChange={(photos) => setS({ photos })} max={3} />
      ),
    },
    {
      title: "사용된 재료 / 특징",
      subtitle: "AI가 참고할 기본 정보를 자유롭게 적어주세요.",
      canAdvance: (s) => s.materials.trim().length > 0,
      render: (s, setS) => (
        <MaterialsInput value={s.materials} onChange={(materials) => setS({ materials })} />
      ),
    },
    {
      title: "강조 키워드 (선택)",
      subtitle: "톤앤매너와 카피 방향을 잡는 데 사용됩니다.",
      canAdvance: () => true,
      nextLabel: "상세페이지 생성",
      render: (s, setS) => (
        <>
          <KeywordsInput
            value={s.keywords}
            onChange={(keywords) => setS({ keywords })}
          />
          <div className="mt-10 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
            <div className="font-medium text-gray-900">미리보기 요약</div>
            <ul className="mt-2 space-y-1">
              <li>플랫폼: {s.platform ?? "—"}</li>
              <li>사진: {s.photos.length}장</li>
              <li>
                재료:{" "}
                {s.materials.length > 0
                  ? `${s.materials.slice(0, 40)}${s.materials.length > 40 ? "…" : ""}`
                  : "—"}
              </li>
              <li>키워드: {s.keywords.length ? s.keywords.join(", ") : "—"}</li>
            </ul>
          </div>
        </>
      ),
    },
  ];

  const total = steps.length;
  const rawStep = Number(searchParams.get("step") ?? "1");
  const stepIdx =
    Number.isFinite(rawStep) && rawStep >= 1 && rawStep <= total ? rawStep - 1 : 0;
  const current = steps[stepIdx];
  const isLast = stepIdx === total - 1;

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(next));
    router.push(`/create?${params.toString()}`);
  }

  function setS(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      // TODO(step 4): POST to /api/analyze.
      console.log("submit", {
        platform: state.platform,
        photoCount: state.photos.length,
        materials: state.materials,
        keywords: state.keywords,
      });
      alert("분석 요청은 Step 4에서 연결됩니다.\n현재는 입력값이 콘솔에 찍힙니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WizardShell
      step={stepIdx + 1}
      total={total}
      title={current.title}
      subtitle={current.subtitle}
      onBack={stepIdx > 0 ? () => go(stepIdx) : undefined}
      footer={
        <Button
          disabled={!current.canAdvance(state) || submitting}
          onClick={() => (isLast ? onSubmit() : go(stepIdx + 2))}
        >
          {isLast ? (submitting ? "처리중…" : current.nextLabel) : "다음"}
        </Button>
      }
    >
      {current.render(state, setS)}
    </WizardShell>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
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

const TOTAL_STEPS = 4;

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <Wizard />
    </Suspense>
  );
}

function Wizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStep = Number(searchParams.get("step") ?? "1");
  const step = Number.isFinite(rawStep) && rawStep >= 1 && rawStep <= TOTAL_STEPS ? rawStep : 1;

  const [platform, setPlatform] = useState<PlatformId | null>(null);
  const [photos, setPhotos] = useState<UploadedItem[]>([]);
  const [materials, setMaterials] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Revoke preview URLs on unmount.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(next: number) {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(next));
    router.push(`/create?${params.toString()}`);
  }

  function canAdvance(): boolean {
    if (step === 1) return platform !== null;
    if (step === 2) return photos.length >= 1;
    if (step === 3) return materials.trim().length > 0;
    return true;
  }

  async function onSubmit() {
    // Step 4 will wire this to /api/analyze. For now, log + stub.
    setSubmitting(true);
    try {
      console.log("submit", {
        platform,
        photoCount: photos.length,
        materials,
        keywords,
      });
      alert(
        "분석 요청은 Step 4에서 연결됩니다.\n현재는 입력값이 콘솔에 찍힙니다."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const back = step > 1 ? () => go(step - 1) : undefined;

  if (step === 1) {
    return (
      <WizardShell
        step={1}
        total={TOTAL_STEPS}
        title="어디에 업로드하시나요?"
        subtitle="MVP는 스마트스토어만 지원합니다. 나머지는 곧 추가됩니다."
        footer={
          <Button disabled={!canAdvance()} onClick={() => go(2)}>
            다음
          </Button>
        }
      >
        <PlatformSelect value={platform} onChange={setPlatform} />
      </WizardShell>
    );
  }

  if (step === 2) {
    return (
      <WizardShell
        step={2}
        total={TOTAL_STEPS}
        title="상품 사진을 올려주세요"
        subtitle="1~3장. 첫 번째 사진이 상세페이지 메인에 배치됩니다."
        onBack={back}
        footer={
          <Button disabled={!canAdvance()} onClick={() => go(3)}>
            다음
          </Button>
        }
      >
        <PhotoUpload items={photos} onChange={setPhotos} max={3} />
      </WizardShell>
    );
  }

  if (step === 3) {
    return (
      <WizardShell
        step={3}
        total={TOTAL_STEPS}
        title="사용된 재료 / 특징"
        subtitle="AI가 참고할 기본 정보를 자유롭게 적어주세요."
        onBack={back}
        footer={
          <Button disabled={!canAdvance()} onClick={() => go(4)}>
            다음
          </Button>
        }
      >
        <MaterialsInput value={materials} onChange={setMaterials} />
      </WizardShell>
    );
  }

  return (
    <WizardShell
      step={4}
      total={TOTAL_STEPS}
      title="강조 키워드 (선택)"
      subtitle="톤앤매너와 카피 방향을 잡는 데 사용됩니다."
      onBack={back}
      footer={
        <Button disabled={submitting} onClick={onSubmit}>
          {submitting ? "처리중…" : "상세페이지 생성"}
        </Button>
      }
    >
      <KeywordsInput value={keywords} onChange={setKeywords} />
      <div className="mt-10 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
        <div className="font-medium text-gray-900">미리보기 요약</div>
        <ul className="mt-2 space-y-1">
          <li>플랫폼: {platform ?? "—"}</li>
          <li>사진: {photos.length}장</li>
          <li>재료: {materials.length > 0 ? `${materials.slice(0, 40)}${materials.length > 40 ? "…" : ""}` : "—"}</li>
          <li>키워드: {keywords.length ? keywords.join(", ") : "—"}</li>
        </ul>
      </div>
    </WizardShell>
  );
}

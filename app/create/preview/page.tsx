import Link from "next/link";
import { notFound } from "next/navigation";
import { loadRenderBundle } from "@/lib/templates/loadRenderBundle";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";

type SearchParams = { id?: string; watermark?: string };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const id = searchParams.id ?? "demo-coffee";
  const bundle = await loadRenderBundle(id);
  if (!bundle) notFound();

  const { generation, template, data, slots } = bundle;

  // In production, watermark is driven by session.hasPaidCredit() (Step 9).
  // The ?watermark=off override is a dev-only helper for previewing the
  // paid-tier look before payment is wired up.
  const devOverride =
    process.env.NODE_ENV !== "production" && searchParams.watermark === "off";
  const showWatermark = !devOverride;

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto mb-6 flex max-w-[860px] items-center justify-between px-2">
        <div>
          <h1 className="text-lg font-semibold">{template.label}</h1>
          <p className="text-xs text-gray-500">
            생성 ID · <code>{generation.id}</code> · {data.category} · 워터마크{" "}
            {showWatermark ? "ON" : "OFF"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {process.env.NODE_ENV !== "production" && (
            <Link
              href={`/create/preview?id=${generation.id}&watermark=${showWatermark ? "off" : "on"}`}
              className="text-xs text-gray-600 underline"
            >
              워터마크 {showWatermark ? "끄기" : "켜기"} (dev)
            </Link>
          )}
          <Link
            href={`/create/edit?id=${generation.id}`}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            편집하기
          </Link>
        </div>
      </div>

      <div className="mx-auto w-[860px] shadow-sm">
        <TemplateRenderer data={data} slots={slots} showWatermark={showWatermark} />
      </div>

      <div className="mx-auto mt-10 max-w-[860px] px-2 text-xs text-gray-500">
        편집 / 복사 / PNG 다운로드는 Step 6~8에서 활성화됩니다.
      </div>
    </main>
  );
}

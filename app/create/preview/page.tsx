import Link from "next/link";
import { notFound } from "next/navigation";
import { generationStore } from "@/lib/data/generations";
import { unsplashPool } from "@/lib/data/unsplash";
import { getTemplate } from "@/components/templates/registry";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { resolveSlots } from "@/lib/templates/resolveSlots";

type SearchParams = { id?: string; watermark?: string };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const id = searchParams.id ?? "demo-coffee";
  const generation = await generationStore.getById(id);
  if (!generation) notFound();

  const current = generation.editedJson ?? generation.outputJson;
  const template = getTemplate(current.selected_template_id);
  if (!template) notFound();

  const slots = await resolveSlots(
    template,
    generation.inputPhotos,
    current.category,
    unsplashPool
  );

  // ?watermark=off to preview the paid-tier look. Defaults to on until session
  // paid-credit lookup lands in step 9.
  const showWatermark = searchParams.watermark !== "off";

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto mb-6 flex max-w-[860px] items-center justify-between px-2">
        <div>
          <h1 className="text-lg font-semibold">{template.label}</h1>
          <p className="text-xs text-gray-500">
            생성 ID · <code>{generation.id}</code> ·{" "}
            {current.category} · 워터마크 {showWatermark ? "ON" : "OFF"}
          </p>
        </div>
        <Link
          href={`/create/preview?id=${generation.id}&watermark=${showWatermark ? "off" : "on"}`}
          className="text-xs text-gray-600 underline"
        >
          워터마크 {showWatermark ? "끄기" : "켜기"}
        </Link>
      </div>

      <div className="mx-auto w-[860px] shadow-sm">
        <TemplateRenderer data={current} slots={slots} showWatermark={showWatermark} />
      </div>

      <div className="mx-auto mt-10 max-w-[860px] px-2 text-xs text-gray-500">
        편집 / 복사 / PNG 다운로드는 Step 6~8에서 활성화됩니다.
      </div>
    </main>
  );
}

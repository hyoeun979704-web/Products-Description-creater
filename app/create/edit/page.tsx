import { notFound } from "next/navigation";
import { loadRenderBundle } from "@/lib/templates/loadRenderBundle";
import { Editor } from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default async function EditPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id ?? "demo-coffee";
  const bundle = await loadRenderBundle(id);
  if (!bundle) notFound();

  return (
    <Editor
      generationId={bundle.generation.id}
      template={bundle.template}
      initialData={bundle.data}
      initialSlots={bundle.slots}
    />
  );
}

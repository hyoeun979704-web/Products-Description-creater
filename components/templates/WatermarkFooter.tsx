/**
 * Free-tier watermark. Rendered inside each SectionCapture so it appears in
 * the exported PNG. Disappears once the session has paid credits.
 */
export function WatermarkFooter() {
  return (
    <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50 py-3 text-[11px] text-gray-500">
      <span className="font-medium text-gray-700">Products Description Creator</span>
      <span>·</span>
      <span>무료 체험판</span>
    </div>
  );
}

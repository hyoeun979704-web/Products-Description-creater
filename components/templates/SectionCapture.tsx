import { forwardRef, type ReactNode } from "react";

type Props = {
  sectionId: string;
  children: ReactNode;
};

/**
 * Fixed 860 px wrapper (Smart Store detail-page width). Step 7 uses these as
 * the html2canvas capture roots — one PNG per section.
 */
export const SectionCapture = forwardRef<HTMLDivElement, Props>(
  function SectionCapture({ sectionId, children }, ref) {
    return (
      <div
        ref={ref}
        data-capture-id={sectionId}
        style={{ width: 860 }}
        className="bg-white"
      >
        {children}
      </div>
    );
  }
);

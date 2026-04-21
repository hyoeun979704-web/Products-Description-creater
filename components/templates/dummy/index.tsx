import type { TemplateProps, TemplateSection } from "../registry";
import { SectionCapture } from "../SectionCapture";
import { WatermarkFooter } from "../WatermarkFooter";
import { DummyHero } from "./Hero";
import { DummyFeatures } from "./Features";
import { DummySpecs } from "./Specs";
import { DummyNotice } from "./Notice";

export const DUMMY_TEMPLATE_DEF = {
  id: "dummy-v1",
  label: "기본 템플릿",
  description: "식음료 기본형 · 히어로 + 특징 2~4개 + 스펙 + 안내",
  sections: ["hero", "features", "specs", "notice"] as const,
  slots: [
    { id: "hero-main", section: "hero", source: "user" },
    { id: "feature-1", section: "features", source: "user-or-unsplash" },
    { id: "feature-2", section: "features", source: "user-or-unsplash" },
    { id: "feature-3", section: "features", source: "unsplash" },
    { id: "feature-4", section: "features", source: "unsplash" },
  ] as const,
  constraints: {
    features: { min: 2, max: 4 },
    specs: { min: 3, max: 6 },
  },
} as const;

export function DummyTemplate({
  data,
  slots,
  showWatermark,
  registerSectionRef,
}: TemplateProps) {
  const heroSlot = slots["hero-main"];
  const featureSlots = data.texts.features.map(
    (_, i) => slots[`feature-${i + 1}`]
  );

  const bindRef = (section: TemplateSection) =>
    registerSectionRef ? (el: HTMLDivElement | null) => registerSectionRef(section, el) : undefined;

  return (
    <div className="space-y-4">
      <SectionCapture sectionId="hero" ref={bindRef("hero")}>
        <DummyHero text={data.texts.hero} slot={heroSlot} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      <SectionCapture sectionId="features" ref={bindRef("features")}>
        <DummyFeatures items={data.texts.features} slots={featureSlots} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      <SectionCapture sectionId="specs" ref={bindRef("specs")}>
        <DummySpecs items={data.texts.specs} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      {data.texts.notice && (
        <SectionCapture sectionId="notice" ref={bindRef("notice")}>
          <DummyNotice text={data.texts.notice} />
          {showWatermark && <WatermarkFooter />}
        </SectionCapture>
      )}
    </div>
  );
}

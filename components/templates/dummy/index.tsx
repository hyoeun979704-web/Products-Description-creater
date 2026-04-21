"use client";

import type { TemplateProps } from "../registry";
import { SectionCapture } from "../SectionCapture";
import { WatermarkFooter } from "../WatermarkFooter";
import { DummyHero } from "./Hero";
import { DummyFeatures } from "./Features";
import { DummySpecs } from "./Specs";
import { DummyNotice } from "./Notice";

export { DUMMY_TEMPLATE_DEF } from "./def";

export function DummyTemplate({
  data,
  slots,
  showWatermark,
  sectionRefs,
}: TemplateProps) {
  const heroSlot = slots["hero-main"];
  const featureSlots = data.texts.features.map(
    (_, i) => slots[`feature-${i + 1}`]
  );

  return (
    <div className="space-y-4">
      <SectionCapture sectionId="hero" ref={sectionRefs?.hero}>
        <DummyHero text={data.texts.hero} slot={heroSlot} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      <SectionCapture sectionId="features" ref={sectionRefs?.features}>
        <DummyFeatures items={data.texts.features} slots={featureSlots} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      <SectionCapture sectionId="specs" ref={sectionRefs?.specs}>
        <DummySpecs items={data.texts.specs} />
        {showWatermark && <WatermarkFooter />}
      </SectionCapture>

      {data.texts.notice && (
        <SectionCapture sectionId="notice" ref={sectionRefs?.notice}>
          <DummyNotice text={data.texts.notice} />
          {showWatermark && <WatermarkFooter />}
        </SectionCapture>
      )}
    </div>
  );
}

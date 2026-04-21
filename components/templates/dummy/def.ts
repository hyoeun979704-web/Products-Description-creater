// Plain metadata for the dummy template. Kept in a non-"use client" file so
// server code (loadRenderBundle, Claude prompt catalog) can read it without
// dragging the React component across the server/client boundary.

export const DUMMY_TEMPLATE_DEF = {
  id: "dummy-v1",
  label: "기본 템플릿",
  description: "식음료 기본형 · 히어로 + 특징 2~4개 + 스펙 + 안내",
  sections: ["hero", "features", "specs", "notice"] as const,
  slots: [
    { id: "hero-main", section: "hero", source: "user", slotHint: "hero" },
    { id: "feature-1", section: "features", source: "user-or-unsplash", slotHint: "feature" },
    { id: "feature-2", section: "features", source: "user-or-unsplash", slotHint: "feature" },
    { id: "feature-3", section: "features", source: "unsplash", slotHint: "feature" },
    { id: "feature-4", section: "features", source: "unsplash", slotHint: "feature" },
  ] as const,
  constraints: {
    features: { min: 2, max: 4 },
    specs: { min: 3, max: 6 },
  },
} as const;

export type PlatformId = "smartstore" | "coupang" | "overseas";

export type Platform = {
  id: PlatformId;
  label: string;
  description: string;
  active: boolean;
};

export const PLATFORMS: Platform[] = [
  {
    id: "smartstore",
    label: "스마트스토어",
    description: "네이버 스마트스토어 · 860px 상세페이지 표준에 맞춰 출력",
    active: true,
  },
  {
    id: "coupang",
    label: "쿠팡",
    description: "쿠팡 아이템위너 기준 (준비중)",
    active: false,
  },
  {
    id: "overseas",
    label: "해외 (Shopify / Amazon)",
    description: "영문 상세페이지 (준비중)",
    active: false,
  },
];

import type { GenerationOutput } from "@/lib/claude/schema";
import type { PlatformId } from "@/lib/platforms/types";
import type { ResolvedSlot } from "@/components/templates/registry";

export type FixtureGeneration = {
  id: string;
  session_id: string;
  platform: PlatformId;
  output_json: GenerationOutput;
  edited_json: GenerationOutput | null;
  image_slots: Record<string, ResolvedSlot>;
  // Photos the user "uploaded" in the dummy flow. A real session uses signed
  // Storage URLs; fixtures use a public Unsplash hotlink for parity of behavior.
  input_photos: {
    url: string;
    width: number;
    height: number;
  }[];
  created_at: string;
};

export const FIXTURE_GENERATIONS: Record<string, FixtureGeneration> = {
  "demo-coffee": {
    id: "demo-coffee",
    session_id: "demo-session",
    platform: "smartstore",
    input_photos: [
      {
        url: "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=1200&q=80",
        width: 1200,
        height: 1600,
      },
    ],
    output_json: {
      category: "beverage",
      selected_template_id: "dummy-v1",
      texts: {
        hero: {
          headline: "산미와 바디감의 균형",
          sub: "에티오피아 예가체프 G1, 라이트 미디엄 로스팅",
        },
        features: [
          {
            title: "스페셜티 등급",
            content: "SCA 84점 이상, 생두 결점두 5% 미만의 최상급 원두만 선별합니다.",
          },
          {
            title: "주간 로스팅",
            content: "주문일 기준 3일 이내 로스팅한 원두만 배송합니다.",
          },
          {
            title: "밀봉 패키지",
            content: "탈기 밸브 부착 패키지로 산소 노출을 최소화했습니다.",
          },
        ],
        specs: [
          { label: "원산지", value: "에티오피아 예가체프" },
          { label: "가공방식", value: "워시드" },
          { label: "로스팅", value: "라이트 미디엄" },
          { label: "중량", value: "200g" },
          { label: "유통기한", value: "로스팅일로부터 12개월" },
        ],
        notice:
          "본 상품은 주문 후 로스팅되며, 로스팅 다음 날 출고됩니다. 그라인딩 옵션은 홀빈 / 에스프레소 / 핸드드립 / 프렌치프레스 중 선택하실 수 있습니다.",
      },
    },
    edited_json: null,
    image_slots: {},
    created_at: new Date().toISOString(),
  },
};

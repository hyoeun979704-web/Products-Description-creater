import type { FeatureItem } from "@/lib/claude/schema";
import type { ResolvedSlot } from "../registry";
import { UnsplashCredit } from "../UnsplashCredit";

type Props = {
  items: FeatureItem[];
  slots: ResolvedSlot[];
};

export function DummyFeatures({ items, slots }: Props) {
  return (
    <div className="bg-white px-10 py-12">
      <h3 className="text-xl font-semibold text-gray-900">상품 특징</h3>
      <div className="mt-6 grid grid-cols-2 gap-6">
        {items.map((item, i) => {
          const slot = slots[i];
          return (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              {slot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slot.url}
                  alt={item.title}
                  crossOrigin="anonymous"
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 w-full bg-gray-100" />
              )}
              {slot?.source === "unsplash" && slot.credit && (
                <UnsplashCredit
                  photographer={slot.credit.photographer}
                  photographerUrl={slot.credit.photographerUrl}
                />
              )}
              <div className="p-5">
                <h4 className="text-base font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

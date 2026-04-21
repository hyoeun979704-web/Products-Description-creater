import type { HeroText } from "@/lib/claude/schema";
import type { ResolvedSlot } from "../registry";
import { UnsplashCredit } from "../UnsplashCredit";

type Props = {
  text: HeroText;
  slot: ResolvedSlot | undefined;
};

export function DummyHero({ text, slot }: Props) {
  return (
    <div className="relative overflow-hidden">
      {slot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.url}
          alt={text.headline}
          crossOrigin="anonymous"
          className="h-[520px] w-full object-cover"
        />
      ) : (
        <div className="h-[520px] w-full bg-gray-100" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent p-10">
        <h2 className="max-w-[60%] text-4xl font-bold leading-tight text-white">
          {text.headline}
        </h2>
        <p className="mt-3 max-w-[60%] text-base text-white/90">{text.sub}</p>
      </div>
      {slot?.source === "unsplash" && slot.credit && (
        <UnsplashCredit
          photographer={slot.credit.photographer}
          photographerUrl={slot.credit.photographerUrl}
        />
      )}
    </div>
  );
}

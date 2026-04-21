type Props = {
  photographer: string;
  photographerUrl: string;
};

/** Unsplash TOS: photographer credit must be visible. Renders inside the
 * captured DOM so it bakes into the exported PNG. */
export function UnsplashCredit({ photographer, photographerUrl }: Props) {
  return (
    <div className="px-2 py-1 text-[10px] leading-tight text-gray-500">
      Photo by{" "}
      <a href={photographerUrl} className="underline">
        {photographer}
      </a>{" "}
      on{" "}
      <a href="https://unsplash.com" className="underline">
        Unsplash
      </a>
    </div>
  );
}

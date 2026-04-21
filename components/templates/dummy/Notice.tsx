type Props = {
  text: string;
};

export function DummyNotice({ text }: Props) {
  if (!text) return null;
  return (
    <div className="bg-white px-10 py-10">
      <h3 className="text-xl font-semibold text-gray-900">구매 전 안내</h3>
      <div className="mt-4 rounded-lg bg-gray-50 p-5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

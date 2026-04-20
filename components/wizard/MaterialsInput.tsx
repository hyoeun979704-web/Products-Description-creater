"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function MaterialsInput({ value, onChange }: Props) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder={"예) 국내산 유기농 밀가루, 프랑스산 버터,\n저온 숙성 24시간, 무방부제"}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-gray-900 focus:outline-none"
        maxLength={500}
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {value.length} / 500
      </p>
    </div>
  );
}

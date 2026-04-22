"use client";

import { LabeledTextarea } from "@/components/editor/fields";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function MaterialsInput({ value, onChange }: Props) {
  return (
    <LabeledTextarea
      value={value}
      onChange={onChange}
      placeholder={"예) 국내산 유기농 밀가루, 프랑스산 버터,\n저온 숙성 24시간, 무방부제"}
      rows={6}
      max={500}
    />
  );
}

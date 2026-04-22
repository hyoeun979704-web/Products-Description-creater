"use client";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
};

export function LabeledInput({ label, value, onChange, placeholder, max }: LabeledInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={max}
        className={inputClass}
      />
      {typeof max === "number" && (
        <span className="mt-0.5 block text-right text-[10px] text-gray-400">
          {value.length} / {max}
        </span>
      )}
    </label>
  );
}

type LabeledTextareaProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  max?: number;
};

export function LabeledTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  max,
}: LabeledTextareaProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={max}
        className={inputClass}
      />
      {typeof max === "number" && (
        <span className="mt-0.5 block text-right text-[10px] text-gray-400">
          {value.length} / {max}
        </span>
      )}
    </label>
  );
}

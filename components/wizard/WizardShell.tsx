"use client";

type Props = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function WizardShell({
  step,
  total,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {Array.from({ length: total }).map((_, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={n} className="flex items-center gap-2">
                <span
                  className={
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] " +
                    (active
                      ? "bg-gray-900 text-white"
                      : done
                        ? "bg-gray-400 text-white"
                        : "bg-gray-100 text-gray-500")
                  }
                >
                  {n}
                </span>
                {n < total && <span className="h-px w-8 bg-gray-200" />}
              </div>
            );
          })}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            ← 이전
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}

      <div className="mt-8 flex-1">{children}</div>

      {footer && <div className="mt-10 flex justify-end gap-3">{footer}</div>}
    </div>
  );
}

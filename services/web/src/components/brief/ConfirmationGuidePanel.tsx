import { cn } from "../../lib/utils";

type Props = {
  hints: string[];
  variant?: "hero" | "compact";
  className?: string;
};

export default function ConfirmationGuidePanel({
  hints,
  variant = "hero",
  className,
}: Props) {
  if (hints.length === 0) return null;

  const hero = variant === "hero";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-sky-500 bg-gradient-to-br from-sky-50 via-white to-teal-50 shadow-lg",
        hero ? "p-6 md:p-8" : "p-4",
        className,
      )}
      data-testid="confirmation-guide"
      aria-labelledby="confirmation-guide-title"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-200/40 blur-2xl"
        aria-hidden
      />
      <div className="relative">
        <p className="mb-2 inline-flex rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold tracking-wide text-white">
          ナカナオリの整理
        </p>
        <h2
          id="confirmation-guide-title"
          className={cn(
            "font-bold text-sky-950",
            hero ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          確認の進め方
        </h2>
        <p
          className={cn(
            "mt-2 text-sky-900/90",
            hero ? "text-base leading-relaxed md:text-lg" : "text-sm",
          )}
        >
          裁くための結論ではありません。先生が真相に近づくための、具体的な確認ステップです。
        </p>
        <ol
          className={cn(
            "mt-5 space-y-3",
            hero ? "text-base md:text-lg" : "text-sm",
          )}
        >
          {hints.map((hint, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-sky-200/80 bg-white/90 px-4 py-3 shadow-sm"
            >
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full bg-sky-600 font-bold text-white",
                  hero ? "h-8 w-8 text-sm" : "h-6 w-6 text-xs",
                )}
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="leading-relaxed text-slate-800">{hint}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-sky-800/80 md:text-sm">
          最終的な判断は先生が行います。
        </p>
      </div>
    </section>
  );
}

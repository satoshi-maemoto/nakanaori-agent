import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type Props = {
  title: string;
  variant?: "child" | "teacher" | "home";
  largeTitle?: boolean;
  children: ReactNode;
};

export default function AppShell({ title, variant = "home", largeTitle, children }: Props) {
  const bg =
    variant === "child"
      ? "bg-gradient-to-b from-sky-50 to-slate-50"
      : variant === "teacher"
        ? "bg-slate-100"
        : "bg-gradient-to-br from-slate-50 to-sky-50";

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-semibold text-slate-800 hover:text-sky-700">
            ナカナオリ
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/child" className="text-slate-600 hover:text-sky-700">
              子ども用
            </Link>
            <Link to="/teacher" className="text-slate-600 hover:text-sky-700">
              先生用
            </Link>
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto px-4 py-6", variant === "child" ? "max-w-6xl" : "max-w-5xl")}>
        <h1
          className={cn(
            "mb-2 font-bold text-slate-900",
            largeTitle ? "text-3xl md:text-4xl" : "text-2xl",
          )}
        >
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}

export function AiDisclaimerBanner({ text }: { text: string }) {
  return (
    <div className="sticky top-0 z-10 mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 shadow-sm">
      {text}
    </div>
  );
}

// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { cn } from "../../lib/utils";

type Props = { active?: boolean; done?: boolean; label: string; large?: boolean };

export function TurnProgress({ active, done, label, large }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full font-medium",
        large ? "px-4 py-2 text-base" : "px-3 py-1 text-xs",
        done && "bg-emerald-100 text-emerald-800",
        active && !done && "bg-sky-100 text-sky-800 ring-2 ring-sky-400",
        !active && !done && "bg-slate-100 text-slate-500",
      )}
    >
      <span className={cn("rounded-full bg-current opacity-70", large ? "h-2.5 w-2.5" : "h-2 w-2")} />
      {label}
    </div>
  );
}

type BarProps = {
  childALabel: string;
  childBLabel: string;
  state: string;
  size?: "default" | "large";
};

export function TurnProgressBar({ childALabel, childBLabel, state, size = "default" }: BarProps) {
  const aDone = !["listening_a"].includes(state);
  const bActive = state === "listening_b";
  const bDone = ["structuring", "ready_for_teacher", "escalated", "closed"].includes(state);
  const large = size === "large";

  return (
    <div className="flex flex-wrap gap-2">
      <TurnProgress
        label={childALabel}
        active={state === "listening_a"}
        done={aDone}
        large={large}
      />
      <TurnProgress
        label={childBLabel}
        active={bActive}
        done={bDone}
        large={large}
      />
    </div>
  );
}

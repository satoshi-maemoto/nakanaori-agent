// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import type { AvatarGender } from "./model-config";
import { childCopy } from "../lib/child-copy";
import { cn } from "../lib/utils";

type Props = {
  value: AvatarGender;
  onChange: (g: AvatarGender) => void;
  disabled?: boolean;
  size?: "default" | "large";
};

export default function AvatarGenderPicker({ value, onChange, disabled, size = "default" }: Props) {
  const large = size === "large";
  return (
    <div className="flex gap-3" role="group" aria-label={childCopy.genderLabel}>
      {(["female", "male"] as const).map((g) => (
        <button
          key={g}
          type="button"
          disabled={disabled}
          onClick={() => onChange(g)}
          className={cn(
            "flex-1 rounded-xl border-2 font-medium transition-colors",
            large ? "px-4 py-4 text-lg" : "px-4 py-3 text-sm",
            value === g
              ? "border-sky-500 bg-sky-50 text-sky-900"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            disabled && "opacity-50",
          )}
        >
          {g === "female" ? childCopy.genderFemale : childCopy.genderMale}
        </button>
      ))}
    </div>
  );
}

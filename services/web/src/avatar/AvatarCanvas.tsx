// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import type { AvatarGender } from "./model-config";
import { FALLBACK_AVATAR } from "./model-config";
import { useVrmAvatar } from "./useVrmAvatar";

type Props = {
  gender: AvatarGender;
  speaking?: boolean;
  className?: string;
};

export default function AvatarCanvas({ gender, speaking = false, className = "" }: Props) {
  const { canvasRef, useFallback, loading } = useVrmAvatar(gender, speaking);

  if (useFallback) {
    return (
      <img
        src={FALLBACK_AVATAR[gender]}
        alt="話を聞くロボット"
        className={`h-full w-full object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`relative h-full w-full min-h-[240px] ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="話を聞くロボット（3D）"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-slate-500">
          3Dモデル読み込み中…
        </div>
      )}
    </div>
  );
}

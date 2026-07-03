// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

export type AvatarGender = "male" | "female";

/** CharaTomo-Web `getVRMModelUrl()` と同じファイル名 */
export const VRM_MODELS: Record<AvatarGender, string> = {
  male: "/models/8329890252317737768.glb",
  female: "/models/8590256991748008892.glb",
};

export function getVrmModelUrl(gender: AvatarGender): string {
  return VRM_MODELS[gender];
}

export const FALLBACK_AVATAR: Record<AvatarGender, string> = {
  male: "/images/avatar-male.svg",
  female: "/images/avatar-female.svg",
};

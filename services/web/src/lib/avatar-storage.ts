import type { AvatarGender } from "../avatar/model-config";

const KEY = "nakanaori.avatar.gender";

export function loadAvatarGender(): AvatarGender {
  const v = localStorage.getItem(KEY);
  if (v === "male" || v === "female") return v;
  return "female";
}

export function saveAvatarGender(gender: AvatarGender) {
  localStorage.setItem(KEY, gender);
}

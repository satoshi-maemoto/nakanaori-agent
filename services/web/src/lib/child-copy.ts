/** 小学低学年向け UI 文言（やさしい漢字 + ひらがな） */
export const childCopy = {
  pageTitle: "はなしを きいてくれる ロボット",
  subtitle: "あんしんして はなしてね。",
  genderLabel: "ロボットの みかた",
  genderFemale: "おんなの ロボット",
  genderMale: "おとこの ロボット",
  startButton: "はじめる",
  inputPlaceholder: "はなしたい ことを かいて…",
  sendButton: "おくる",
  nextTurnButton: "つぎの ばん",
  sessionStartMessage: "はなしを はじめるよ。 かいてね。",
  turnNow: (name: string) => `いま: ${name} の ばん`,
  escalateBanner: "せんせいを よんでね。 ここで まってて。",
  escalateSystem: "だいじょうぶ？ せんせいを よぶね。",
  loadingAvatar: "よみこみちゅう…",
  robotLabel: "ロボット",
} as const;

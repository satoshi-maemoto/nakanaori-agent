// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

/** 小学低学年向け UI 文言（やさしい漢字 + ひらがな） */
export const childCopy = {
  pageTitle: "はなしを きいてくれる ロボット",
  subtitle: "1回め、2回め の ばん。 2人 話したら せんせい へ",
  flowTitle: "ながれ",
  flowCollapsedHint: "タップで ひらく",
  flowClose: "とじる",
  flowSteps: [
    "① なまえ を 教える",
    "② きょうの こと を 話す（マイク でも かいて でも よい）",
    "③ 「番を おわる」→ もう いい？ と 聞く",
    "④ 2人 終わったら せんせいに 相談",
  ] as const,
  genderLabel: "ロボットの みかた",
  genderFemale: "おんなの ロボット",
  genderMale: "おとこの ロボット",
  startButton: "はじめる",
  inputPlaceholder: "はなしたい ことを かいて…",
  voiceButton: "はなす",
  voiceButtonListening: "きいてる…",
  voiceButtonTitle: "マイクで はなす",
  voiceUnsupported: "この ブラウザでは マイクが 使えません。文字で かいてね。",
  voicePermissionDenied: "マイクを 使う きょかが ひつようです。",
  voiceNoSpeech: "こえが 聞こえませんでした。もう一度 ためしてね。",
  voiceNetwork:
    "音声の 認識に つながれませんでした。Chrome や Safari で ひらき直すか、文字で かいてね。",
  voiceError: "音声が 聞き取れませんでした。もう一度 ためしてね。",
  sendButton: "おくる",
  sendHint: "「おくる」= つづけて 話す · マイク でも はなせる",
  finishTurnButton: "番を おわる",
  confirmFinish: (name: string, isLast: boolean) =>
    isLast
      ? `${name} さん、話したいことは もう ない？\nおわったら せんせいに 相談 するよ。`
      : `${name} さん、もう おわって いい？\nおわったら つぎの 子の ばん だよ。`,
  confirmYes: "おわり",
  confirmNo: "まだ 話す",
  robotName: "ナカナオリ",
  turnNow: (name: string, childId: "a" | "b") =>
    `いま: ${name} の ばん（${childId === "a" ? "1回め" : "2回め"}）`,
  completeBanner: "おつかれさま！ せんせいの ところへ 行って 相談してね。",
  completeSub: "ロボットは 先生に 伝える 準備を したよ。",
  escalateBanner: "せんせいを よんでね。 ここで まってて。",
  escalateSystem: "だいじょうぶ？ せんせいを よぶね。",
  loadingAvatar: "よみこみちゅう…",
} as const;

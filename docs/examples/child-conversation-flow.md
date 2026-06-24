# 子ども会話フロー — わかりやすいながれ

小学低学年向け。**1回め・2回め の ばん** で、2人 話したら **先生に 相談** する流れです。

---

## 全体の流れ

```mermaid
flowchart TD
    Start([はじめる]) --> Welcome[ロボット: ルール説明 + なまえ]
    Welcome --> TurnA[子どもA の 1回めの ばん]
    TurnA --> SendA[おくる で 話を つづける]
    SendA --> SendA
    TurnA --> ConfirmA[番を おわる]
    ConfirmA --> AskA{もう おわって いい？}
    AskA -->|まだ 話す| TurnA
    AskA -->|おわり| TurnB[子どもB の 2回めの ばん]
    TurnB --> SendB[おくる で 話を つづける]
    SendB --> SendB
    TurnB --> ConfirmB[番を おわる]
    ConfirmB --> AskB{話したいこと もう ない？}
    AskB -->|まだ 話す| TurnB
    AskB -->|おわり| Teacher[せんせいに 相談 してね]
    Teacher --> End([終了])
```

---

## 各ステップ

| 段階 | 子どもが すること | ロボット / 画面 |
|------|-------------------|-----------------|
| 開始前 | 「はじめる」を 押す | ながれ 4ステップを 表示 |
| 最初 | なまえを 送る | 「1回め / 2回め の ばん」と 説明 |
| 話す | 「おくる」で 話を つづける | 聞き役（裁かない） |
| 番を 終える | 「番を おわる」を 押す | 「もう おわって いい？」と 確認 |
| A → B | 確認で「おわり」 | つぎの 子に 挨拶 |
| 最後（B） | 確認で「おわり」 | 「せんせいに 相談してね」で 終了 |

---

## ボタンの意味

| ボタン | 意味 |
|--------|------|
| **おくる** | いまの 番の なかで、話を 1つ 追加する |
| **番を おわる** | いまの 子の ばんを 終える（確認 あり） |
| **まだ 話す** | 確認を やめて、話を つづける |
| **おわり** | 本当に 番を 終える |

---

## デモ台本

消しゴムの 例は [eraser-story-dialogue.md](./eraser-story-dialogue.md) を 参照。

---

## 画面レイアウト（ENH-UI-05）

| 条件 | 挙動 |
|------|------|
| セッション前 | 「ながれ」4 ステップを 常時表示 |
| 子ども 2 発話後 | 「ながれ」を 折りたたみ（モバイル）、アバター高さを 縮小 |
| B 終了後 | 入力不可 + 「せんせいに 相談」バナー |
| ウィンドウ / 1↔2 列 | VRM `resetLayout` — aspect 同期、カメラは読込時位置を 復元 |

---

## 実装参照

| 領域 | ファイル |
|------|----------|
| ロボット文言 | `packages/agents/src/agents/child-navigator.ts` |
| 確認 UI | `services/web/src/child/ChildView.tsx` |
| UI 文言 | `services/web/src/lib/child-copy.ts` |
| VRM レイアウト同期 | `services/web/src/avatar/VrmViewer.ts`, `useVrmAvatar.ts` |
| AI-DLC 要件 | `aidlc-docs/construction/unit-web-ui/enhancements/child-turn-flow/requirements.md` |

---

## Kebbi 版（音声のみ・ボタンなし）

Web の「番を おわる」ボタンに相当する操作を **音声** で行う。

```mermaid
flowchart TD
    Welcome[ウェルカム後] --> OfferArm[腕を前に出す]
    OfferArm --> HandPrompt["この手を にぎって 話しても いいよ"]
    HandPrompt --> Talk[子どもが話す]
    Talk --> Talk
    Talk --> FinishIntent["話し終わった 等"]
    FinishIntent --> HeadPetPrompt["おわったら あたまを なでてね"]
    HeadPetPrompt --> HeadPet[頭をなでる]
    HeadPet --> NextChild[つぎの 子 / 先生へ]
```

| 段階 | 子ども（音声） | Kebbi |
|------|----------------|-------|
| 話す | 自由に発話 | ASR → `child-turn` |
| 番を終えたい | 「話し終わった」「おわった」等 | 「あたまを なでてね」TTS |
| 番を変える | **頭をなでる**（センサー） | `finish_turn: true` |
| まだ話す | 「まだ」「まだ話す」 | 聞き続け |

設定画面は **胸タップ**。頭の長押しはセッション再試行。

実装: `nakanaori-kebbi` の `TurnVoiceController.kt`, `KebbiHandPresence.kt`

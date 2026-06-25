# ENH-KEBBI-03 — 手のふれあい中の聞き取りポーズ

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-KEBBI-03 |
| **ユニット** | `unit-kebbi-client` |
| **状態** | ✅ 完了（2026-06-21） |
| **関連** | ENH-KEBBI-02（手の案内・ハンドオフ） |

## 背景

子B 番で「この手を にぎって 話しても いいよ。」のあと、手を長押しして話す UX では、ロボットが **差し出した手の方向を向き、聞いている様子** を示すと子どもが話しやすい。手を離したら中立ポーズに戻す。

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-HH-01 | 手長押し開始で首を差し出し腕側へ傾ける（RIGHT → 負 Z、LEFT → 正 Z） | ✅ |
| AC-HH-02 | 聞き取り中は固定スマイル + 首の subtle random walk | ✅ |
| AC-HH-03 | 手を離したら `resetNeckToCenter()` + 通常の顔表情 | ✅ |

## 実装ファイル

| パス | 内容 |
|------|------|
| `nakanaori-kebbi/.../NuwaSpeechHelper.kt` | `startHandHoldListening(arm)`, `dispatchHandRelease` |

## ユーザー向けドキュメント

- [kebbi-dev-guide.md](../../../../../docs/kebbi-dev-guide.md#手のふれあい)
- [child-conversation-flow.md](../../../../../docs/examples/child-conversation-flow.md)

## 検証

- Kebbi 実機: 子B 番 → 腕提示 → 手長押し → 首が手側へ傾く → 離すと中央・通常顔

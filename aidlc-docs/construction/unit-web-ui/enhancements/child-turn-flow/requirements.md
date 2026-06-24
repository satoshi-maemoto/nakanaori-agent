# ENH-UI-05 — 子ども番終了確認 + レイアウト連動 VRM

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-UI-05 |
| **ユニット** | `unit-web-ui` + `unit-agent-core` |
| **種別** | Enhancement |
| **状態** | ✅ 完了（2026-06-21） |
| **関連コミット** | `1fed48b`（会話フロー）+ VRM `resetLayout`（未コミット） |

## 背景

- 低学年向けに **1回め / 2回め の ばん** と **先生相談** までの流れを UI で明示する必要があった
- 「つぎの ばん」だけでは、話し終えたかどうか子どもが判断しづらい
- 1 列 / 2 列レイアウト切替やアバター領域縮小時に VRM の aspect と canvas バッファがずれる問題があった

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-TURN-01 | ウェルカムで 1回め・2回め の順番を説明 | ✅ |
| AC-TURN-02 | 名前受取後「番を おわる」ボタンを案内 | ✅ |
| AC-TURN-03 | 「番を おわる」→ 確認パネル（おわり / まだ 話す） | ✅ |
| AC-TURN-04 | B 終了後「せんせいに 相談」バナー | ✅ |
| AC-TURN-05 | 子ども 2 発話後「ながれ」を折りたたみ、アバター領域を縮小 | ✅ |
| AC-TURN-06 | FactStructurer が Gemini 平坦 JSON でも teacher dashboard 用に復元 | ✅ |
| AC-VRM-11 | レイアウト変更時 `resetLayout` で aspect + 読込時カメラ位置を復元 | ✅ |
| AC-VRM-12 | カメラ距離は読込時固定（`max(size.y * 0.45, 0.75)`）— 再計算で縮小しない | ✅ |

## 実装ファイル

| パス | 変更内容 |
|------|----------|
| `packages/agents/src/agents/child-navigator.ts` | `turnOrdinalLabel`, 番終了・先生相談メッセージ |
| `services/web/src/lib/child-copy.ts` | ながれ 4 ステップ、確認・完了文言 |
| `services/web/src/child/ChildView.tsx` | 確認 UI、完了バナー、flowCompact |
| `services/web/src/avatar/VrmViewer.ts` | `resetLayout()` |
| `services/web/src/avatar/useVrmAvatar.ts` | ResizeObserver + ブレークポイント監視 |
| `packages/agents/src/agents/fact-structurer.ts` | JSON 修復・coalesce |
| `docs/examples/child-conversation-flow.md` | ユーザー向けフロー図 |

## ユーザー向けドキュメント

- [child-conversation-flow.md](../../../../../docs/examples/child-conversation-flow.md)
- [demo-scenario.md](../../../../../docs/demo-scenario.md)
- [eraser-story-dialogue.md](../../../../../docs/examples/eraser-story-dialogue.md)

## 検証

- 手動: `/child` → はじめる → 番を おわる 確認 → B 完了 → 先生相談バナー
- 手動: ウィンドウ幅 1024px 前後でアバター表示サイズが読込時と同等
- 自動: `npm run build`；`scripts/verify-browser.mjs`

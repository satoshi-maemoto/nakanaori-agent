# ENH-KEBBI-02 — クライアントチャネル + 子B 番交代 UX

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-KEBBI-02 |
| **ユニット** | `unit-agent-core` + `unit-api` + `unit-kebbi-client` + `unit-tts-service` |
| **種別** | Enhancement |
| **状態** | ✅ 完了（2026-06-21） |
| **関連** | ENH-UI-05（Web 番終了確認）、ENH-KEBBI-01（TTS） |

## 背景

- Web と Kebbi で **番の終わり方** が異なる（ボタン vs 頭なで）が、`ChildNavigatorAgent` が同一文案を返していた
- Kebbi 子B 番: ハンドオフ挨拶・手の案内 TTS が遅延 / 無音 / ロボTTS フォールバック
- TTS 合成を ViewModel イベント前に待つと UI がブロックされる

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-CLI-01 | `POST /v1/sessions` が `client: "web" \| "kebbi"` を受け付ける | ✅ |
| AC-CLI-02 | セッションに `client_channel` を保存し、名前登録後案内に反映 | ✅ |
| AC-CLI-03 | Web: 「話し終わったら、『番を おわる』を おしてね。」 | ✅ |
| AC-CLI-04 | Kebbi: 「話し終わったら、あたまを なでてね。」（`client: kebbi` 必須） | ✅ |
| AC-CLI-05 | Kebbi `NakanaoriApi.createSession()` が `"client": "kebbi"` を送る | ✅ |
| AC-TTS-01 | Kebbi TTS は `profile: kebbi_child`（Web `gender` と独立） | ✅ |
| AC-KUX-01 | 子B ハンドオフ: `TurnHandoff` を TTS 完了前に emit | ✅ |
| AC-KUX-02 | 手の案内 TTS を挨拶再生中に prefetch / キャッシュ | ✅ |
| AC-KUX-03 | 頭なでで ASR 停止 → `finish_turn: true` | ✅ |

## 実装ファイル

| パス | 変更内容 |
|------|----------|
| `packages/agents/src/orchestrator.ts` | `ClientChannel`, `SessionState.client_channel` |
| `packages/agents/src/index.ts` | `createSession(..., clientChannel)`, `afterNameReceived` に channel 渡し |
| `packages/agents/src/agents/child-navigator.ts` | `finishTurnHint()`, channel 別案内 |
| `services/api/src/app.ts` | `POST /v1/sessions` の `client` パース |
| `clients/kebbi/api-contract.md` | `client` フィールド + クライアント別コピー表 |
| `packages/tts/src/voice-config.ts` | `kebbi_child` プロファイル |
| `nakanaori-kebbi/.../NakanaoriApi.kt` | `"client": "kebbi"` |
| `nakanaori-kebbi/.../NakanaoriViewModel.kt` | TTS キャッシュ、`synthesizeForPlayback` |
| `nakanaori-kebbi/.../MainActivity.kt` | ハンドオフ即時 emit、prefetch、頭なで ASR 停止 |

## ユーザー向けドキュメント

- [child-conversation-flow.md](../../../../../docs/examples/child-conversation-flow.md#web-と-kebbi--番の終わり方)
- [kebbi-dev-guide.md](../../../../../docs/kebbi-dev-guide.md)
- [api-contract.md](../../../../../clients/kebbi/api-contract.md)

## 検証

- Web `/child`: 名前登録後 TTS/文言に「番を おわる」、頭なで案内なし
- Kebbi 実機: `"client": "kebbi"` で「あたまを なでてね」；子B ハンドオフ → 腕 → 手案内 → ASR
- 自動: `child-navigator.test.ts`, `workflow.test.ts`

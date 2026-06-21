# Kebbi クライアント（Sibling リポジトリ）

Nuwa Kebbi Android クライアントは**このリポジトリには実装されていません**。

## Sibling リポジトリ

- **GitHub**: [SystemFriend/AIxR-CharaTomo-Kebbi](https://github.com/SystemFriend/AIxR-CharaTomo-Kebbi)
- **ローカルパス**: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi`

## 連携方針

1. Nakanaori は**セッションベース REST API**を使用（この repo の `services/api/`）
2. CharaTomo `POST /api/v1/llm/chat` は**使用しない** — 仲介ワークフローは一般チャットと異なる
3. CharaTomo-Kebbi から参照するもの:
   - Nuwa TTS / ASR パターン（`NuwaSpeechHelper`、再生とマイクの協調）
   - HTTP クライアントパターン（`ChatApi.kt`、`VoiceApi.kt`）
   - 発話中のロボット表情アニメーション

## 同期ポリシー

API 契約（`clients/kebbi/api-contract.md`）を変更する場合:

1. この repo の API ルートとスキーマを更新
2. `AIxR-CharaTomo-Kebbi` を開き `NakanaoriApi.kt`（または同等）を実装・適応
3. Kebbi エージェント向けノートは `AIxR-CharaTomo-Kebbi/AGENTS.md` を参照

## Phase 2: 音声

- Google Cloud Speech API または Kebbi Nuwa SDK 経由の STT/TTS
- 追加時は `api-contract.md` に契約拡張を文書化

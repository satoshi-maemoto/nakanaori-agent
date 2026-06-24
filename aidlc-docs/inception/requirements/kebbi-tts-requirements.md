# Kebbi + TTS — 要件（ENH-KEBBI-01）

## 概要

Nuwa Kebbi 向け Android クライアント（private repo `nakanaori-kebbi`）と、Google Cloud TTS 合成 API（monorepo `packages/tts`）を追加する。

## 機能要件

| ID | 要件 |
|----|------|
| FR-K01 | Kebbi が Nakanaori `/v1/sessions/*` で仲介セッションを実行（CharaTomo chat 禁止） |
| FR-K02 | Nuwa クラウド ASR で子ども発話を取得し `child-turn` に送信 |
| FR-K03 | `agent_message` / `welcome_message` を Google Cloud TTS で再生 |
| FR-K04 | TTS 再生中はマイク停止；終了後 500ms で ASR 再開 |
| FR-K05 | TTS 合成失敗時 Nuwa ロボット TTS にフォールバック |
| FR-K06 | アバター・性別選択 UI なし；中性的 1 声固定 |
| FR-T01 | `POST /v1/tts/synthesize` — MP3 data URI を返す |
| FR-T02 | テキスト前処理（絵文字除去、選択肢マーカー、助詞 へ→え） |
| FR-T03 | Web クライアントからも同一 TTS API を利用可能 |

## 非機能要件

- MVP 認証なし（既存セッション API と同様）
- `GOOGLE_APPLICATION_CREDENTIALS` または inline JSON
- 合成 ~2s 以内目標
- 裁きラベルを TTS に含めない（プロダクトルール）

## スコープ外

- API 側 STT エンドポイント
- Azure / Polly TTS
- Kebbi コードの monorepo 内配置

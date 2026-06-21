# Functional Design 計画 — unit-web-ui

## チェックリスト

- [x] CharaTomo-Web `vrm-viewer.js` の API 表面を調査し移植範囲を確定
- [x] `ChildView` / `TeacherView` の現行 gap を screen-inventory に反映
- [x] US-01, US-04, US-05 の受け入れ基準を UI 要件にトレース
- [x] Kebbi とのキャラクタートーン整合を unit-overview / ux-principles に追記
- [x] `screen-inventory.md` を生成
- [x] `component-catalog.md` を生成
- [x] `vrm-integration.md` を生成
- [x] `ux-principles.md` を生成
- [x] 人間による Functional Design 承認（2026-06-21）

## 目的

UI/UX ブラッシュアップと VRM 黒子アバターの機能設計を定義する。

## 成果物

- [x] `functional-design/screen-inventory.md` — 画面・状態遷移
- [x] `functional-design/component-catalog.md` — 共通コンポーネント + AvatarCanvas
- [x] `functional-design/vrm-integration.md` — CharaTomo-Web 準拠の VRM 設計
- [x] `functional-design/ux-principles.md` — ペルソナ別原則（裁かない・黒子）

## 確認事項（Functional Design 前）

| # | 質問 | 選択肢 | 推奨 |
|---|------|--------|------|
| Q1 | CSS 方針 | A) Tailwind + shadcn / B) CSS Modules / C) 現状 CSS 拡張 | A |
| Q2 | VRM モデル | A) CharaTomo 既存モデル流用 / B) 新規黒子専用 .vrm / C) プレースホルダー | A + 男女選択 |
| Q3 | アバター配置（子ども画面） | A) 左固定 + 右チャット / B) 上アバター + 下チャット / C) 全画面アバター背景 | A |

### Q1: CSS 方針

- [A] Tailwind CSS + shadcn/ui
- [B] CSS Modules
- [C] 現状 `index.css` 拡張

[Answer]:A — Tailwind + shadcn/ui。デザイントークンと BriefCard / ChatBubble を shadcn ベースで構築

### Q2: VRM モデル

- [A] CharaTomo 既存モデル流用
- [B] 新規黒子専用 .vrm
- [C] プレースホルダー

[Answer]:A — CharaTomo-Web `getVRMModelUrl()` と同系の男女 GLB/VRM を流用。**男性モデルと女性モデルを UI で選択可能**（セッション開始前または設定から切替）。参照: `8329890252317737768.glb`（male）、`8590256991748008892.glb`（female）

### Q3: アバター配置（子ども画面）

- [A] 左固定 + 右チャット
- [B] 上アバター + 下チャット
- [C] 全画面アバター背景

[Answer]:A — 左 40% アバター、右 60% チャット（タブレット横画面想定）。モバイル縦は上アバター小 + 下チャットにレスポンシブ折返

## 承認

Functional Design 成果物 — ユーザー承認済み（2026-06-21）。Q2 は A + 男女モデル選択。

## 承認後

NFR Requirements（バンドルサイズ、WebGL フォールバック）→ Code Generation

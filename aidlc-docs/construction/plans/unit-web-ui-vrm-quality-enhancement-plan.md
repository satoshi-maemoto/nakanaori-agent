# Code Generation 計画 — unit-web-ui ENH-UI-01 VRM 品質

## チェックリスト

- [x] Minimal Requirements を `enhancements/vrm-quality/requirements.md` に記録
- [x] `vrm-integration.md` に実装仕様を追記（Enhancement セクション）
- [x] GLB セットアップ: `scripts/setup-vrm-models.sh` + `dev-stack` 自動実行
- [x] `VrmViewer.ts` — 自然腕ポーズ + idle 首 + 瞬き + ライト + SpringBone warmup
- [x] LookAt 無効化 + 目ボーン固定
- [x] モデル全体回転 sway を削除、`lockTransform()` でバストアップ固定
- [x] `useVrmAvatar` / `AvatarCanvas` — loading 中 warmup 完了待ち
- [x] `npm run build` 成功
- [x] `aidlc-state.md` / `audit.md` 更新

## 目的

初回 Code Generation の VRM 表示を、CharaTomo 同等の**自然な立ち姿・人間らしい idle・明るいライティング**まで仕上げる。

## 成果物

- [x] `enhancements/vrm-quality/requirements.md`
- [x] `enhancements/vrm-quality/implementation-summary.md`
- [x] `functional-design/vrm-integration.md`（Enhancement 追記）
- [x] `services/web/src/avatar/VrmViewer.ts`（実装済み）

## 承認

Enhancement — ユーザー指示に基づき実装完了後にドキュメント化（2026-06-21）。

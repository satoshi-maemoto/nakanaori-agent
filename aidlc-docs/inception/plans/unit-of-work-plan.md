# 作業ユニット計画

## 分解チェックリスト

- [x] 要件・ストーリー・Application Design からユニット境界を分析
- [x] ユニットグルーピング戦略と依存関係を定義
- [x] `aidlc-docs/inception/application-design/unit-of-work.md` を生成
- [x] `aidlc-docs/inception/application-design/unit-of-work-dependency.md` を生成
- [x] `aidlc-docs/inception/application-design/unit-of-work-story-map.md` を生成
- [x] `unit-of-work.md` に greenfield コード構成戦略を記載
- [x] ユニット境界と依存関係を検証
- [x] 全ストーリーをユニットに割り当て
- [x] ユニット計画のユーザー承認（Inception 続行要求により暗黙承認）

## 分解質問

### Q1: ストーリーのグルーピング戦略は？

- [A] 技術レイヤー別（agents / API / clients / devops）
- [B] ユーザージャーニー別（子ども経路 / 先生経路 / エスカレーション経路）
- [C] ハイブリッド — コアバックエンドはレイヤー別、クライアントは別ユニット

[Answer]:C

### Q2: Web の先生と子どもは1ユニットか2ユニットか？

- [A] 単一 `unit-web`（1 Vite アプリ、共有ビルド）
- [B] `unit-web-teacher` と `unit-web-child` を分離（同一 repo、Construction 追跡は別）

[Answer]:B — `services/web/` の同一 Vite アプリ；ストーリーマッピングと Construction 並行作業のため2ユニットで追跡

### Q3: Kebbi 実装の境界は？

- [A] Kebbi Android コードをこの monorepo に含める
- [B] 契約 + API はこの repo；Android クライアントは sibling repo のみ

[Answer]:B

### Q4: Construction スケジュール上のデモクライアント優先度は？

- [A] Web 優先、Kebbi は後
- [B] Kebbi 優先、Web は後
- [C] 同一優先度 — ハッカソンデモに両方必須；unit-api 完了後に並行

[Answer]:C

### Q5: セッションストアのユニット所有権は？

- [A] unit-api の一部（現行 MVP in-memory ストア）
- [B] 別 unit-session-store

[Answer]:A — in-memory ストアは MVP では `services/api/` に残す；Firestore 移行は将来の unit-api 作業

### Q6: MVP のデプロイ workflow スコープは？

- [A] API のみ（現行 deploy-staging.yml）
- [B] API + web を別 Cloud Run サービス（Q1=B デプロイ決定と一致）

[Answer]:B

## 承認

作業ユニット計画完了。Inception 続行の一部として承認（2026-06-21）。

# 要件検証質問

以下の各 `[Answer]:` を記入してください。すべて回答が揃うまで AI-DLC は Construction に進みません。

## デプロイ・環境

### Q1: ハッカソンデモの主要デプロイ先は？

- [A] Cloud Run のみ（API + 静的 Web を同一サービス）
- [B] Cloud Run API + 別 Cloud Run web サービス
- [C] Cloud Run API + Firebase Hosting（Web）

[Answer]:B

### Q2: GCP プロジェクトとリージョンの希望は？

- [A] asia-northeast1（東京）
- [B] us-central1
- [C] その他（記載）

[Answer]:A

## セッション・データ

### Q3: MVP のセッション状態ストレージは？

- [A] Firestore
- [B] in-memory のみ（デモ；永続化なし）
- [C] ADK セッション状態のみ

[Answer]:B

### Q4: 子どもデータの保持期間は？

- [A] 7日（倫理ルールのデフォルト）
- [B] 24時間（デモのみ）
- [C] 先生がアーカイブするまで

[Answer]:A

## クライアント優先度

### Q5: 7/10 提出に向け、最初にデモ対応すべきクライアントは？

- [A] 先生ダッシュボード + テキストベースの子ども UI（Web）
- [B] API のみ（デモスクリプト / curl）
- [C] Kebbi 実機デモ（sibling repo の作業が必要）

[Answer]:A + C（同一優先度 — Web と Kebbi の両方をハッカソンデモに含める；順序付けしない）

## 認証

### Q6: ハッカソン MVP の認証方式は？

- [A] 認証なし（セッション ID のデモモード）
- [B] 簡易先生パスワード / API キー
- [C] Firebase Auth

[Answer]:A

## 言語

### Q7: 子どもとの対話の主要言語は？

- [A] 日本語のみ
- [B] 日本語 + 英語
- [C] 学校ごとに設定可能

[Answer]:A

## エスカレーション

### Q8: 緊急エスカレーションを先生が受け取る方法は？

- [A] ダッシュボードのフラグのみ（先生がポーリング）
- [B] ダッシュボード + 任意でメール（将来）
- [C] 先生 UI へのリアルタイム WebSocket プッシュ

[Answer]:A

# Application Design 計画

## チェックリスト

- [x] コンポーネント定義の components.md を生成
- [x] メソッドシグネチャの component-methods.md を生成
- [x] オーケストレーションパターンの services.md を生成
- [x] 関係性の component-dependency.md を生成
- [x] 統合ドキュメント application-design.md を生成
- [x] Application Design の人間による承認

## 設計質問

### Q1: ハッカソン MVP のセッションストアは？

- [A] Firestore（永続化、本番に近い）
- [B] in-memory（最速のデモセットアップ）

[Answer]:B

### Q2: Listener と Confirmation は同じ Gemini モデル階層を使うか？

- [A] 全エージェント同一モデル（gemini-2.0-flash）
- [B] Listener は Flash、Structurer/Brief は Pro

[Answer]:A

### Q3: Web アプリのパッケージングは？

- [A] `/teacher` と `/child` ルートの単一 Vite アプリ
- [B] `services/web` 内の2つの別ミニアプリ

[Answer]:A

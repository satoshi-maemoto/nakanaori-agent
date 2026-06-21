# ストーリーとユニットの対応

## サマリー

| Story ID | タイトル | 主担当ユニット | 支援ユニット |
|----------|----------|----------------|--------------|
| US-01 | 子どもが順番にロボットに話す | unit-web-child, unit-kebbi-contract | unit-api, unit-agent-core |
| US-02 | エージェントが事実と感情を整理 | unit-agent-core | unit-api |
| US-03 | 子どもが要約を確認・訂正 | unit-agent-core | unit-api, unit-web-child, unit-kebbi-contract |
| US-04 | 先生が1枚ブリーフを受け取る | unit-web-teacher | unit-api, unit-agent-core |
| US-05 | 高リスク内容の即時エスカレーション | unit-agent-core | unit-api, unit-web-teacher |
| US-06 | 先生がセッション一覧を見る | unit-web-teacher | unit-api |
| US-07 | Kebbi を物理アバターとして利用 | unit-kebbi-contract | unit-api, unit-agent-core |

## 詳細マッピング

### US-01: 子どもが順番にロボットに話す（P0）

| ユニット | 貢献 |
|----------|------|
| unit-agent-core | ListenerAgent プロンプト；EmotionGuard 事前チェック |
| unit-api | POST child-turn、セッション状態遷移 |
| unit-web-child | Web デモ経路のテキストチャット UI |
| unit-kebbi-contract | Kebbi HTTP クライアント + 実機デモ向けロボット UX |

**デモ注記**: Web と Kebbi は**同一優先度** — ハッカソンデモで両方が子どもヒアリングを実装。

### US-02: エージェントが事実と感情を整理（P0）

| ユニット | 貢献 |
|----------|------|
| unit-agent-core | FactStructurerAgent、スキーマ（裁きフィールドなし） |
| unit-api | 双方ヒアリング完了時に整理をトリガー |

### US-03: 子どもが要約を確認・訂正（P1）

| ユニット | 貢献 |
|----------|------|
| unit-agent-core | ConfirmationAgent、訂正マージ |
| unit-api | 確認状態マシン |
| unit-web-child | 要約表示；訂正入力受付 |
| unit-kebbi-contract | TTS 読み返し + 音声入力（Phase 2） |

### US-04: 先生が1枚ブリーフを受け取る（P0）

| ユニット | 貢献 |
|----------|------|
| unit-agent-core | TeacherBriefAgent、`ai_disclaimer` |
| unit-api | GET teacher-brief エンドポイント |
| unit-web-teacher | ブリーフ表示 UI |

### US-05: 高リスク内容の即時エスカレーション（P0）

| ユニット | 貢献 |
|----------|------|
| unit-agent-core | EmotionGuardAgent、escalated 状態 |
| unit-api | エスカレーション状態の保持 |
| unit-web-teacher | ダッシュボードのエスカレーションフラグ |

### US-06: 先生がセッション一覧を見る（P1）

| ユニット | 貢献 |
|----------|------|
| unit-web-teacher | ステータスバッジ付きセッション一覧 UI |
| unit-api | セッション一覧/クエリエンドポイント（またはクライアント側ポーリング） |

### US-07: Kebbi を物理アバターとして利用（P0 デモ）

| ユニット | 貢献 |
|----------|------|
| unit-kebbi-contract | `api-contract.md`、sibling repo 実装 |
| unit-api | 安定したセッション REST API |
| unit-agent-core | Kebbi TTS が消費するエージェント応答 |

**デモ注記**: Web 子ども UI と同一優先度 — 決勝デモは Kebbi + 先生ダッシュボードを想定。

## 横断的関心事

| 関心事 | 担当ユニット |
|--------|--------------|
| 出力に裁きラベルなし | unit-agent-core（+ unit-devops のプロンプト CI） |
| CI/CD と staging デプロイ | unit-devops |
| 7日保持ポリシー | unit-api（ポリシー文書；in-memory MVP は再起動でリセット） |
| 子ども向け日本語のみ | unit-agent-core（プロンプト）、unit-web-child、unit-kebbi-contract |

## 未割当ストーリー

なし — US-01 〜 US-07 すべて割当済み。

## ユニット別 Construction 着手ストーリー

| ユニット | 着手ストーリー |
|----------|----------------|
| unit-agent-core | US-02, US-05 |
| unit-api | US-01, US-04, US-05 |
| unit-web-teacher | US-04, US-05, US-06 |
| unit-web-child | US-01, US-03 |
| unit-kebbi-contract | US-01, US-07 |
| unit-devops | NFR-06, NFR-08（全ストーリーがデプロイに依存） |

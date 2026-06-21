# コンポーネント

## エージェントレイヤー（ADK + Gemini）

| コンポーネント | 責務 |
|----------------|------|
| SessionOrchestrator | ワークフロー状態マシン；次エージェント選択；セッションライフサイクル管理 |
| ListenerAgent | 個別ヒアリング；supportive プロンプト；発話収集 |
| EmotionGuardAgent | エスカレーショントリガー監視；高リスク時にワークフロー停止 |
| FactStructurerAgent | 双方から事実・感情・不明点の構造を構築 |
| ConfirmationAgent | 子ども向け要約提示；訂正処理 |
| TeacherBriefAgent | 免責事項付きの先生向け1枚ブリーフ生成 |

## サービスレイヤー

| コンポーネント | 責務 |
|----------------|------|
| ApiService | Cloud Run 上の FastAPI；REST エンドポイント；認証（MVP はデモモード） |
| SessionStore | セッション状態の保持（MVP は in-memory；Firestore は後回し） |

## クライアントレイヤー

| コンポーネント | 責務 |
|----------------|------|
| TeacherWebApp | ダッシュボード：セッション一覧、ブリーフ表示、エスカレーション通知 |
| ChildWebApp | Web アバター UI：ロボットと会話、応答表示 |
| KebbiClient | sibling repo の Android アプリ；ApiService への HTTP クライアント |

## インフラ

| コンポーネント | 責務 |
|----------------|------|
| CloudRunDeployment | API と web コンテナのデプロイ |
| CICDPipeline | GitHub Actions：lint、テスト、プロンプトチェック、staging デプロイ |

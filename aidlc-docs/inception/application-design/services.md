# サービス

## MediationWorkflowService

エンドツーエンドの仲介フローをオーケストレーションする。

**責務**:

- セッション作成と初期状態割り当て（`created` → `listening_a` / `listening_b`）
- 各子どもターン後：EmotionGuard → Listener → エスカレーション確認
- 双方ヒアリング完了後：FactStructurer → Confirmation（子どもごと）→ TeacherBrief
- エスカレーション時：仲介完了をスキップ；エスカレーションブリーフを生成

**連携**:

- 状態遷移のために SessionOrchestrator を呼び出す
- エージェントレジストリ経由で ADK エージェントに委譲
- SessionStore に書き込む

## BriefDeliveryService

先生ブリーフをダッシュボードへ届ける。

**責務**:

- 生成された `TeacherBrief` をセッションに保存
- `ready_for_teacher` または `escalated` をマーク
- GET `/v1/sessions/{id}/teacher-brief` で公開

## PromptGovernanceService

Nakanaori 倫理に沿った出力コンプライアンスを確保する。

**責務**:

- エージェント出力を禁止裁きラベルと照合
- `scripts/check-prompts.sh` 経由で CI 実行
- プロンプトが NAKANAORI-01 に違反する場合デプロイをブロック

## DeploymentService（Operations）

**責務**:

- api と web の Docker イメージをビルド
- main マージ時に Cloud Run staging へデプロイ
- 環境変数設定（Gemini API キーは Secret Manager 経由）

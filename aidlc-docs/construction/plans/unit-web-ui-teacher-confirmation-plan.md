# Code Generation Plan — ENH-UI-04 先生確認ガイド + 子どもナビ

## チェックリスト

- [x] ChildNavigatorAgent + SessionState 名前フィールド
- [x] API welcome_message / child names / async progress insights
- [x] FactStructurer LLM `teacher_hints` + analysis キャッシュ
- [x] Listener 会話履歴コンテキスト
- [x] ConfirmationGuidePanel ヒーロー UI
- [x] 子どもバルーン色 + チャットスクロール
- [x] 消しゴム例文（recommended 送信単位）
- [x] contradiction-analyzer を LLM フォールバック専用に整理
- [x] verify-browser / workflow.test 更新
- [x] ドキュメント（本 plan + requirements + api-contract + screen-inventory）

## 実装順

1. agents スキーマ + ChildNavigator + workflow
2. FactStructurer LLM teacher_hints
3. API progress async + cache
4. web 先生ヒーロー + 子ども UI
5. docs/examples 消しゴム
6. テスト・プロンプト check

# unit-web-ui — Enhancement 一覧

Code Generation 完了後の **差分改善** をここに記録する。Inception のやり直しは不要。

| ID | 名称 | 状態 | 成果物 |
|----|------|------|--------|
| ENH-UI-01 | [VRM 品質・表示修正](./vrm-quality/requirements.md) | ✅ 完了 | `vrm-quality/` + `functional-design/vrm-integration.md` 更新 |
| ENH-UI-02 | [子ども UX + 先生デモセッション一覧](./child-teacher-demo/requirements.md) | ✅ 完了 | `child-teacher-demo/` + API 一覧 |
| ENH-UI-03 | [子どもチャット + ローカル Gemini](./chat-gemini-local/requirements.md) | ✅ 完了 | IME / finish_turn / gemini-2.5 / .env |
| ENH-UI-04 | [子どもナビ + 先生「確認の進め方」+ LLM 整理](./teacher-confirmation-guide/requirements.md) | ✅ 完了 | ChildNavigator / ConfirmationGuide / teacher_hints |
| ENH-UI-05 | [子ども番終了確認 + レイアウト連動 VRM](./child-turn-flow/requirements.md) | ✅ 完了 | 番を おわる / resetLayout / client_channel |

Kebbi 向け関連: [unit-kebbi-client/enhancements/](../unit-kebbi-client/enhancements/README.md)（ENH-KEBBI-02）

## Enhancement 実行パターン（unit-web-ui）

1. **Minimal Requirements** — `enhancements/<name>/requirements.md`
2. **Functional Design 差分** — 既存 `functional-design/*.md` を追記（必要時）
3. **Code Generation plan** — `aidlc-docs/construction/plans/unit-web-ui-<name>-plan.md`
4. **実装** — `services/web/`
5. **Build & Test** — `npm run build` + `scripts/verify-browser.mjs`

## 参照

- 初回ユニット定義: [unit-overview.md](../unit-overview.md)
- VRM 統合設計: [vrm-integration.md](../functional-design/vrm-integration.md)
- 変更管理: `.aidlc-rule-details/common/workflow-changes.md`

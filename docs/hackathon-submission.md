# ハッカソン提出チェックリスト

**イベント**: [DevOps × AI Agent Hackathon 2026](https://findy.co.jp/4127/)  
**期限**: 2026-07-10（金）23:59  
**ハッシュタグ**: `#findy_hackathon`

**訴求力向上計画**: [hackathon-appeal-plan.md](./hackathon-appeal-plan.md)  
**AI-DLC 実行計画**: [aidlc-docs/operations/hackathon-submission-plan.md](../aidlc-docs/operations/hackathon-submission-plan.md)

---

## 必須提出物

- [ ] **GitHub** — 公開リポジトリ URL
- [x] **Deployed URL** — Cloud Run staging 稼働（URL は **事務局へ別途連絡**；README 非掲載）→ [hackathon-staging-deploy.md](./hackathon-staging-deploy.md)
- [ ] **Proto Pedia** — プロジェクト登録 URL → 文案: [proto-pedia-draft.md](./proto-pedia-draft.md)

## 必須技術（README で確認）

- [x] Google Cloud Run
- [x] Gemini API
- [x] ADK（Agents Development Kit）

## 推奨デモ素材

- [ ] **3分デモ動画** — 台本: [demo-video-script.md](./demo-video-script.md)
- [x] README または `docs/architecture.md` にアーキテクチャ図
- [x] CI バッジ / workflow がリポジトリで可視（README 先頭）

## デモ台本（提出用）

| シナリオ | 用途 | ドキュメント |
|----------|------|--------------|
| **順番取り合い**（メイン） | 通常仲介 → 先生確認 → 解決 | [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md) |
| **暴力エスカレーション** | 緊急停止 → 先生 UI urgent | [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md) |
| ライブピッチ Scene 1–8 | 決勝向け | [demo-scenario.md](./demo-scenario.md) |

> 消しゴム台本（[eraser-story-dialogue.md](./examples/eraser-story-dialogue.md)）は参照用。提出デモは **順番取り合い** を使用。

---

## 審査基準との対応

| 基準 | デモ方法 | 訴求コピー |
|------|----------|------------|
| エージェント中心性 | 多段 ADK ワークフロー（Listener → FactStructurer → EmotionGuard） | 「単一チャットではなく、聞く→整理→エスカレーション」 |
| アプローチ | 非裁断の黒子哲学、学校ケンカドメイン | 「裁かない。事実・気持ち・不明点を先生に届ける」 |
| 使いやすさ | `/child` 低学年 UI + `/teacher` 確認の進め方 | 「子どもは順番に話す。先生は1枚ブリーフで判断材料を得る」 |
| 実用性 | 順番取り合い → 左/右ブランコの食い違いを整理 | 「1分で解決に導ける仲介フロー」 |
| 実装 | Cloud Run デプロイ、CI、プロンプト禁止語 | 「DevOps でつくる・まわす・とどける」 |

詳細: [hackathon-appeal-plan.md](./hackathon-appeal-plan.md)

---

## P0 実行チェック（7/10 まで）

| # | タスク | 状態 |
|---|--------|------|
| 1 | GCP Secrets → staging 初回デプロイ | ✅ |
| 2 | Deployed URL — 事務局へ連絡（README 非掲載） | ✅ |
| 3 | Proto Pedia 登録 | ☐ |
| 4 | 3分デモ動画 公開 | ☐ |
| 5 | 本チェックリスト完了 | ☐ |

---

## 登録

- Findy Conference 登録（チームメンバー）
- Proto Pedia: ハッカソン公式サイトのリンクを参照

## 決勝

- 10チームが Google 渋谷ストリームに招待、2026-08-19
- ライブデモ: Kebbi + 先生ダッシュボード推奨（[demo-scenario.md](./demo-scenario.md) Scene 1–8）

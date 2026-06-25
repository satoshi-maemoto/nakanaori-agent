# Proto Pedia 登録文案（ドラフト）

**用途**: DevOps × AI Agent Hackathon 2026 — Proto Pedia プロジェクトページ  
**提出前に**: 公式フォームの文字数制限に合わせて短縮してください。

---

## プロジェクト名

**ナカナオリ・エージェント（Nakanaori Agent）**

---

## キャッチコピー（1行）

DevOps で回す、学校ケンカ向け **非裁断** 多段 ADK エージェント — 話を整理して先生につなぐ。

---

## 概要（200〜400字）

学校で起きる小さな口論について、AI が **どちらが正しいかを裁かず**、子どもA・B それぞれの話を **順番に聞き**、事実・気持ち・不明点に整理して **先生向けブリーフ** を届けます。

「ロボットは裁かない。ただ、話を整理して先生につなぐ。」— **主役は人。ロボットは黒子。**

**技術**: Google Cloud Run + Gemini API + ADK（`@google/adk`）。Listener / FactStructurer / EmotionGuard など多段ワークフロー。暴力・いじめの兆候は即エスカレーションし、自律的に解決しません。

**クライアント**: React Web（子ども VRM アバター + 先生ダッシュボード）、Nuwa Kebbi ロボット（音声対話）。

**DevOps**: GitHub Actions（CI + staging 自動デプロイ）、プロンプト禁止語ガバナンス。

---

## 解決する課題

- 子ども: 動揺中に相手と向き合わず、落ち着いて話したい
- 先生: ケンカのたびに呼ばれ、双方の言い分を整理する負荷が高い
- 学校: 自動裁決 AI ではなく、**人（先生）が判断** する支援が必要

---

## デモ URL（提出時に記入）

| 項目 | URL |
|------|-----|
| GitHub | https://github.com/satoshi-maemoto/nakanaori-agent |
| Web デモ | https://nakanaori-web-370062202060.asia-northeast1.run.app/ |
| Web（子ども） | https://nakanaori-web-370062202060.asia-northeast1.run.app/child |
| Web（先生） | https://nakanaori-web-370062202060.asia-northeast1.run.app/teacher |
| API | https://nakanaori-api-370062202060.asia-northeast1.run.app/health |
| 3分動画 | _（YouTube 等）_ |

---

## 必須技術タグ

- Google Cloud Run
- Gemini API
- ADK（Agents Development Kit）

---

## デモの見どころ（審査員向け）

1. **順番取り合い** — ロボットが順番に聞き、左/右ブランコの食い違いを先生に整理
2. **緊急** — 「殴った」で仲介停止 → 先生 UI に urgent
3. **DevOps** — main マージ → Cloud Run 自動デプロイ

---

## ハッシュタグ

`#findy_hackathon`

---

## 関連リンク

- [README](../README.md)
- [architecture.md](./architecture.md)
- [hackathon-appeal-plan.md](./hackathon-appeal-plan.md)

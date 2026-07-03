# ProtoPedia 登録文案（ドラフト）

**用途**: DevOps × AI Agent Hackathon 2026 — [ProtoPedia](https://findy.co.jp/4127/) 提出フォーム  
**方針**: **デモ URL は ProtoPedia に掲載しない**（GitHub を作品 URL に）。動画・画像でデモを見せる。**ストーリー**は個人的な着想（1年生の大げんか）→ 学校現場の観察 → 働き方改革 DX → 将来像（教室に1台）の流れで書いています。

各項目はフォームに **そのままコピペ** できるよう整理しています。

---

## 基本情報

### 作品タイトル（必須）

```text
ナカナオリ・エージェント
```

---

### 作品の URL

公開 GitHub（審査員がコード・CI を確認しやすい）

```text
https://github.com/satoshi-maemoto/nakanaori-agent
```

---

### 概要（必須・100文字以内）

SNS 表示用。**100文字以内**に収める。

```text
子どものいざこざを話しやすくヒアリングし、整理して先生に届ける。裁かない黒子エージェント。教室のタブレット・PC・ロボット対応。
```

（58文字）

**別案**（技術寄り・49文字）:

```text
学校のケンカを裁かず、子どもの話を整理して先生につなぐ多段ADKエージェント。Cloud Run + Gemini + DevOpsで回す。
```

---

### ライセンスの設定

**推奨**: 「表示する — Creative Commons Attribution CC BY version 4.0 or later (CC BY 4+)」

> ProtoPedia 上の作品説明・画像・動画は **CC BY 4+**（[docs/CONTENT-LICENSE.md](./CONTENT-LICENSE.md)）。ソースコードは **Apache 2.0**（[LICENSE](../LICENSE) + [NOTICE](../NOTICE)）。

---

## 詳細設定項目

### 画像（最大5枚・1枚目がメイン）

**推奨サイズ**: 880×495px（png / jpg）

| # | 内容 | 取得方法 |
|---|------|----------|
| 1 **メイン** | `/child` — VRM ロボットと会話 UI | staging `/child` をブラウザキャプチャ |
| 2 | `/teacher` — 先生ブリーフ（事実・気持ち・不明点） | 順番取り合い台本デモ後 |
| 3 | **緊急** — `urgent` 表示（暴力ワード後） | [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md) |
| 4 | GitHub Actions — CI 緑 + Deploy Staging | リポジトリ Actions タブ |
| 5 | タブレット / Kebbi 実機（任意） | 教室にある端末でも `/child` が動く様子 |

> **5枚目の意図**: ロボットだけでなく、**教室に既にあるタブレット**でも使えることを見せる。

---

### 動画

YouTube または Vimeo URL。**3分デモ**（[demo-video-script.md](./demo-video-script.md) 準拠）

```text
（提出前に記入）https://www.youtube.com/watch?v=...
```

---

### システム構成

#### 画像

[architecture.md](./architecture.md) の **システム構成図**（技術スタック付き）を **880×495px** の PNG にエクスポートしてアップロード。

（Mermaid Live Editor や VS Code 拡張で PNG 化 → リサイズ。DevOps パイプライン図は別枠で使う場合のみ）

#### 説明文（Markdown — フォームにコピペ）

```markdown
## 全体像

**子ども（Web ブラウザ / Nuwa Kebbi）** → **Cloud Run API** → 多段 **ADK + Gemini** ワークフロー → **先生ダッシュボード**（Web）。

端末は **教室に既にあるタブレット・PC・スマホ** のブラウザ、または **Kebbi ロボット** のどちらでも利用可能（Web は追加ハード不要）。

## コンポーネント

| レイヤ | 技術 |
|--------|------|
| エージェント | TypeScript + Google ADK（Listener / EmotionGuard / FactStructurer / Confirmation / TeacherBrief） |
| API | Hono + Node.js on **Cloud Run**（`nakanaori-api`） |
| Web | React（`/child` 低学年 UI + `/teacher` ブリーフ）on **Cloud Run**（`nakanaori-web`） |
| Kebbi | Android（sibling repo `nakanaori-kebbi`）— REST + Google Cloud TTS |
| AI | **Gemini API**（Secret Manager 経由、任意で stub モード） |
| TTS | Google Cloud Text-to-Speech（Chirp 3 HD、Secret 任意） |

## データフロー（1ターン）

1. 子ども発話 → API `POST /v1/sessions/{id}/child-turn`
2. EmotionGuard が暴力・いじめ等を検知 → 即 **escalated**（自律解決しない）
3. Listener / FactStructurer が **事実・気持ち・不明点** を分離
4. 先生向け `GET /v1/sessions/{id}/teacher-brief`（`ai_disclaimer` 付き）

## DevOps

- **CI**: lint · Vitest · プロンプト禁止語チェック（`check-prompts.sh`）
- **CD**: `main` push → GitHub Actions → Artifact Registry → Cloud Run staging
- **Secret**: `GEMINI_API_KEY` / `GOOGLE_TTS_CREDENTIALS_JSON` — ENABLED 時のみ注入

## 倫理設計

- AI の出力・保存データに「誰が悪い」「勝ち負け」等の判定項目を持たせない
- **主役は人（先生）** — ロボットは黒子
```

---

### 開発素材

フォームの候補から選ぶか、3文字以上で入力。**5〜8個** 目安。

```text
Google Cloud Run
Gemini API
Google ADK
Google Cloud Text-to-Speech
GitHub Actions
React
TypeScript
Nuwa Kebbi
```

---

### タグ（最大5個）

```text
AI Agent
Gemini
教育
働き方改革
Cloud Run
```

（5個。`DevOps` は Story 内で CI/CD として記載。`#findy_hackathon` は Story 内に記載）

---

### ストーリー（Markdown — フォームにコピペ）

```markdown
## 何を作ったか

学校で起きる子ども同士の**いざこざ**を、話しやすい雰囲気で**ヒアリング**し、**事実・気持ち・不明点**に整理して、**先生への適切な伝え方**（ブリーフ）として届けるエージェントです。どちらが正しいかは裁きません。**主役は先生**、ロボットは黒子です。

> 「ロボットは裁かない。ただ、話を整理して先生につなぐ。」

## 着想 — うちの子が1年生のとき

うちの子が1年生のとき、友だちと**ひどい大げんか**になり、親が呼ばれました。先生の前では、お互い**自分に有利なことしか言わない**。先生は困っていた — その場面が出発点です。

子どもは動揺していて、いきなり「誰が悪い？」と聞かれると言えないことも多い。でも**話を聞いてもらえる相手**がいれば、自分の気持ちや出来事を少しずつ整理できるはずです。

## 学校で見た課題 — 先生も、他の子も

学校に行く機会が多いのですが、**低学年になるほど**、授業中にもかかわらず**廊下でこどもたちの話を聞いて指導している先生**の姿をよく見ます。先生にとっても大変ですし、その間**授業がストップ**するなら、他の子どもの**学習機会も減ってしまう**。

だからこれは、子ども向けの「便利な AI」だけでなく、**先生の働き方改革・学校 DX** として考えています。先生が廊下に立ち続ける時間を減らし、**整理された材料**をもとに、人が向き合う時間を増やす — そんなサービスを目指しています。

## 今回のプロトタイプ（ハッカソン）

**ナカナオリ・エージェント**は、その第一歩として「仲直り・いざこざ」の**聞き取りと整理**に特化した MVP です。

- A・B の子どもを**順番に**ヒアリング（例: ブランコ取り合い）
- 暴力・いじめ等は **即エスカレーション**（AI は自律解決しない）
- 先生 UI に **事実・気持ち・不明点** + AI 免責のブリーフ

## ゆくゆくの姿 — 教室に1台

教室に **1台** — 子どもたちの話を聞いたり、一緒に遊んだり、時には**勉強をサポート**するようなエージェントへ。ロボット（Kebbi）も、その入口のひとつです。

**端末は選べる**: 専用ロボットに限らず、**教室に既にあるタブレット・PC・スマホ**のブラウザからも子ども向け画面が使えます（追加ハード不要で試せる）。

## デモ動画の見どころ

3分の YouTube 動画（[demo-video-script.md](./demo-video-script.md) 準拠）で、次を順に見せます。

### 1. 順番取り合い（通常仲介）

左のブランコ vs 右のブランコ — 子ども同士の**食い違い**を、ロボットが順番に聞いて先生に「どっちのブランコ？」という確認ヒントを渡します。

### 2. 緊急エスカレーション

「殴った」等のワードで **仲介を即停止**。子ども UI は入力不可、先生 UI に **urgent** 表示。AI は罰則を決めません。

### 3. DevOps で回す

PR → CI（プロンプト禁止語チェック）→ `main` マージ → Cloud Run staging 自動デプロイ。

## 技術的こだわり

- **多段 ADK** — 単一チャットではなく、聞く → 整理 → エスカレーションの役割分担
- **AI は「悪い子」を決めない** — 出力にも保存データにも「誰が悪い」「勝ち負け」「有罪」といった判定項目を持たせない
- **マルチクライアント** — Web（VRM）+ Kebbi 実機（ASR + Cloud TTS）
- **Secret 運用** — GEMINI / TTS は Secret Manager で ON/OFF（審査用・コスト抑制）

## ソースコード

https://github.com/satoshi-maemoto/nakanaori-agent

## チームからのひとこと

1年生の大げんかで、先生の前ではお互い自分の言い分しか出てこなかった — あのとき先生が困っていた顔を、今も覚えています。廊下で授業を止めて聞き続ける日々を、少しでも楽にしたい。**両方の話を整理した材料**が先生の手元にあれば、裁く前に向き合える。AI に判断を委ねず、**人が決める** — その黒子として、DevOps で staging まで届けました。

#findy_hackathon
```

---

## 提出前チェックリスト

- [ ] 概要が **100文字以内**
- [ ] メイン画像（880×495）を1枚以上
- [ ] システム構成図をアップロード
- [ ] 3分動画 URL（YouTube / Vimeo）— 動画欄に記載（デモ URL は掲載しない）
- [ ] 作品 URL は GitHub のみ
- [ ] タグ5個以内
- [ ] 開発素材を3個以上
- [ ] staging で `/child` → `/teacher` スモーク済み

## 関連

- [demo-video-script.md](./demo-video-script.md) — 動画台本
- [hackathon-submission.md](./hackathon-submission.md) — 提出チェックリスト
- [architecture.md](./architecture.md) — 構成図ソース

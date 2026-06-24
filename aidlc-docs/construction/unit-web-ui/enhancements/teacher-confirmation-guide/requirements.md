# ENH-UI-04 — 子どもナビ + 先生「確認の進め方」+ LLM 整理

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-UI-04 |
| **ユニット** | `unit-web-ui` + `unit-api` + `unit-agent-core` |
| **種別** | Enhancement |
| **状態** | ✅ 完了（2026-06-21） |
| **関連コミット** | `e93a8f2` 以降の未コミット変更含む |

## 背景・価値提案

> **ロボットは裁かない。ただ、話を整理して先生につなぐ。**

先生側の **コア価値** は「会話履歴の羅列」ではなく、  
**何が食い違っているか** と **どう確認すれば真相に近づけるか** を neutral に示すこと。

本 Enhancement で以下を実装した。

## スコープ一覧

| # | 機能 | レイヤ |
|---|------|--------|
| 1 | 子どもナビ（自己紹介・名前・呼びかけ） | agents |
| 2 | 子ども UI：A/B 別バルーン色・チャットスクロール | web |
| 3 | 先生 UI：会話履歴 + 整理 + **確認の進め方（ヒーロー）** | web |
| 4 | LLM による `disagreements` / `teacher_hints` | agents + API |
| 5 | 消しゴムデモ用例文（送信単位の整合） | docs |
| 6 | Listener 会話履歴コンテキスト | agents |

---

## 1. 子どもナビゲーション（ChildNavigatorAgent）

### 挙動

| タイミング | ロボット（ナカナオリ） |
|------------|------------------------|
| セッション開始 | 自己紹介 + 安心の言葉 + 名前を聞く（`welcome_message`） |
| 初回発話 | 名前として受け取り、以後「〇〇さん」 |
| 2人目の番 | 1人目に感謝 → 2人目にも名前を聞く |
| 以降 | 名前で呼びかけ + Listener が傾聴 |

### データ

- `SessionState.child_a_name` / `child_b_name`
- `POST /v1/sessions` → `welcome_message`
- `POST child-turn` → `child_a_name`, `child_b_name` を返却

### 実装

- `packages/agents/src/agents/child-navigator.ts`
- `packages/agents/src/prompts/listener.md`（ナカナオリ名・名前呼び）

---

## 2. 子ども UI

### バルーン色

| 子ども | 色 | Tailwind |
|--------|-----|----------|
| A | 水色 | `bg-sky-600` |
| B | 紫 | `bg-violet-600` |
| ロボット | 白枠 | ラベル「ナカナオリ」 |

`ChatMessage.childId` で色分け（`ChatBubble.tsx`）。

### チャットスクロール

- 会話が長くなっても **アバター・入力欄は固定**
- 会話のみ `overflow-y-auto`（`ChildView.tsx`）
- 新着メッセージで自動スクロール

---

## 3. 先生 UI — 確認の進め方（ヒーロー）

### 情報設計（表示順 = 価値の順）

1. **確認の進め方** — `ConfirmationGuidePanel`（大見出し・番号付きステップ・スカイ枠）
2. **話の整理（参考）** — 食い違い・一致・不明（`TeacherInsightsPanel`）
3. **会話履歴** — 生の発話

### コンポーネント

| ファイル | 役割 |
|----------|------|
| `ConfirmationGuidePanel.tsx` | `teacher_hints` のヒーロー表示 |
| `TeacherInsightsPanel.tsx` | 整理 + ガイドのラッパ |
| `SessionProgressCard.tsx` | 進行中（ブリーフ未準備） |
| `BriefCard.tsx` | ブリーフ完成後（ガイドを最上部） |

---

## 4. LLM 整理（FactStructurer + teacher_hints）

### 方針

- **本番経路**: Gemini + `fact_structurer.md` が `disagreements` / `unknowns` / **`teacher_hints`** を生成
- **フォールバック**: `GEMINI_API_KEY` 未設定 or LLM 失敗時のみ `fallbackAnalyzeContradictions`（ルールベース）

### スキーマ拡張

`StructuredFacts` / `SessionInsights` / `TeacherBrief`:

```typescript
teacher_hints: string[]  // 先生が真相確認に使う具体的ステップ
```

### API

| エンドポイント | 変更 |
|----------------|------|
| `GET .../progress` | **async** — LLM で `insights` 生成、セッションに `analysis_snapshot` キャッシュ |
| `GET .../teacher-brief` | `teacher_hints`, `conversation_a/b` 含む |

### 実装

- `FactStructurerAgent.analyzeSession()`
- `MediationWorkflow.refreshSessionInsights()`
- `packages/agents/src/prompts/fact_structurer.md`

---

## 5. Listener 会話履歴

- 同一子の **これまでの発話** を LLM / スタブに渡す
- プロンプト: 既出情報を聞き直さない
- デモ例文は **1まとまり = 1回「おくる」** を推奨

---

## 6. 消しゴムデモ例文

| ファイル | 内容 |
|----------|------|
| [docs/examples/eraser-story-dialogue.md](../../../../../docs/examples/eraser-story-dialogue.md) | 手順・矛盾の解説・デモ台詞 |
| [docs/examples/eraser-story-utterances.json](../../../../../docs/examples/eraser-story-utterances.json) | `turns.recommended`（機械可読） |

**推奨送信**: 各子 **名前 → 2回のまとめ送信 → 番を おわる → おわり**（ENH-UI-05 で UI 更新。旧「つぎの ばん」は同等操作）
細切れ 6 回送信は `legacy_fragmented`（ロボットと噛み合いにくい）

---

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-NAV-01 | 開始時 `welcome_message` で自己紹介・安心・名前確認 | ✅ |
| AC-NAV-02 | 初回発話で名前保存、以後名前呼び | ✅ |
| AC-NAV-03 | B の番で B 向け挨拶 + 名前確認 | ✅ |
| AC-UI-CH-04 | 子ども A/B 別バルーン色 | ✅ |
| AC-UI-CH-05 | 会話エリア内スクロール、アバター常時表示 | ✅ |
| AC-UI-TH-06 | 先生画面で「確認の進め方」が最上部ヒーロー | ✅ |
| AC-LLM-07 | `teacher_hints` を LLM が具体的に生成（API key 時） | ✅ |
| AC-LLM-08 | progress で insights キャッシュ（ポーリング負荷軽減） | ✅ |
| AC-DOC-09 | 消しゴム例文 + 送信単位ガイド | ✅ |

---

## 変更ファイル（主要）

### agents

- `agents/child-navigator.ts`, `child-navigator.test.ts`
- `agents/contradiction-analyzer.ts`（フォールバックのみ）
- `agents/fact-structurer.ts`, `prompts/fact_structurer.md`
- `agents/listener.ts`, `prompts/listener.md`
- `agents/teacher-brief.ts`
- `schemas.ts` — `teacher_hints`, `child_*_name`, `analysis_snapshot`
- `index.ts` — `refreshSessionInsights`, `getSessionWelcome`

### api

- `app.ts` — async progress, `welcome_message`, names on responses

### web

- `child/ChildView.tsx`, `lib/child-copy.ts`
- `components/chat/ChatBubble.tsx`
- `components/brief/ConfirmationGuidePanel.tsx`
- `components/brief/TeacherInsightsPanel.tsx`
- `teacher/SessionProgressCard.tsx`, `TeacherView.tsx`

### docs

- `docs/examples/eraser-story-*`

---

## デモ手順（3分）

1. `bash scripts/dev-stack.sh`（`.env` に `GEMINI_API_KEY`）
2. ブラウザ A → `/child` → [eraser-story-dialogue.md](../../../../../docs/examples/eraser-story-dialogue.md) の **推奨 3 回 + 番を おわる**
3. ブラウザ B → 同セッション or 続き（B の番）
4. `/teacher` → セッション選択 → **確認の進め方** を確認

---

## 参照

- [Enhancement 一覧](../README.md)
- [画面一覧](../../functional-design/screen-inventory.md)
- [API 契約](../../../../../clients/kebbi/api-contract.md)
- [demo-scenario.md](../../../../../docs/demo-scenario.md)

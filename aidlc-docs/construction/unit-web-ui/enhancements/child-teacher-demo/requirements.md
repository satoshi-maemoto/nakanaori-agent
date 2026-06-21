# ENH-UI-02 — 子ども画面 UX + 先生デモセッション一覧

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-UI-02 |
| **ユニット** | `unit-web-ui` + `unit-api`（一覧 API） |
| **種別** | Enhancement |
| **状態** | ✅ 完了（2026-06-21） |

## 背景

1. **子ども画面**: 小学低学年でも使えるよう、大きなアバター・大きな文字・やさしい表記が必要
2. **先生画面**: セッション ID の取得方法が不明でデモが回しにくい。進行中セッションを一覧から選べるとよい

## ユーザー要求（要約）

> 子供用画面は、大きなアバターと、大きな文字、小学低学年でも読める漢字のみを使って  
> 先生画面はセッションIDが必要だが、それを得る手段がわからない。デモなので現在進行中のセッションについて情報が観れると良い

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-CH-01 | アバター表示領域を拡大（lg 最大 ~520px 高） | ✅ |
| AC-CH-02 | チャット・ボタン・入力を text-lg〜xl | ✅ |
| AC-CH-03 | UI 文言を `child-copy.ts` に集約（ひらがな中心・低学年向け） | ✅ |
| AC-TE-01 | `GET /v1/sessions` で進行中セッション一覧 | ✅ |
| AC-TE-02 | `GET /v1/sessions/:id/progress` で途中経過（発話一覧） | ✅ |
| AC-TE-03 | 先生画面に一覧 + 5s 自動更新；クリックで詳細 | ✅ |
| AC-TE-04 | ブリーフ未準備時は進行状況カード、準備完了で BriefCard | ✅ |
| AC-TE-05 | セッション ID 直接入力は `<details>` 内（上級者向け） | ✅ |

## 実装ファイル

### API

| パス | 内容 |
|------|------|
| `services/api/src/store.ts` | `listAll()` |
| `services/api/src/app.ts` | `GET /v1/sessions`, `GET .../progress` |

### Web

| パス | 内容 |
|------|------|
| `services/web/src/lib/child-copy.ts` | 子ども向け文言 |
| `services/web/src/lib/session-labels.ts` | 状態ラベル |
| `services/web/src/child/ChildView.tsx` | 大 UI + childCopy |
| `services/web/src/teacher/TeacherView.tsx` | 一覧駆動 |
| `services/web/src/teacher/ActiveSessionList.tsx` | 進行中一覧 |
| `services/web/src/teacher/SessionProgressCard.tsx` | 途中経過表示 |

## デモフロー

1. 子ども画面 `/child` →「はじめる」でセッション開始
2. 先生画面 `/teacher` →「進行中のセッション」に自動表示（5 秒ごと更新）
3. セッション行をクリック → 進行中は発話一覧、完了後はブリーフ

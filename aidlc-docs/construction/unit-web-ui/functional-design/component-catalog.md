# コンポーネントカタログ — unit-web-ui

## 技術スタック（Q1 確定）

- **Tailwind CSS** — ユーティリティ + デザイントークン
- **shadcn/ui** — Button, Card, Input, Badge, Alert, Separator
- **React 19** + Vite（既存）

## ディレクトリ

```text
services/web/src/
├── theme/
│   └── tokens.css          # CSS variables（色・半径・字）
├── components/
│   ├── ui/                 # shadcn 生成
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   └── AiDisclaimerBanner.tsx
│   ├── chat/
│   │   ├── ChatBubble.tsx
│   │   ├── ChatLog.tsx
│   │   └── TurnProgress.tsx
│   ├── brief/
│   │   ├── BriefCard.tsx
│   │   ├── FactSection.tsx
│   │   ├── FeelingSection.tsx
│   │   └── UnknownSection.tsx
│   └── demo/
│       └── DemoGuideFlow.tsx
├── avatar/
│   ├── AvatarCanvas.tsx
│   ├── AvatarGenderPicker.tsx
│   ├── VrmViewer.ts
│   ├── useVrmAvatar.ts
│   └── model-config.ts
├── child/
│   └── ChildView.tsx       # 本ユニットコンポーネントを合成
└── teacher/
    └── TeacherView.tsx
```

## レイアウト

### AppShell

| Prop | 型 | 説明 |
|------|-----|------|
| `title` | string | ページタイトル |
| `children` | ReactNode | メイン |
| `variant` | `'child' \| 'teacher'` | 背景トーン切替 |

### AiDisclaimerBanner

| Prop | 型 | 説明 |
|------|-----|------|
| `text` | string | `brief.ai_disclaimer` |

- 先生画面: `sticky top-0`
- 折りたたみ不可

## チャット（子ども）

### ChatBubble

| Prop | 型 | 説明 |
|------|-----|------|
| `role` | `'child' \| 'robot' \| 'system'` | 吹き出し方向 |
| `children` | string | 本文 |

### ChatLog

| Prop | 型 | 説明 |
|------|-----|------|
| `messages` | `ChatMessage[]` | `{ role, text }[]` |

### TurnProgress

| Prop | 型 | 説明 |
|------|-----|------|
| `state` | string | API `state`（listening_a 等） |
| `childALabel` | string | 表示名 |
| `childBLabel` | string | 表示名 |

## アバター

### AvatarGenderPicker

| Prop | 型 | 説明 |
|------|-----|------|
| `value` | `'male' \| 'female'` | 現在選択 |
| `onChange` | `(g) => void` | 選択変更 |

- 男性 / 女性のサムネイル（VRM 静止キャプチャ or アイコン）
- 選択を `localStorage` key `nakanaori.avatar.gender` に保存

### AvatarCanvas

| Prop | 型 | 説明 |
|------|-----|------|
| `gender` | `'male' \| 'female'` | モデル選択 |
| `speaking` | boolean | lip-sync トリガ |
| `fallbackImage` | string? | WebGL 不可時 |

内部: `useVrmAvatar` → `VrmViewer`

## ブリーフ（先生）

### BriefCard

| Prop | 型 | 説明 |
|------|-----|------|
| `brief` | `TeacherBrief` | API レスポンス |
| `urgent` | boolean | `brief.urgent` |

子コンポーネント: `FactSection`, `FeelingSection`, `UnknownSection`, Timeline

### FactSection / FeelingSection / UnknownSection

| Prop | 型 | 説明 |
|------|-----|------|
| `side` | `'a' \| 'b'` | 子ども側 |
| `items` | string[] | facts / feelings / unknowns |

## 状態管理（MVP）

| 画面 | 状態 | 保存 |
|------|------|------|
| ChildView | sessionId, messages, childId, loading | React useState |
| ChildView | avatar gender | localStorage |
| TeacherView | sessionId, brief, error | React useState |

Context API は Code Generation で必要なら `SessionContext` を追加。

## shadcn 導入コンポーネント（初期）

- Button, Card, CardHeader, CardContent
- Input, Textarea
- Badge（TurnProgress）
- Alert（エスカレーション、エラー）

## API 結合点

| コンポーネント | API |
|----------------|-----|
| ChildView | `createSession`, `postChildTurn` |
| TeacherView | `getTeacherBrief` |
| AvatarCanvas | なし（純 UI） |

# NFR 要件 — unit-web-ui

## 性能

| ID | 要件 | MVP 目標 |
|----|------|----------|
| NFR-UI-01 | 初回 LCP（/child） | < 3s（ローカル） |
| NFR-UI-02 | VRM モデルサイズ | 1 体 ≤ 15MB；男女切替時のみ reload |
| NFR-UI-03 | WebGL 不可時 | 2s 以内に 2D フォールバック表示 |
| NFR-UI-13 | VRM 初回読込 | SpringBone warmup ~90f 同期；ローディング UI で隠蔽（ENH-UI-01） |

## バンドル

| ID | 要件 | MVP |
|----|------|-----|
| NFR-UI-04 | three + VRM | `/child` ルート lazy load（dynamic import） |
| NFR-UI-05 | 先生画面 | VRM バンドル非読込 |

## 互換

| ID | 要件 | MVP |
|----|------|-----|
| NFR-UI-06 | ブラウザ | Chrome / Safari 最新（iPad デモ想定） |
| NFR-UI-07 | レスポンシブ | md+ 左アバター；`<md` 上アバター |

## a11y

| ID | 要件 | MVP |
|----|------|-----|
| NFR-UI-08 | チャット | `aria-live="polite"` |
| NFR-UI-09 | ボタン | テキストラベル必須 |
| NFR-UI-10 | urgent | 色 + 文言（色のみ不可） |

## セキュリティ

| ID | 要件 | MVP |
|----|------|-----|
| NFR-UI-11 | VRM 資産 | `public/models/` 静的配信のみ |
| NFR-UI-12 | localStorage | gender のみ（PII なし） |

# 技術スタック決定 — unit-web-ui

| 項目 | 決定 |
|------|------|
| CSS | Tailwind CSS v4（`@tailwindcss/vite`） |
| コンポーネント | shadcn 互換パターン（手動 `components/ui/*`） |
| VRM | `three` + `@pixiv/three-vrm` |
| モデル | CharaTomo 同系 GLB（男女）— `public/models/` |
| フォールバック | SVG プレースホルダ + optional GLB |
| 状態 | React useState + localStorage（gender） |

## モデル配置

CharaTomo-Web から以下をコピー（リポジトリ外の場合はデプロイ時に配置）:

- `8329890252317737768.glb` → `services/web/public/models/`
- `8590256991748008892.glb` → `services/web/public/models/`

未配置時は 2D SVG フォールバックで動作。

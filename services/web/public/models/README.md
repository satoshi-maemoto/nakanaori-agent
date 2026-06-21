# VRM / GLB モデル

CharaTomo-Web と同系の GLB をここに配置します。

| 性別 | ファイル名 |
|------|------------|
| 男性 | `8329890252317737768.glb` |
| 女性 | `8590256991748008892.glb` |

## セットアップ

```bash
npm run setup:vrm-models
# または
bash scripts/setup-vrm-models.sh
```

ソース: `AIxR-CharaTomo-Web/src/static/models/`

**未配置時**: Vite が `/models/*.glb` に HTML を返し 3D 読込が失敗 → 2D SVG フォールバック表示。

## Docker / CI

イメージビルド前に `setup-vrm-models.sh` を実行するか、CI キャッシュからコピーしてください。

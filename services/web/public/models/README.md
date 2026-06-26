# VRM / GLB モデル

CharaTomo-Web と同系の GLB をここに配置します。

| 性別 | ファイル名 | モデル名 |
|------|------------|----------|
| 男性 | `8329890252317737768.glb` | AvatarSample_C |
| 女性 | `8590256991748008892.glb` | AvatarSample_A |

## ライセンス・出典

3D アバターは **VRoid Project** の VRoid Hub サンプルモデルです（GLB 内 VRM メタデータより）。

| 項目 | 内容 |
|------|------|
| 作者 | VRoid Project |
| 利用条件 | 法人利用可・改変可・再配布可・**クレジット表記不要** |
| 参照 | [VRoid Hub 利用条件](https://hub.vroid.com/license?allowed_to_use_user=everyone&characterization_allowed_user=everyone&corporate_commercial_use=allow&credit=unnecessary&modification=allow&personal_commercial_use=profit&redistribution=allow&sexual_expression=allow&version=1&violent_expression=allow) |

UI 上へのクレジット表示は不要です。リポジトリ内の出典記載のみ行っています。

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

# ENH-UI-01 — VRM 品質・表示修正

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-UI-01 |
| **ユニット** | `unit-web-ui` |
| **種別** | Enhancement（Code Generation 後の polish） |
| **参照実装** | `AIxR-CharaTomo-Web/src/static/js/vrm-viewer.js` |
| **状態** | ✅ 完了（2026-06-21） |

## 背景

初回 Code Generation で VRM 表示基盤（Tailwind UI + AvatarCanvas + 男女選択）は実装済みだったが、ローカル検証で以下の問題が判明した。

1. **GLB 未配置** — `public/models/*.glb` がなく、Vite SPA フォールバックが HTML を返して読込失敗
2. **T ポーズ** — 腕が水平のまま表示され不自然
3. **髪の逆立ち** — 表示直後 SpringBone が未収束で髪が逆立ち、しばらくして落ち着く
4. **人間らしさ不足** — 瞬き・首の idle が未実装（CharaTomo 比）
5. **ライティング暗い** — キャラが暗く見える

## ユーザー要求（原文要約）

> 読み込まれたが、表示時に髪が逆立っていてしばらくすると落ち着く。T ポーズで不自然なポーズ。CharaTomo のように自然に立ち、時折瞬きしたり少し動いたりして人間らしさを出したい。ライティングも暗い。

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-VRM-01 | GLB を `scripts/setup-vrm-models.sh` で CharaTomo からコピー可能 | ✅ |
| AC-VRM-02 | GLB 未配置時は 2D フォールバック（README に原因記載） | ✅ |
| AC-VRM-03 | 表示時 T ポーズではなく腕を下ろした自然な立ち姿 | ✅ |
| AC-VRM-04 | ローディング完了時点で髪が逆立っていない（SpringBone ウォームアップ） | ✅ |
| AC-VRM-05 | idle: 首のゆっくりした揺れ（モデル全体回転はしない） | ✅ |
| AC-VRM-06 | ランダム間隔の瞬き（`blink` 表情） | ✅ |
| AC-VRM-07 | 応答時 lip-sync（`aa`）— 既存仕様維持 | ✅ |
| AC-VRM-08 | 暖色ライト 4 灯で CharaTomo より明るく表示 | ✅ |
| AC-VRM-09 | LookAt 無効化、目ボーン固定（勝手に目が動かない） | ✅ |
| AC-VRM-10 | `npm run build` 成功 | ✅ |
| AC-VRM-11 | レイアウト変更時 `resetLayout` で aspect + カメラ復元 | ✅ ENH-UI-05 |

## スコープ外

- STT/TTS、新 VRM モデル作成
- Kebbi 実機連携
- 先生画面への VRM 追加

## 実装ファイル

| パス | 変更内容 |
|------|----------|
| `services/web/src/avatar/VrmViewer.ts` | CharaTomo 相当 idle / 腕ポーズ / 瞬き / ライト / SpringBone warmup / **resetLayout** |
| `services/web/src/avatar/useVrmAvatar.ts` | gender 単一 effect、loading オーバーレイ、**レイアウト監視** |
| `services/web/src/avatar/AvatarCanvas.tsx` | 読込中オーバーレイ |
| `scripts/setup-vrm-models.sh` | CharaTomo GLB コピー |
| `scripts/dev-stack.sh` | GLB 欠落時 auto setup |
| `services/web/public/models/README.md` | 未配置時のトラブルシュート |

## NFR 影響

| ID | 内容 |
|----|------|
| NFR-UI-02 | 男女切替時 reload 維持 |
| NFR-UI-13（新規） | 初回 `loadVRM` に同期 warmup ~90 フレーム（~1.5s CPU）；ローディング UI で隠蔽 |

## 検証

- 手動: `npm run dev:stack` → `/child` → 男女切替・表示・瞬き・口パク
- 自動: `npm run build`；E2E は canvas 存在確認（11/11 維持）

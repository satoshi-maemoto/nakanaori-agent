# ENH-UI-01 — 実装サマリー

## CharaTomo → Nakanaori 移植マッピング

| CharaTomo `vrm-viewer.js` | Nakanaori `VrmViewer.ts` |
|-----------------------------|--------------------------|
| `setNaturalArmPose()` | `setNaturalArmPose()` → `maintainArmPose()` |
| `maintainArmPose()` | 毎フレーム `vrm.update()` 後に実行 |
| `updateIdleAnimation()` | 首 Y/Z ターゲット（sin 波、3s 後開始） |
| `updateSmoothNeckMovement()` | lerp で neck.rotation 適用 |
| `updateBlink()` | `expressionManager.setValue('blink', …)` |
| `lookAt.enabled = false` | `lookAt.autoUpdate = false`（three-vrm v3 API） |
| 目ボーン quaternion 固定 | `saveEyeDefaults()` + `fixEyeBones()` |
| カメラ・モデル位置固定 | `lockTransform()` |
| （暗い）ambient 0.15 + key 0.7 | 暖色 ambient 0.55 + key 1.0 + fill + rim |
| — | `warmupSpringBones()` 90 フレーム @ 1/60s（新規） |

## レンダーループ順序

```text
updateIdleAnimation(dt)
  → lip-sync (if speaking)
  → vrm.update(dt)
  → lookAt.autoUpdate = false
  → fixEyeBones()
  → maintainArmPose()
  → lockTransform()
  → updateSmoothNeckMovement(dt)
  → updateBlink(dt)
  → render
```

**意図的に削除**: 初回 Code Gen にあった `modelRoot.rotation.y` の全体回転 sway（バストアップ表示を崩すため）。

## 腕ポーズ（normalized human bones）

| ボーン | 回転 |
|--------|------|
| leftUpperArm | `(0, 0, π/2)` |
| rightUpperArm | `(0, 0, -π/2)` |
| lowerArm / shoulder | `(0, 0, 0)` |

## ライティング

| ライト | 色 | 強度 | 位置 |
|--------|-----|------|------|
| Ambient | `0xfff5e6` | 0.55 | — |
| Key | `0xfff8f0` | 1.0 | `(0.4, 1.6, 1.4)` |
| Fill | `0xffffff` | 0.35 | `(-0.8, 0.8, 0.6)` |
| Rim | `0xfff0e0` | 0.2 | `(0, 0.5, -1)` |

## SpringBone ウォームアップ

- 定数: `SPRING_WARMUP_FRAMES = 90`
- タイミング: `loadVRM()` 内、シーン追加後・ローディング UI 表示中
- 各フレーム: `maintainArmPose()` → `vrm.update(1/60)`
- `useVrmAvatar` は `loadVRM` Promise 解決まで `loading: true` → ユーザーは逆立ちを見ない

## GLB 資産

```bash
npm run setup:vrm-models
# CHARATOMO_MODELS でソースディレクトリ上書き可
```

`dev-stack.sh` は GLB 欠落時に自動実行。

## 既知の制限

- warmup は同期ループのため低スペック端末で初回表示が ~1.5s 遅延する可能性
- `blink` / `aa` プリセットがモデルに無い場合は try/catch で無視
- visibilitychange による rAF 停止は未移植（Phase 2 候補）

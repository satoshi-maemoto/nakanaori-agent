# Kebbi 開発・デモガイド

Nuwa Kebbi 実機で **ナカナオリ・エージェント** を動かすための手順と、ここまでの実装で判明した注意点。

## リポジトリ構成

| リポジトリ | 役割 |
|-----------|------|
| **nakanaori-agent**（本 repo） | API・Web・TTS・契約 `clients/kebbi/api-contract.md` |
| **nakanaori-kebbi**（private sibling） | Android クライアント `com.nakanaori.kebbi` |

参照実装: [AIxR-CharaTomo-Kebbi](https://github.com/SystemFriend/AIxR-CharaTomo-Kebbi)（Nuwa ASR/TTS パターン）。CharaTomo の `POST /api/v1/llm/chat` は **使わない**。

## クイックスタート

### 1. API + Web（Mac）

```bash
cd nakanaori-agent
cp .env.example .env          # GEMINI_API_KEY
# TTS を使う場合: docs/google-cloud-tts-setup.md
bash scripts/dev-stack.sh     # :8080
```

Mac の LAN IP を確認（例 `en0`）:

```bash
ipconfig getifaddr en0
# → 192.168.11.4 など
```

### 2. Kebbi ビルド・デプロイ

USB で Kebbi を接続し:

```bash
# nakanaori-agent から
bash scripts/kebbi-deploy.sh

# または nakanaori-kebbi から
bash scripts/kebbi-deploy.sh
```

`NAKANAORI_KEBBI_ROOT` で sibling パスを上書き可能。

### 3. Kebbi 設定

1. 設定を開く（下の **⚙ 設定をひらく**、ロボットの頭タップ、または音声で「設定」）
2. **API URL** に PC の LAN IP を入れる（例 `http://192.168.11.4:8080`）
3. **保存** → **← もどる**
4. メイン画面で `API に 接続中… http://192.168.x.x:8080` と表示されセッションが再開する

接続確認（任意）:

```bash
adb shell curl -s -o /dev/null -w '%{http_code}' http://192.168.11.4:8080/health
# 200 が返れば OK
```

## VS Code / Cursor

`nakanaori-agent/.vscode/launch.json`（または `nakanaori-kebbi/.vscode/launch.json`）:

| 構成 | 用途 |
|------|------|
| **Kebbi: Build & Deploy** | ビルド・インストール・起動 |
| **Kebbi: Deploy + Nakanaori Dev Stack** | API+Web と Kebbi を同時 |
| **Kebbi: Deploy + Logcat** | デプロイ後 logcat 追跡 |
| **Kebbi: Logcat (follow)** | `NakanaoriKebbi` タグのみ |
| **Kebbi: App status** | プロセス起動確認 |

CLI:

```bash
bash scripts/kebbi-status.sh
bash scripts/kebbi-logcat.sh
bash scripts/kebbi-logcat-clear.sh
```

## 画面と Nuwa 顔表示

Kebbi では Nuwa SDK の `showFace()` が **ロボット表示を前面に出す** ため、Android の設定画面が裏に隠れることがある。

実装方針（`nakanaori-kebbi`）:

- 設定画面表示中は `hideFace()` + `hideWindow(true)` を呼ぶ
- `NuwaSession.isSettingsScreenVisible` が true の間は `showFace()` を抑制（TTS 再生中も）
- ロボットサービス接続直後は顔を出さず、**セッション確立後**に表示
- 設定から戻ったら保存済み URL でセッションを再試行

## API URL の注意

| URL | 結果 |
|-----|------|
| `http://127.0.0.1:8080` | ❌ Kebbi 自身を指す（PC の API に届かない） |
| `http://localhost:8080` | ❌ 同上 |
| `http://192.168.x.x:8080` | ✅ 同一 LAN の Mac で `dev-stack` 起動時 |

`ApiUrlValidator` が localhost を検出すると設定画面を開き、ロボット音声で設定を促す。設定は `SharedPreferences`（`nakanaori_kebbi_settings.xml`）に `commit()` で保存。

**保存後に 127.0.0.1 のままエラーが残る場合** — 以前は設定保存後に `startSession()` が再実行されなかった。現在は設定画面から戻ると `pendingSettingsRetry` で再接続する。

## 音声パイプライン

```text
子ども発話 → Nuwa クラウド ASR（端末）
          → POST /v1/sessions/{id}/child-turn
          → agent_message
          → POST /v1/tts/synthesize（Google Cloud TTS、API 側）
          → ExoPlayer 再生（Kebbi）
          → 失敗時 Nuwa ロボ TTS フォールバック
```

- TTS 再生中はマイク停止、終了 500ms 後に ASR 再開（CharaTomo-Web と同様）
- Web UI は男女ロボ別ボイス（`packages/tts` の `gender`）。Kebbi は中性的 1 声

TTS 認証（API 側）: [google-cloud-tts-setup.md](./google-cloud-tts-setup.md)

## デモ手順（消しゴム台本）

台本: [examples/eraser-story-dialogue.md](./examples/eraser-story-dialogue.md)

1. Mac で `dev-stack`、Kebbi 設定で LAN API URL
2. Kebbi A: 設定で **1回め（A）** → 起動 → ウェルカム後に話す → 「おわり」
3. Kebbi B: **2回め（B）** → 別端末は新規セッション（または先生 Web と連携）
4. 先生 Web `http://localhost:5173/teacher` でブリーフ確認

長押し（頭センサー）でセッション再試行。

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 起動後なにも起きない | API が `127.0.0.1` のまま | 設定で LAN IP を保存し「もどる」 |
| 設定を保存しても 127.0.0.1 エラー | 旧ビルド（再接続なし） | 最新 APK を `kebbi-deploy.sh` で入れ直す |
| 設定画面が見えない | Nuwa 顔が前面 | 頭タップ or 下の設定ボタン（顔は自動で hide） |
| API 接続失敗 | Mac ファイアウォール / 別ネットワーク | 同一 Wi‑Fi、`curl` で実機から `/health` 確認 |
| TTS 無音 | API に Google 認証未設定 | `google-cloud-tts-setup.md`、または Nuwa TTS フォールバックを確認 |
| Gradle ビルド失敗 | SDK パス / Kotlin 競合 | `local.properties`、`gradle.properties` の `android.builtInKotlin=false` |
| マイクが効かない | 権限未許可 | 初回起動時の許可ダイアログを承認 |

ログ:

```bash
bash scripts/kebbi-logcat.sh
# AppLog → logcat タグ NakanaoriKebbi
```

設定の実値確認:

```bash
adb shell run-as com.nakanaori.kebbi cat shared_prefs/nakanaori_kebbi_settings.xml
```

## 契約・同期

API 変更時:

1. `clients/kebbi/api-contract.md` を更新
2. `nakanaori-kebbi` の `NakanaoriApi.kt` / `TtsApi.kt` を適応
3. 結合テスト: [integration-test-instructions.md](../aidlc-docs/construction/build-and-test/integration-test-instructions.md)

## 関連ドキュメント

- [clients/kebbi/README.md](../clients/kebbi/README.md) — 連携方針
- [clients/kebbi/api-contract.md](../clients/kebbi/api-contract.md) — REST 契約
- [demo-scenario.md](./demo-scenario.md) — ハッカソンデモ台本
- [devops.md](./devops.md) — CI / ローカル開発

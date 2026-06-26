# Kebbi 開発・デモガイド

Nuwa Kebbi 実機で **ナカナオリ・エージェント** を動かすための手順と、ここまでの実装で判明した注意点。

## リポジトリ構成

| リポジトリ | 役割 |
|-----------|------|
| **nakanaori-agent**（本 repo） | API・Web・TTS・契約 `clients/kebbi/api-contract.md` |
| **nakanaori-kebbi**（sibling） | Android クライアント `com.nakanaori.kebbi`（`$NAKANAORI_KEBBI_ROOT`） |

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
# ステージング（既定）— Cloud Run API
bash scripts/kebbi-deploy.sh
# または
bash scripts/kebbi-deploy.sh staging

# ローカル dev-stack（Mac の LAN IP :8080）
bash scripts/dev-stack.sh   # 別ターミナル
bash scripts/kebbi-deploy.sh local
```

**接続先だけ切り替える**（APK 再インストールなし）:

```bash
bash scripts/kebbi-use-staging.sh   # Cloud Run
bash scripts/kebbi-use-local.sh     # LAN（dev-stack 起動中）
```

設定は [config/kebbi-targets.env](../config/kebbi-targets.env) と `.env` の `KEBBI_TARGET` で上書き可能。ステージング Web URL から API URL（`nakanaori-web` → `nakanaori-api`）を自動導出します。

`NAKANAORI_KEBBI_ROOT` で sibling パスを上書き可能。

### 3. Kebbi 設定（手動）

設定画面の開き方（優先順）:

| 方法 | 操作 |
|------|------|
| **画面下ボタン** | 「⚙ 設定を ひらく」（顔 UI の外・常に表示） |
| **胸（お腹）タップ** | ロボット本体の胸センサー（短押し） |
| **画面上部バー 3回タップ** | 黒いステータス領域を素早く 3回 |
| **音声** | 「設定」「せってい」（マイク待ち中） |
| **Mac から adb** | `bash scripts/kebbi-open-settings.sh` |

胸の **長押し** は設定ではなく **セッションやり直し** です。  
**頭・顔タップ** はセッション中 **次の番（head-pet）** 用で、設定には開きません。

Kebbi アプリの設定画面には **ステージング（Cloud Run）** プリセットもあります。

手動で URL を変える場合:

1. 上記いずれかで設定を開く
2. **API URL** に接続先を入れる（または「ステージング」プリセット）
   - ステージング: `https://nakanaori-api-370062202060.asia-northeast1.run.app`
   - ローカル: PC の LAN IP（例 `http://192.168.11.4:8080`）
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

Kebbi では Nuwa SDK の `showFace()` が **ロボット表示を前面に出す** ため、Android UI が隠れることがある。

実装方針（`nakanaori-kebbi`）:

- **設定バー**（画面下）は `facePlaceholder`（頭なで用タッチ）の外に配置し、常にタップ可能
- 設定画面表示中は `hideFace()` + `hideWindow(true)` を呼ぶ
- `NuwaSession.isSettingsScreenVisible` が true の間は `showFace()` を抑制（TTS 再生中も）
- 胸センサー短押し / 上部バー3回タップ / `kebbi-open-settings.sh` でも設定を開ける
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
- **Kebbi**: `options.profile: "kebbi_child"` → `Chirp3-HD-Callirrhoe`（rate 1.08；Web の `gender` 男女声とは独立）
- **Web**: 男女ロボ別ボイス — female=`Zephyr`、male=`Rasalgethi`（`packages/tts` の `gender`）

TTS 認証（API 側）: [google-cloud-tts-setup.md](./google-cloud-tts-setup.md)

## Kebbi 子ども向け体験（音声操作）

### セッション作成

`POST /v1/sessions` に `"client": "kebbi"` を含める（`NakanaoriApi.kt`）。  
これにより名前登録後の案内が **「あたまを なでてね」** になり、Web 用の「番を おわる」案内は出ない。

### 声（Google TTS）

Kebbi は `TtsApi.kt` から `options.profile: "kebbi_child"` を送信。サーバー側 `kebbiChildProfile()`（`Chirp3-HD-Callirrhoe` + rate 1.08）が適用される。Web の `gender: male/female` には影響しない。

### 番交代（頭をなでる）

| 段階 | 子ども | ロボット |
|------|--------|----------|
| 名前登録後 | — | 「…話し終わったら、**あたまを なでてね**」（`client: kebbi`） |
| 話し終わり（任意） | 「話し終わった」「おわった」 | 同上を 促す TTS |
| 番を変える | **頭をなでる** | `finish_turn: true` |
| まだ話す | 「まだ」「まだ話す」 | 続けて聞く |

実装: `TurnVoiceController.onHeadPetted()` + `NuwaSpeechHelper.onHeadPetted`

### 手のふれあい

ウェルカム（または番替わり）後:

1. **腕を前に出す**（Kebbi 視点: 1回め A → 右腕 / 2回め B → 左腕）
2. 「**この手を にぎって 話しても いいよ。**」と TTS
3. 差し出した手を **長押し** すると joy 反応（任意・握らなくてもよい）
4. **長押し中**（`startHandHoldListening`）: 首を手の方向へ傾け、固定スマイル + 聞き取り中の首の subtle 動き
5. **手を離す** と首を中央に戻し、通常の顔表情に復帰（ENH-KEBBI-03）

頭・顔タップ／なでる → 番交代（head-pet）。**胸（お腹）短押し** → 設定画面。**胸長押し** → セッションやり直し。手タップは設定に使わない。

### しゃべり中の動き

- 首・肩の random walk を強化（`NuwaSpeechHelper`）
- TTS 中に低確率で `playFaceAnimation("joy")`

## デモ手順（順番取り合い台本）

台本: [examples/turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md)

### staging API（既定）

```bash
bash scripts/kebbi-deploy.sh              # staging API を adb 設定 + APK
# 設定変更: kebbi-open-settings.sh / 画面下ボタン / 胸タップ / 上バー3回タップ
```

### ローカル API

1. Mac で `bash scripts/dev-stack.sh`
2. `bash scripts/kebbi-deploy.sh local`（または設定で LAN API URL）
3. Kebbi: ウェルカム → 名前 → 話す → **頭をなでる** で番交代
4. 子B の番: 手の案内 → 話す → **頭をなでる** → 終了メッセージ
5. 先生 Web `http://localhost:5173/teacher` でブリーフ確認

**胸長押し**でセッション再試行。

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 起動後なにも起きない | API が `127.0.0.1` のまま / staging 未設定 | `kebbi-use-staging.sh` または設定で URL 保存→「もどる」 |
| 設定を保存しても 127.0.0.1 エラー | 旧ビルド（再接続なし） | 最新 APK を `kebbi-deploy.sh` で入れ直す |
| 設定画面が開けない | Nuwa 顔が前面 / 胸センサー不調 | **画面下「⚙ 設定をひらく」**（常時表示）· 上バー3回タップ · `kebbi-open-settings.sh` |
| TTS 503 / 無音（staging） | `GOOGLE_TTS_CREDENTIALS_JSON` 未注入 | Secret Manager 登録 + 再デプロイ（[google-cloud-tts-setup.md](./google-cloud-tts-setup.md)） |
| API 接続失敗 | Mac ファイアウォール / 別ネットワーク / staging 障害 | 同一 Wi‑Fi、`curl` / `kebbi-use-staging.sh` |
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

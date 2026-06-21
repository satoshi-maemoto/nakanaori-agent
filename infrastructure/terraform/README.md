# Terraform（任意）

`gcloud run deploy` を超える GCP リソースの Infrastructure-as-Code。

計画リソース:

- Cloud Run サービス（api、web）
- Secret Manager（`GEMINI_API_KEY`）
- Firestore データベース（in-memory MVP を使わない場合）
- IAM サービスアカウント

ハッカソン MVP では `infrastructure/cloud-run/` と GitHub Actions デプロイ workflow を使用。

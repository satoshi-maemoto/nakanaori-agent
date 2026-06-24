import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { resolveGoogleApplicationCredentials } from "@nakanaori/tts";

/** リポジトリルートまたは services/api の .env を読み込む（存在する場合のみ） */
function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), ".env"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path });
      resolveGoogleApplicationCredentials();
      return;
    }
  }
}

loadEnvFiles();

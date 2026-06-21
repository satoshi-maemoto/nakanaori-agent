#!/usr/bin/env bash
# Re-download latest AI-DLC rules from awslabs/aidlc-workflows releases.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_ZIP="/tmp/aidlc-rules.zip"
TMP_DIR="/tmp/aidlc-release"

URL=$(curl -sL https://api.github.com/repos/awslabs/aidlc-workflows/releases/latest \
  | grep -o '"browser_download_url": *"[^"]*ai-dlc-rules[^"]*"' \
  | head -1 \
  | cut -d'"' -f4)

if [[ -z "$URL" ]]; then
  echo "Failed to resolve release URL"
  exit 1
fi

echo "Downloading $URL"
curl -sL -o "$TMP_ZIP" "$URL"
rm -rf "$TMP_DIR"
unzip -o "$TMP_ZIP" -d "$TMP_DIR"

cp -R "$TMP_DIR/aidlc-rules/aws-aidlc-rule-details" "$ROOT/.aidlc-rule-details.new"
rm -rf "$ROOT/.aidlc-rule-details"
mv "$ROOT/.aidlc-rule-details.new" "$ROOT/.aidlc-rule-details"

# Preserve Nakanaori ethics extension
if [[ -d "$ROOT/.aidlc-rule-details/extensions/child-safety/nakanaori" ]]; then
  echo "Nakanaori ethics extension preserved"
fi

mkdir -p "$ROOT/.cursor/rules"
{
  echo '---'
  echo 'description: "AI-DLC (AI-Driven Development Life Cycle) adaptive workflow for software development"'
  echo 'alwaysApply: true'
  echo '---'
  echo ''
  cat "$TMP_DIR/aidlc-rules/aws-aidlc-rules/core-workflow.md"
} > "$ROOT/.cursor/rules/ai-dlc-workflow.mdc"

rm -rf "$TMP_ZIP" "$TMP_DIR"
echo "AI-DLC rules updated. Review Nakanaori extension in .aidlc-rule-details/extensions/child-safety/nakanaori/"

#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/static/fonts"; mkdir -p "$DEST"
UA="MoonlitGrimoire/1.0"
# Aktura 400 (display) + Sentient 400/500 (body). The API returns @font-face CSS
# with cdn.fontshare.com woff2 URLs; extract and download them.
# Note: Fontshare returns protocol-relative URLs (//cdn.fontshare.com/...)
for q in "aktura@400" "sentient@400,500"; do
  css=$(curl -sS -A "$UA" "https://api.fontshare.com/v2/css?f[]=${q}&display=swap")
  # Match both https: and protocol-relative // URLs ending in .woff2
  echo "$css" | grep -oE '[a-z]*://[^)]+\.woff2|//[^)]+\.woff2' | while read -r url; do
    # Ensure https prefix
    case "$url" in
      //*) url="https:$url" ;;
    esac
    fn=$(basename "${url%%\?*}")
    curl -sS -A "$UA" -o "$DEST/$fn" "$url"
    echo "downloaded $fn"
  done
done
ls -1 "$DEST"

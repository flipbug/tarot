#!/usr/bin/env bash
# Fetch the public-domain Rider-Waite-Smith deck (Pamela Colman Smith, 1909)
# from Wikimedia Commons into static/cards/<card-id>.jpg.
# Idempotent: already-downloaded, non-empty files are skipped.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/static/cards"
UA="MoonlitGrimoire/1.0 (educational tarot study app; contact: local dev)"
mkdir -p "$DEST"

# Optional cooldown to let a Wikimedia rate-limit (429) window reset.
# Override pacing/cooldown with env vars: COOLDOWN=180 PACE=5 bash scripts/fetch-art.sh
if [ -n "${COOLDOWN:-}" ]; then echo "Cooldown ${COOLDOWN}s (rate-limit reset)..."; sleep "$COOLDOWN"; fi

dl() { # dl <card-id> <wikimedia-filename>
  local id="$1" file="$2" out="$DEST/$1.jpg"
  if [ -s "$out" ]; then echo "skip $id"; return; fi
  # Pull from the upload.wikimedia.org CDN via the md5-derived path
  # (commons stores files at /commons/<h0>/<h0h1>/<filename>); this endpoint
  # is cached and far less rate-limited than Special:FilePath.
  local h; h=$(md5 -qs "$file")
  local url="https://upload.wikimedia.org/wikipedia/commons/${h:0:1}/${h:0:2}/${file}"
  local code
  for attempt in 1 2 3 4 5 6; do
    code=$(curl -sS -L -o "$out" -w "%{http_code}" --max-time 120 -A "$UA" "$url")
    if [ "$code" = "200" ] && [ -s "$out" ]; then
      echo "ok   $id ($(wc -c < "$out" | tr -d ' ') bytes)"; sleep "${PACE:-10}"; return
    fi
    rm -f "$out"
    if [ "$code" = "429" ]; then
      echo "  $id rate-limited (try $attempt); waiting ${RA:-600}s for window reset"; sleep "${RA:-600}"
    else
      echo "  $id http $code (try $attempt); waiting 20s"; sleep 20
    fi
  done
  echo "FAIL $id <- $url"
}

# ---- Major Arcana (22) ----
dl the-fool            "RWS_Tarot_00_Fool.jpg"
dl the-magician        "RWS_Tarot_01_Magician.jpg"
dl the-high-priestess  "RWS_Tarot_02_High_Priestess.jpg"
dl the-empress         "RWS_Tarot_03_Empress.jpg"
dl the-emperor         "RWS_Tarot_04_Emperor.jpg"
dl the-hierophant      "RWS_Tarot_05_Hierophant.jpg"
dl the-lovers          "RWS_Tarot_06_Lovers.jpg"
dl the-chariot         "RWS_Tarot_07_Chariot.jpg"
dl strength            "RWS_Tarot_08_Strength.jpg"
dl the-hermit          "RWS_Tarot_09_Hermit.jpg"
dl wheel-of-fortune    "RWS_Tarot_10_Wheel_of_Fortune.jpg"
dl justice             "RWS_Tarot_11_Justice.jpg"
dl the-hanged-man      "RWS_Tarot_12_Hanged_Man.jpg"
dl death               "RWS_Tarot_13_Death.jpg"
dl temperance          "RWS_Tarot_14_Temperance.jpg"
dl the-devil           "RWS_Tarot_15_Devil.jpg"
dl the-tower           "RWS_Tarot_16_Tower.jpg"
dl the-star            "RWS_Tarot_17_Star.jpg"
dl the-moon            "RWS_Tarot_18_Moon.jpg"
dl the-sun             "RWS_Tarot_19_Sun.jpg"
dl judgement           "RWS_Tarot_20_Judgement.jpg"
dl the-world           "RWS_Tarot_21_World.jpg"

# ---- Minor Arcana (56) ----
suits=("wands:Wands" "cups:Cups" "swords:Swords" "pentacles:Pents")
ranks=("ace:01" "two:02" "three:03" "four:04" "five:05" "six:06" "seven:07" \
       "eight:08" "nine:09" "ten:10" "page:11" "knight:12" "queen:13" "king:14")
for s in "${suits[@]}"; do
  sid="${s%%:*}"; sname="${s##*:}"
  for r in "${ranks[@]}"; do
    rid="${r%%:*}"; rnn="${r##*:}"
    dl "${rid}-of-${sid}" "${sname}${rnn}.jpg"
  done
done

count="$(ls -1 "$DEST"/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "----"
echo "Downloaded $count/78 card images into static/cards/"

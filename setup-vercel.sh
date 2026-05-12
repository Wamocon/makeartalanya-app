#!/bin/bash
# ============================================================
# Vercel Environment Variables Setup Script
# Make Art Studio – makeartalanya.com
#
# Usage:
#   1. Get your Vercel API token from:
#      https://vercel.com/account/tokens  → Create Token
#   2. Set the token below OR pass as env var: VERCEL_TOKEN=xxx ./setup-vercel.sh
#   3. Run: bash setup-vercel.sh
# ============================================================

VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_PROJECT_NAME="makeartalanya-app"
VERCEL_TEAM=""  # Leave empty if personal account

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌  Error: VERCEL_TOKEN is not set."
  echo "   Get it from: https://vercel.com/account/tokens"
  echo "   Then run: VERCEL_TOKEN=your_token bash setup-vercel.sh"
  exit 1
fi

echo "🚀 Setting Vercel environment variables for project: $VERCEL_PROJECT_NAME"

# ── Helper function ──────────────────────────────────────────
add_env() {
  local key="$1"
  local value="$2"
  local target="${3:-production preview development}"

  TARGET_ARRAY=()
  for env in $target; do
    TARGET_ARRAY+=("\"$env\"")
  done
  TARGETS=$(IFS=,; echo "${TARGET_ARRAY[*]}")

  TEAM_PARAM=""
  if [ -n "$VERCEL_TEAM" ]; then
    TEAM_PARAM="&teamId=$VERCEL_TEAM"
  fi

  RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_NAME/env?$TEAM_PARAM" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"type\": \"plain\",
      \"target\": [$TARGETS]
    }")

  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "  ✅  $key"
  else
    echo "  ⚠️   $key — $(echo $RESPONSE | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get(\"error\",{}).get(\"message\",\"unknown error\"))')"
  fi
}

# ── Environment Variables ────────────────────────────────────
add_env "NEXT_PUBLIC_SUPABASE_URL"      "https://vnldsyjkhofofellwuiq.supabase.co"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "sb_publishable_s5Bwenh9Hb7egmyahBswLg_1Qdw8uWe"
add_env "SUPABASE_DB_PASSWORD"          "***REMOVED***"  "production"
add_env "NEXT_PUBLIC_SITE_URL"          "https://makeartalanya.com"
add_env "NEXT_PUBLIC_DEFAULT_LOCALE"    "tr"

echo ""
echo "✅  Done. Redeploy your Vercel project to apply changes:"
echo "   vercel --prod  (or push to your main branch)"

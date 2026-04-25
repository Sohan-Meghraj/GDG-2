#!/usr/bin/env bash
set -euo pipefail

PROJECT="vibecare-494412"
SERVICE="eventconnect"
REGION="asia-south1"

GEMINI_API_KEY="AIzaSyCWs3JglaMl6cAvUTDqpVe0vw20m9d04SQ"

echo "==> Setting project to $PROJECT"
gcloud config set project "$PROJECT"

echo "==> Deploying $SERVICE to Cloud Run ($REGION) — single-step, source build"
echo "    Takes 5-10 min. Do NOT press Ctrl-C."
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}"

echo
echo "==> Done. Cloud Run URL printed above."

#!/usr/bin/env bash
set -euo pipefail

PROJECT="vibecare-494412"
SERVICE="eventconnect"
REGION="asia-south1"

echo "==> Setting project to $PROJECT"
gcloud config set project "$PROJECT"

echo "==> Deploying $SERVICE to Cloud Run ($REGION)"
echo "    This will take 5-7 min on first build. Do NOT press Ctrl-C."
echo

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://afxqwpaolvaccbguxzdj.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeHF3cGFvbHZhY2NiZ3V4emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTYwODEsImV4cCI6MjA5MjY5MjA4MX0.xiwFgXtPIPJBZv73XO3Y-gdggr6nu0a0PKQJItjgdk0,GEMINI_API_KEY=AIzaSyCWs3JglaMl6cAvUTDqpVe0vw20m9d04SQ"

echo
echo "==> Done. Cloud Run URL printed above."

#!/usr/bin/env bash
set -euo pipefail

PROJECT="vibecare-494412"
SERVICE="eventconnect"
REGION="asia-south1"

SUPABASE_URL="https://afxqwpaolvaccbguxzdj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeHF3cGFvbHZhY2NiZ3V4emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTYwODEsImV4cCI6MjA5MjY5MjA4MX0.xiwFgXtPIPJBZv73XO3Y-gdggr6nu0a0PKQJItjgdk0"
GEMINI_API_KEY="AIzaSyCWs3JglaMl6cAvUTDqpVe0vw20m9d04SQ"

IMAGE="asia-south1-docker.pkg.dev/${PROJECT}/cloud-run-source-deploy/${SERVICE}:latest"

echo "==> Setting project to $PROJECT"
gcloud config set project "$PROJECT"

echo "==> Building image (Cloud Build, with NEXT_PUBLIC_* baked in at build time)"
echo "    This takes 5-7 min. Do NOT press Ctrl-C."
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="_NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL},_NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  --region="$REGION" \
  .

echo "==> Deploying $SERVICE to Cloud Run ($REGION)"
gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --region="$REGION" \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL},NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY},GEMINI_API_KEY=${GEMINI_API_KEY}"

echo
echo "==> Done. Cloud Run URL printed above."

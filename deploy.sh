#!/bin/bash

# VoiceFlow Text to Speech - Deployment Script
# Usage: ./deploy.sh [vercel|netlify]

set -e

PROJECT_NAME="37-tool-text-to-speech"

case "${1:-vercel}" in
  vercel)
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
    ;;
  netlify)
    echo "🚀 Deploying to Netlify..."
    npx netlify deploy --prod --dir=dist
    ;;
  *)
    echo "Usage: ./deploy.sh [vercel|netlify]"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"
echo "🌐 Live URL will be provided by the deployment platform."

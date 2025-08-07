#!/bin/bash

# Cloudflare Pages Deployment Script for MoeTV

echo "🚀 Starting MoeTV deployment to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy .next --project-name=moetv

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "🌍 Your site should be available at: https://moetv.pages.dev"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

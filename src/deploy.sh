#!/bin/bash

# 快速部署脚本 - Vercel
# 使用方法: ./deploy.sh

echo "🚀 ARLook RAG - 快速部署到 Vercel"
echo "=================================="
echo ""

# 检查是否已安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel..."
    vercel login
fi

# 部署
echo ""
echo "📤 开始部署..."
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "⚠️  重要提醒："
echo "1. 在 Vercel Dashboard 设置环境变量："
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - OPENAI_API_KEY"
echo "2. 更新 Google Maps API 的 HTTP referrers 限制"
echo "3. 访问你的网站测试功能"
echo ""

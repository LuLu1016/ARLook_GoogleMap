#!/bin/bash
set -e

echo "🚀 ARLook RAG - 快速部署到 Vercel"
echo "===================================="
echo ""

# 检查登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 需要登录 Vercel..."
    vercel login
fi

echo "✅ 当前用户: $(vercel whoami)"
echo ""

# 检查项目是否已链接
if [ ! -f .vercel/project.json ]; then
    echo "📎 链接项目到 Vercel..."
    vercel link --yes
fi

# 读取环境变量
if [ ! -f .env.local ]; then
    echo "❌ 错误: .env.local 文件不存在"
    exit 1
fi

source .env.local

# 设置环境变量
echo "📝 设置环境变量到 Vercel..."
echo ""

if [ -z "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ]; then
    echo "⚠️  警告: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 未设置"
else
    echo "  设置 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY..."
    echo "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production 2>/dev/null || true
    echo "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY preview 2>/dev/null || true
    echo "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" | vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY development 2>/dev/null || true
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  警告: OPENAI_API_KEY 未设置"
else
    echo "  设置 OPENAI_API_KEY..."
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production 2>/dev/null || true
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY preview 2>/dev/null || true
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY development 2>/dev/null || true
fi

echo ""
echo "🚀 部署到生产环境..."
vercel --prod --yes

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 下一步："
echo "1. 访问 Vercel Dashboard 查看部署状态"
echo "2. 在 Deployments 页面点击 'Visit' 获取网站链接"
echo "3. 更新 Google Maps API 限制（添加 *.vercel.app）"
echo ""

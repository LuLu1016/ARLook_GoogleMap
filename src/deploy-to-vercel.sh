#!/bin/bash

# Vercel 自动部署脚本
# 使用方法: ./deploy-to-vercel.sh

echo "🚀 ARLook RAG - 自动部署到 Vercel"
echo "===================================="
echo ""

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查登录状态
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  未登录，请先登录..."
    vercel login
fi

# 显示当前登录用户
echo ""
echo "✅ 当前登录用户:"
vercel whoami

# 检查环境变量
echo ""
echo "📋 检查环境变量配置..."
if [ ! -f .env.local ]; then
    echo "⚠️  警告: .env.local 文件不存在"
    echo "   请先创建 .env.local 并添加 API keys"
    exit 1
fi

# 提取环境变量（不显示实际值）
if grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local && grep -q "OPENAI_API_KEY" .env.local; then
    echo "✅ 环境变量文件存在"
    echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 已设置"
    echo "   - OPENAI_API_KEY: 已设置"
else
    echo "⚠️  警告: .env.local 中缺少必要的环境变量"
    echo "   请确保包含:"
    echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    echo "   - OPENAI_API_KEY"
fi

# 部署
echo ""
echo "📤 开始部署到 Vercel..."
echo ""

# 询问是否要设置环境变量
read -p "是否要将 .env.local 中的环境变量上传到 Vercel? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 设置环境变量到 Vercel..."
    
    # 读取并设置 Google Maps API Key
    GOOGLE_KEY=$(grep "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ ! -z "$GOOGLE_KEY" ]; then
        echo "   设置 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY..."
        vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production <<< "$GOOGLE_KEY" 2>&1 | head -5
        vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY preview <<< "$GOOGLE_KEY" 2>&1 | head -5
        vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY development <<< "$GOOGLE_KEY" 2>&1 | head -5
    fi
    
    # 读取并设置 OpenAI API Key
    OPENAI_KEY=$(grep "OPENAI_API_KEY" .env.local | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ ! -z "$OPENAI_KEY" ]; then
        echo "   设置 OPENAI_API_KEY..."
        vercel env add OPENAI_API_KEY production <<< "$OPENAI_KEY" 2>&1 | head -5
        vercel env add OPENAI_API_KEY preview <<< "$OPENAI_KEY" 2>&1 | head -5
        vercel env add OPENAI_API_KEY development <<< "$OPENAI_KEY" 2>&1 | head -5
    fi
    
    echo ""
fi

# 部署
echo "🚀 部署到生产环境..."
vercel --prod --yes

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 下一步："
echo "1. 访问 Vercel Dashboard 查看部署状态"
echo "2. 更新 Google Maps API 限制（添加 *.vercel.app）"
echo "3. 在 Deployments 页面找到 'Visit' 链接获取网站地址"
echo ""


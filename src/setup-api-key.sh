#!/bin/bash

echo "🗺️  Google Maps API Key 设置向导"
echo "=================================="
echo ""

# 检查.env.local文件
if [ -f .env.local ]; then
    echo "✅ 找到 .env.local 文件"
    echo ""
    echo "当前配置："
    cat .env.local
    echo ""
else
    echo "⚠️  未找到 .env.local 文件，将创建新文件"
    echo ""
fi

echo "📋 设置步骤："
echo ""
echo "1. 访问 Google Cloud Console:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2. 创建或选择项目"
echo ""
echo "3. 启用 Maps JavaScript API:"
echo "   API和服务 > 库 > 搜索 'Maps JavaScript API' > 启用"
echo ""
echo "4. 创建 API Key:"
echo "   API和服务 > 凭据 > 创建凭据 > API密钥"
echo ""
echo "5. 配置 API Key 限制（推荐）:"
echo "   - 应用限制: HTTP引荐来源网址"
echo "   - 添加: http://localhost:3000/*"
echo "   - API限制: Maps JavaScript API"
echo ""
echo "6. 复制生成的 API Key（以 AIza 开头）"
echo ""
echo "请输入您的 Google Maps API Key:"
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ API Key 不能为空！"
    exit 1
fi

# 更新.env.local文件
cat > .env.local << EOF
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${api_key}
OPENAI_API_KEY=your_openai_key_here
EOF

echo ""
echo "✅ API Key 已更新到 .env.local 文件"
echo ""
echo "📝 当前配置："
cat .env.local
echo ""
echo "🔄 请重启开发服务器以使更改生效："
echo "   1. 按 Ctrl+C 停止当前服务器"
echo "   2. 运行: npm run dev"
echo ""
echo "🌐 然后在浏览器中访问: http://localhost:3000"


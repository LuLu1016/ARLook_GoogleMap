# 🚀 Vercel 部署 - 一键完成指南

## ✅ 当前状态检查

- ✅ Git 仓库已准备好: https://github.com/LuLu1016/ARLook_GoogleMap
- ✅ 代码已推送
- ✅ Vercel CLI 已安装
- ✅ 环境变量文件存在
- ⚠️ 需要：登录 Vercel + 连接 Git + 设置环境变量 + 部署

## 🎯 快速完成部署（3步）

### 步骤 1: 登录 Vercel CLI（如果还没登录）

在终端运行：

```bash
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
vercel login
```

按提示操作：
- 选择登录方式（GitHub 或 Email）
- 完成登录

### 步骤 2: 使用自动化脚本部署

运行部署脚本：

```bash
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
./deploy-to-vercel.sh
```

脚本会自动：
- ✅ 检查环境变量
- ✅ 设置环境变量到 Vercel
- ✅ 部署到生产环境

### 步骤 3: 获取网站链接

部署完成后：
1. 访问：https://vercel.com/lulu1016-projects/ar-look-google-map/deployments
2. 点击最新的部署记录
3. 点击 **"Visit"** 按钮
4. 复制链接（这就是你的网站地址！）

## 🔄 或者手动完成（如果脚本有问题）

### 方法 A: 使用 Vercel Dashboard（最简单）

1. **访问项目设置**：
   https://vercel.com/lulu1016-projects/ar-look-google-map/settings

2. **连接 Git**（如果还没连接）：
   - Settings → Git → Connect Git
   - 选择：`LuLu1016/ARLook_GoogleMap`

3. **设置环境变量**：
   - Settings → Environment Variables
   - 添加：
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = 你的GoogleMapsAPI密钥
     - `OPENAI_API_KEY` = 你的OpenAIAPI密钥
   - 选择所有环境（Production, Preview, Development）

4. **部署**：
   - Deployments → Redeploy
   - 或等待自动部署

### 方法 B: 使用 Vercel CLI

```bash
# 1. 登录
vercel login

# 2. 链接项目（选择现有项目 ar-look-google-map）
vercel link

# 3. 设置环境变量
# 从 .env.local 读取并设置
source .env.local
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production <<< "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY preview <<< "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY development <<< "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"

vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
vercel env add OPENAI_API_KEY preview <<< "$OPENAI_API_KEY"
vercel env add OPENAI_API_KEY development <<< "$OPENAI_API_KEY"

# 4. 部署
vercel --prod
```

## 📋 部署后必做

1. **更新 Google Maps API 限制**：
   - 访问：https://console.cloud.google.com/apis/credentials
   - 编辑你的 API Key
   - 添加 HTTP referrers：
     ```
     https://*.vercel.app/*
     https://ar-look-google-map.vercel.app/*
     ```

2. **测试网站功能**：
   - 地图是否显示？
   - 聊天功能是否正常？

## 🆘 如果遇到问题

**查看部署日志**：
1. 访问：https://vercel.com/lulu1016-projects/ar-look-google-map/deployments
2. 点击失败的部署
3. 查看 "Logs" 标签页

**常见错误**：
- `Environment variable not found` → 设置环境变量
- `Build failed` → 检查构建日志
- `404 NOT_FOUND` → 检查 Git 是否连接

## 🎯 你的网站链接格式

部署成功后，你的网站链接会是：
```
https://ar-look-google-map.vercel.app
```

在 Vercel Dashboard → Deployments → 最新部署 → "Visit" 按钮中找到实际链接。


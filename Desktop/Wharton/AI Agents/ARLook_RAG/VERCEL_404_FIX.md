# 🔧 Vercel 404 错误修复指南

## 问题诊断

如果访问 Vercel 部署显示 404，通常是因为：

1. **项目未连接到 Git 仓库** ⚠️
2. **还没有部署成功**
3. **环境变量未配置**
4. **构建失败**

## ✅ 解决步骤

### 步骤 1: 连接 Git 仓库

1. **访问 Vercel Dashboard**
   - https://vercel.com/lulu1016-projects/ar-look-google-map
   - 或 https://vercel.com/dashboard

2. **点击 "Connect Git" 按钮**
   - 在项目页面找到 "Connect Git" 或 "Import Git Repository"
   - 选择 GitHub
   - 搜索并选择：`LuLu1016/ARLook_GoogleMap`
   - 点击 "Import"

3. **配置项目设置**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 步骤 2: 设置环境变量

在部署之前，**必须设置环境变量**：

1. 在 Vercel Dashboard 中，进入项目设置
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：

   ```
   GOOGLE_MAPS_API_KEY = 你的GoogleMapsAPI密钥
   OPENAI_API_KEY = 你的OpenAIAPI密钥
   ```

4. 选择环境：**Production, Preview, Development**（全部勾选）

### 步骤 3: 部署

1. **如果已连接 Git**：
   - Vercel 会自动检测新的 push
   - 会自动触发部署
   - 等待 2-3 分钟完成构建

2. **手动触发部署**：
   - 在 Vercel Dashboard 点击 **"Deployments"**
   - 点击 **"Redeploy"** 或等待自动部署

### 步骤 4: 检查部署状态

1. **查看部署日志**：
   - 点击最新的部署记录
   - 查看 **Logs** 标签页
   - 检查是否有构建错误

2. **常见错误**：
   - ❌ Build failed → 检查构建日志
   - ❌ Environment variables missing → 设置环境变量
   - ❌ Import error → 检查 Git 仓库连接

## 🔍 检查清单

- [ ] Git 仓库已连接（`LuLu1016/ARLook_GoogleMap`）
- [ ] 环境变量已设置（`GOOGLE_MAPS_API_KEY`, `OPENAI_API_KEY`）
- [ ] 至少有一次成功的部署
- [ ] 部署状态显示 "Ready"（不是 "Building" 或 "Error"）

## 🚨 如果仍然 404

### 方法 1: 使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 登录
vercel login

# 部署（确保在项目目录）
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
vercel --prod
```

### 方法 2: 检查部署域名

1. 在 Vercel Dashboard → **Settings** → **Domains**
2. 查看你的域名（例如：`ar-look-google-map.vercel.app`）
3. 使用正确的域名访问，而不是项目设置页面

### 方法 3: 重新导入项目

如果连接 Git 有问题，可以：

1. 删除现有项目（Settings → Delete Project）
2. 重新导入：
   - 访问：https://vercel.com/new
   - 导入 `LuLu1016/ARLook_GoogleMap`
   - 配置环境变量
   - 部署

## 📝 快速操作指南

### 当前状态检查

访问：https://vercel.com/lulu1016-projects/ar-look-google-map

检查：
1. ✅ **Deployments** 标签页是否有部署记录？
2. ✅ **Settings** → **Git** 是否显示已连接仓库？
3. ✅ **Settings** → **Environment Variables** 是否已设置？

### 如果显示 "Connect Git"

1. 点击 "Connect Git"
2. 选择 GitHub
3. 选择 `LuLu1016/ARLook_GoogleMap`
4. 点击 "Import"
5. 设置环境变量
6. 点击 "Deploy"

## 🔗 你的部署链接

部署成功后，你的网站链接会是：
```
https://ar-look-google-map.vercel.app
```
或
```
https://ar-look-google-map-[hash].vercel.app
```

在 Vercel Dashboard → **Deployments** → 最新部署 → 点击 "Visit" 查看实际链接。

## ⚠️ 重要提醒

部署后还需要：

1. **更新 Google Maps API 限制**
   - 访问：https://console.cloud.google.com/apis/credentials
   - 编辑你的 API Key
   - 添加 HTTP referrers：
     ```
     https://*.vercel.app/*
     https://ar-look-google-map.vercel.app/*
     ```

2. **测试功能**
   - 地图是否显示？
   - 聊天功能是否正常？

## 🆘 需要帮助？

如果问题仍然存在，请提供：
- Vercel Dashboard 的截图
- 部署日志的错误信息
- 你的实际域名


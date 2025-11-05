# 🚀 免费部署指南 - Vercel

## 为什么选择 Vercel？

- ✅ **完全免费**（个人项目）
- ✅ **专为 Next.js 优化**（零配置）
- ✅ **全球 CDN**，速度快
- ✅ **自动 SSL**（HTTPS）
- ✅ **自动部署**（GitHub 推送即部署）
- ✅ **环境变量管理**简单
- ✅ **无需信用卡**

## 快速部署步骤

### 步骤 1: 准备 GitHub 仓库

```bash
# 在项目根目录执行
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - ARLook RAG project"

# 在 GitHub 创建新仓库（https://github.com/new）
# 然后添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ARLook_RAG.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 2: 部署到 Vercel

1. **访问 Vercel**
   - 打开：https://vercel.com/new
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Import Git Repository"
   - 选择你的 `ARLook_RAG` 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

4. **环境变量设置**
   在 "Environment Variables" 部分添加：
   
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   ⚠️ **重要**：不要提交 `.env.local` 到 GitHub，使用 Vercel 的环境变量管理

5. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟完成构建和部署

### 步骤 3: 更新 Google Maps API 限制

部署完成后，Vercel 会给你一个域名，例如：`your-project.vercel.app`

1. **更新 Google Cloud Console**
   - 访问：https://console.cloud.google.com/apis/credentials
   - 选择你的 Google Maps API Key
   - 在 "Application restrictions" → "HTTP referrers" 中添加：
     ```
     https://*.vercel.app/*
     https://your-project.vercel.app/*
     ```
   - 保存

2. **重新部署**（如果地图不显示）
   - 在 Vercel Dashboard 点击 "Redeploy"

## 部署后访问

部署完成后，你会得到：
- **生产环境**: `https://your-project.vercel.app`
- **预览环境**: 每次 Git push 都会创建新的预览链接

## 后续更新

每次更新代码，只需：

```bash
git add .
git commit -m "Update: description"
git push
```

Vercel 会自动检测并部署新版本！

## 其他免费托管选项

### 备选 1: Netlify
- 免费，但 Next.js 支持不如 Vercel
- 网址：https://netlify.com

### 备选 2: Railway
- $5/月免费额度，需要信用卡
- 网址：https://railway.app

### 备选 3: Render
- 免费但会休眠（不活跃时）
- 不适合生产环境
- 网址：https://render.com

## 推荐配置

**首选：Vercel**（推荐）
- 专为 Next.js 设计
- 部署最简单
- 免费且稳定

## 注意事项

1. **环境变量安全**
   - ✅ 使用 Vercel Dashboard 设置环境变量
   - ❌ 不要提交 `.env.local` 到 GitHub

2. **API 限制**
   - Google Maps API 有每日配额限制
   - OpenAI API 按使用量收费
   - 建议设置使用限制和监控

3. **域名自定义**（可选）
   - Vercel 支持自定义域名
   - 在 Vercel Dashboard → Settings → Domains 添加

## 常见问题

**Q: 部署后地图不显示？**
A: 检查 Google Maps API Key 是否正确设置，并更新 HTTP referrers 限制。

**Q: 环境变量在哪里设置？**
A: Vercel Dashboard → Your Project → Settings → Environment Variables

**Q: 如何查看部署日志？**
A: Vercel Dashboard → Your Project → Deployments → 点击部署记录 → Logs

**Q: 免费版有限制吗？**
A: 个人项目完全免费，有带宽和构建时间限制，但对小项目足够。

## 技术支持

- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment
- 问题反馈：GitHub Issues

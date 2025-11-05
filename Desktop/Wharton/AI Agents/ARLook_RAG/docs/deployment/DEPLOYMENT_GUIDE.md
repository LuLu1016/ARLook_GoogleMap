# 免费部署指南 - ARLook MVP

本指南将帮助你免费部署 ARLook 项目到云端，让其他人可以轻松访问。

## 🚀 推荐的免费托管平台

### 1. **Vercel** (最推荐 ⭐⭐⭐⭐⭐)
- **优点**: 
  - 专为 Next.js 优化，零配置部署
  - 全球 CDN，速度极快
  - 自动 SSL 证书
  - 免费版本功能完整
  - 支持环境变量
  - 自动预览部署（PR）
- **缺点**: 
  - 免费版有构建时间限制（但通常足够）
- **适合**: Next.js 项目首选

**部署步骤**:
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 在项目根目录部署
vercel

# 4. 设置环境变量（Google Maps API Key, OpenAI API Key）
vercel env add GOOGLE_MAPS_API_KEY
vercel env add OPENAI_API_KEY

# 5. 重新部署
vercel --prod
```

或者直接通过 GitHub 连接：
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 导入你的 GitHub 仓库
4. 自动检测 Next.js，点击 "Deploy"
5. 在设置中添加环境变量

---

### 2. **Netlify** (推荐 ⭐⭐⭐⭐)
- **优点**: 
  - 免费且易用
  - 自动部署
  - 支持环境变量
  - 内置表单处理
- **缺点**: 
  - Next.js 支持不如 Vercel 完善
- **适合**: 需要表单处理的项目

**部署步骤**:
```bash
# 1. 安装 Netlify CLI
npm i -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化项目
netlify init

# 4. 设置环境变量
netlify env:set GOOGLE_MAPS_API_KEY "your_key"
netlify env:set OPENAI_API_KEY "your_key"

# 5. 部署
netlify deploy --prod
```

---

### 3. **Railway** (推荐 ⭐⭐⭐⭐)
- **优点**: 
  - 免费额度充足（$5/月）
  - 支持数据库
  - 自动部署
  - Docker 支持
- **缺点**: 
  - 免费版有使用限制
- **适合**: 需要数据库的项目

**部署步骤**:
1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 创建新项目，选择 GitHub 仓库
4. 添加环境变量
5. 自动部署

---

### 4. **Render** (备选 ⭐⭐⭐)
- **优点**: 
  - 免费托管
  - 自动 SSL
  - 支持环境变量
- **缺点**: 
  - 免费版有休眠时间（15分钟无活动后休眠）
- **适合**: 小型项目或演示

**部署步骤**:
1. 访问 https://render.com
2. 创建账号
3. 创建新的 Web Service
4. 连接 GitHub 仓库
5. 设置构建命令: `npm install && npm run build`
6. 设置启动命令: `npm start`
7. 添加环境变量

---

## 📋 部署前准备清单

### 1. 环境变量配置

确保以下环境变量已设置：

```bash
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Next.js 环境变量（可选）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here  # 如果需要在客户端使用
```

### 2. 代码检查

```bash
# 确保代码可以本地构建
npm run build

# 确保没有 TypeScript 错误
npm run type-check  # 如果有这个脚本

# 确保 lint 通过
npm run lint
```

### 3. 更新 `.gitignore`

确保敏感信息不会被提交：

```gitignore
# 环境变量
.env.local
.env.production
.env

# 构建输出
.next/
out/
dist/
```

### 4. 创建 `vercel.json` (Vercel 部署)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 5. 创建 `netlify.toml` (Netlify 部署)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🔒 安全设置

### Google Maps API Key 限制

在 Google Cloud Console 中设置 API Key 限制：

1. **HTTP 引荐来源网址限制**:
   - 添加你的域名: `https://your-domain.vercel.app/*`
   - 添加开发域名: `http://localhost:3000/*`

2. **API 限制**:
   - 仅启用 "Maps JavaScript API"
   - 禁用不需要的 API

### OpenAI API Key

- 不要将 API Key 提交到 Git
- 在生产环境中设置使用限制
- 定期轮换 API Key

---

## 📊 部署后验证

部署完成后，检查以下功能：

1. ✅ 地图是否正确加载
2. ✅ 聊天功能是否正常工作
3. ✅ API 路由是否正常响应
4. ✅ 环境变量是否正确加载
5. ✅ 控制台是否有错误

---

## 🆘 常见问题

### Q: 部署后地图显示空白？
A: 检查 Google Maps API Key 是否正确设置，以及域名是否添加到 API Key 限制中。

### Q: API 调用失败？
A: 检查环境变量是否正确设置，以及 API Key 是否有效。

### Q: 构建失败？
A: 检查是否有 TypeScript 错误或依赖问题，确保所有依赖都已安装。

### Q: 部署后样式丢失？
A: 检查 Tailwind CSS 配置是否正确，确保构建时 CSS 被正确生成。

---

## 🎯 推荐方案

**最佳选择**: **Vercel**

原因：
1. Next.js 官方推荐
2. 零配置部署
3. 性能最优
4. 免费版功能完整
5. 支持自动部署和预览

**快速开始**:
```bash
# 一键部署到 Vercel
npx vercel --prod
```

或者访问 https://vercel.com/new 通过 GitHub 连接。

---

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Google Maps API 设置](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

## 💡 提示

1. **首次部署**: 建议先在开发环境充分测试
2. **环境变量**: 使用平台的环境变量管理工具，不要硬编码
3. **监控**: 关注部署日志和错误信息
4. **备份**: 定期备份重要数据
5. **域名**: 免费版通常提供子域名，也可以绑定自定义域名

祝部署顺利！🎉


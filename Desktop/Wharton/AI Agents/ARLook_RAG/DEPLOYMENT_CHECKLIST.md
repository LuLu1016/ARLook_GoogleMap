# 🚀 快速部署清单

## 部署前检查清单

- [ ] 代码已推送到 GitHub
- [ ] `.env.local` 已添加到 `.gitignore`（不会提交）
- [ ] 已准备好 Google Maps API Key
- [ ] 已准备好 OpenAI API Key

## 快速部署（3 种方式）

### 方式 1: 使用 GitHub（推荐）⭐

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **访问 Vercel**
   - https://vercel.com/new
   - 登录 GitHub
   - 选择仓库 → Import

3. **设置环境变量**
   - GOOGLE_MAPS_API_KEY
   - OPENAI_API_KEY

4. **Deploy** → 完成！

### 方式 2: 使用 Vercel CLI

```bash
# 安装 CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方式 3: 使用部署脚本

```bash
./deploy.sh
```

## 部署后必做

1. ✅ 设置环境变量（Vercel Dashboard）
2. ✅ 更新 Google Maps API 限制（添加 `*.vercel.app`）
3. ✅ 测试网站功能
4. ✅ 分享链接给用户

## 你的网站地址

部署完成后会得到：
- `https://your-project.vercel.app`

可以自定义域名（可选）


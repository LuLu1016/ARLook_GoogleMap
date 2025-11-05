# 🚀 Vercel 部署完整指南 - 逐步操作

## 当前状态

✅ **代码已推送到 GitHub**: https://github.com/LuLu1016/ARLook_GoogleMap
✅ **Vercel 项目已创建**: ar-look-google-map
⚠️ **需要完成**: 连接 Git + 设置环境变量 + 部署

## 📋 完整操作步骤

### 方法 1: 使用 Vercel Dashboard（推荐 - 最简单）

#### 步骤 1: 连接 Git 仓库

1. **访问项目设置**：
   https://vercel.com/lulu1016-projects/ar-look-google-map/settings/git

2. **如果显示 "Connect Git"**：
   - 点击 **"Connect Git"**
   - 选择 **GitHub**
   - 搜索：`ARLook_GoogleMap` 或 `LuLu1016/ARLook_GoogleMap`
   - 点击 **"Import"**

3. **如果已连接**：
   - 应该显示：`LuLu1016/ARLook_GoogleMap`
   - 如果显示其他仓库，点击 **"Disconnect"** 然后重新连接

#### 步骤 2: 设置环境变量（重要！）

1. **访问环境变量设置**：
   https://vercel.com/lulu1016-projects/ar-look-google-map/settings/environment-variables

2. **添加变量 1**：
   - 点击 **"Add New"**
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: `你的GoogleMapsAPI密钥`（从 .env.local 复制）
   - Environment: ✅ Production ✅ Preview ✅ Development（全部勾选）
   - 点击 **"Save"**

3. **添加变量 2**：
   - 点击 **"Add New"**
   - Key: `OPENAI_API_KEY`
   - Value: `你的OpenAIAPI密钥`（从 .env.local 复制）
   - Environment: ✅ Production ✅ Preview ✅ Development（全部勾选）
   - 点击 **"Save"**

4. **验证**：
   - 应该看到两个环境变量都在列表中
   - 确保变量名完全正确（注意 `NEXT_PUBLIC_` 前缀）

#### 步骤 3: 触发部署

1. **访问部署页面**：
   https://vercel.com/lulu1016-projects/ar-look-google-map/deployments

2. **如果 Git 已连接**：
   - Vercel 应该自动检测到新的 push
   - 会自动开始部署
   - 等待 2-3 分钟

3. **如果还没自动部署**：
   - 点击 **"Redeploy"** 按钮
   - 或访问：https://vercel.com/new
   - 重新导入项目

#### 步骤 4: 检查部署状态

1. **查看部署列表**：
   - 应该看到部署记录
   - 状态应该是 "Building" 或 "Ready"

2. **如果状态是 "Ready"（绿色）**：
   - 点击部署记录
   - 点击 **"Visit"** 按钮
   - 这就是你的网站链接！

3. **如果状态是 "Error"（红色）**：
   - 点击部署记录
   - 查看 **"Logs"** 标签页
   - 找出错误原因（常见：环境变量未设置）

### 方法 2: 使用 Vercel CLI（高级）

```bash
# 1. 登录 Vercel
vercel login

# 2. 链接项目（如果还没链接）
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
vercel link

# 3. 设置环境变量
# Google Maps API Key
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production
# （会提示输入值，粘贴你的 API key）

vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY preview
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY development

# OpenAI API Key
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development

# 4. 部署
vercel --prod
```

### 方法 3: 使用部署脚本

```bash
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
./deploy-to-vercel.sh
```

## 🔍 验证清单

完成后检查：

- [ ] Git 仓库已连接（Settings → Git）
- [ ] 环境变量已设置（Settings → Environment Variables）：
  - [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ✅
  - [ ] `OPENAI_API_KEY` ✅
- [ ] 有部署记录（Deployments 标签页）
- [ ] 最新部署状态是 "Ready"（绿色）
- [ ] 可以访问网站（点击 "Visit"）

## 🚨 常见问题

### 问题 1: 部署显示 "Error"

**查看日志**：
1. 点击失败的部署
2. 查看 "Logs" 标签页
3. 常见错误：
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined` → 设置环境变量
   - `Build failed` → 检查构建日志
   - `Module not found` → 检查依赖

### 问题 2: 环境变量不生效

**检查**：
1. 变量名是否正确（`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`）
2. 是否选择了所有环境（Production, Preview, Development）
3. 部署时是否重新构建（可能需要 Redeploy）

### 问题 3: 404 错误

**检查**：
1. Git 是否已连接？
2. 是否有成功的部署？
3. 使用的是正确的域名（在 Deployments 页面的 "Visit" 链接）

## 📞 需要帮助？

如果遇到问题，请告诉我：
1. Vercel Dashboard 显示的部署状态
2. 部署日志中的错误信息
3. 哪些步骤已完成，哪些步骤有问题

## 🎯 你的网站链接

部署成功后，在 **Deployments** 标签页：
- 点击最新的部署记录
- 点击 **"Visit"** 按钮
- 你会看到类似：`https://ar-look-google-map.vercel.app`

这就是你的网站链接，可以分享给用户！


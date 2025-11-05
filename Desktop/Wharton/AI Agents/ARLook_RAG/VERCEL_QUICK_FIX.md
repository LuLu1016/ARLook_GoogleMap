# 🚀 快速部署到 Vercel - 完整步骤

## 当前状态

✅ **GitHub 仓库已准备好**: https://github.com/LuLu1016/ARLook_GoogleMap
⚠️ **Vercel 项目已创建但可能未连接 Git**

## 立即操作步骤

### 1. 连接 Git 仓库（最重要！）

访问：https://vercel.com/lulu1016-projects/ar-look-google-map

**如果看到 "Connect Git" 按钮**：

1. 点击 **"Connect Git"**
2. 选择 **GitHub**
3. 搜索：`ARLook_GoogleMap` 或 `LuLu1016/ARLook_GoogleMap`
4. 点击 **"Import"**

### 2. 配置环境变量

在部署之前，**必须设置环境变量**：

1. 点击 **Settings** → **Environment Variables**
2. 添加两个变量：

   **变量 1:**
   - Name: `GOOGLE_MAPS_API_KEY`
   - Value: `你的GoogleMapsAPI密钥`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **变量 2:**
   - Name: `OPENAI_API_KEY`
   - Value: `你的OpenAIAPI密钥`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. 点击 **"Save"**

### 3. 触发部署

**方法 A: 自动部署（推荐）**
- 如果 Git 已连接，Vercel 会自动部署
- 或者推送到 GitHub：
  ```bash
  git push
  ```

**方法 B: 手动部署**
- 在 Vercel Dashboard 点击 **"Deployments"**
- 点击 **"Redeploy"**

### 4. 等待部署完成

- 查看部署日志
- 等待状态变为 **"Ready"**（绿色）
- 点击 **"Visit"** 查看网站

## 🔗 你的网站链接

部署成功后，在 **Deployments** 标签页：
- 点击最新的部署记录
- 点击 **"Visit"** 按钮
- 你会看到类似：`https://ar-look-google-map.vercel.app`

## ⚠️ 部署后必做

1. **更新 Google Maps API 限制**
   - 访问：https://console.cloud.google.com/apis/credentials
   - 编辑你的 API Key
   - 添加 HTTP referrers：
     ```
     https://*.vercel.app/*
     https://ar-look-google-map.vercel.app/*
     ```

2. **测试网站**
   - 地图是否显示？
   - 聊天功能是否正常？

## ❌ 如果还是 404

请检查：
1. **Deployments** 标签页是否有部署记录？
2. 部署状态是 "Ready" 还是 "Error"？
3. 如果显示 "Error"，查看日志找出问题

## 📞 快速检查清单

- [ ] Git 仓库已连接（Settings → Git）
- [ ] 环境变量已设置（Settings → Environment Variables）
- [ ] 至少有一次部署（Deployments 标签页）
- [ ] 部署状态是 "Ready"（不是 "Building" 或 "Error"）
- [ ] Google Maps API 限制已更新

## 🎯 最可能的原因

**404 错误通常是因为**：
1. ✅ **项目未连接到 Git 仓库** ← 最可能的原因
2. ✅ **还没有任何部署记录**
3. ✅ **部署失败但未查看日志**

**解决**：连接 Git 仓库 → 设置环境变量 → 部署


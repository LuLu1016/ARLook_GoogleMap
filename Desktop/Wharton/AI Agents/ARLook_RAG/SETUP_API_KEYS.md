# 🔐 API Key 设置指南

## ⚠️ 重要安全提示

**永远不要将 API keys 提交到 GitHub！**

`.env.local` 文件已经在 `.gitignore` 中，不会被提交到仓库。

## 📋 快速设置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
touch .env.local
```

### 2. 添加 API Keys

打开 `.env.local` 文件，添加以下内容：

```bash
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

**替换 `your_google_maps_api_key_here` 和 `your_openai_api_key_here` 为你的实际 API keys。**

### 3. 验证设置

运行开发服务器：

```bash
npm run dev
```

如果看到：
```
- Environments: .env.local
```

说明环境变量已正确加载！

## 🔑 如何获取 API Keys

### Google Maps API Key

1. 访问：https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 **Maps JavaScript API**
4. 转到 **Credentials** → **Create Credentials** → **API Key**
5. 复制 API Key
6. （重要）配置 API Key 限制：
   - 在 API Key 设置中，添加 **HTTP referrers** 限制
   - 本地开发：`http://localhost:3000/*`
   - 生产环境：`https://your-domain.vercel.app/*`

### OpenAI API Key

1. 访问：https://platform.openai.com/api-keys
2. 登录你的 OpenAI 账户
3. 点击 **"Create new secret key"**
4. 复制 API Key（格式：`sk-...`）
5. ⚠️ 注意：API Key 只显示一次，请妥善保存

## 📁 文件结构

```
ARLook_RAG/
├── .env.local          ← 你的 API keys（本地文件，不提交到 Git）
├── .env.example        ← 示例文件（可以提交到 Git）
├── .gitignore          ← 确保 .env.local 被忽略
└── ...
```

## ✅ 验证清单

- [ ] `.env.local` 文件已创建
- [ ] `GOOGLE_MAPS_API_KEY` 已添加
- [ ] `OPENAI_API_KEY` 已添加
- [ ] 文件格式正确（每行一个 KEY=VALUE）
- [ ] 没有多余的空格或引号
- [ ] 运行 `npm run dev` 时显示 `Environments: .env.local`

## 🚨 常见错误

### 错误 1: "API key not configured"

**原因**：`.env.local` 文件不存在或格式错误

**解决**：
1. 检查 `.env.local` 是否存在
2. 确保格式是 `KEY=VALUE`（没有空格）
3. 确保没有引号：`GOOGLE_MAPS_API_KEY=your_key` ✅
   （不是：`GOOGLE_MAPS_API_KEY="your_key"` ❌）

### 错误 2: 地图不显示

**原因**：Google Maps API Key 限制设置不正确

**解决**：
1. 检查 Google Cloud Console 中的 API Key 限制
2. 确保添加了 `http://localhost:3000/*` 到 HTTP referrers
3. 等待几分钟让设置生效

### 错误 3: OpenAI API 调用失败

**原因**：API Key 无效或账户余额不足

**解决**：
1. 验证 API Key 是否正确
2. 检查 OpenAI 账户余额
3. 确保 API Key 有足够的权限

## 🔒 安全最佳实践

1. ✅ **使用 `.env.local`**（已在 `.gitignore` 中）
2. ✅ **不要在代码中硬编码 API keys**
3. ✅ **不要在 GitHub Issues 中分享 API keys**
4. ✅ **定期轮换 API keys**
5. ✅ **使用 API Key 限制（Google Maps）**
6. ✅ **设置使用配额和监控**

## 📝 示例文件

如果你不确定格式，可以参考 `.env.example`（如果存在）：

```bash
# .env.example（示例文件 - 可以提交到 Git）
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

**重要**：`.env.example` 中不应该包含真实的 API keys！

## 🆘 需要帮助？

如果遇到问题，请检查：
1. 文件是否在项目根目录
2. 文件名是否正确（`.env.local`，不是 `.env.local.txt`）
3. 格式是否正确（`KEY=VALUE`，每行一个）
4. 是否重启了开发服务器（修改 `.env.local` 后需要重启）

## 🔗 相关文档

- [Google Maps API 设置指南](./docs/setup/GOOGLE_MAPS_SETUP.md)
- [OpenAI API 设置指南](./docs/setup/OPENAI_SETUP.md)
- [环境变量设置](./docs/setup/ENV_SETUP.md)


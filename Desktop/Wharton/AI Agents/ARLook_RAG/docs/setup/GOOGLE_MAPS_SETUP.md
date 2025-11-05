# Google Maps API Key 设置指南

## 📋 快速设置步骤

### 步骤 1: 访问 Google Cloud Console
访问 [Google Cloud Console](https://console.cloud.google.com/)

### 步骤 2: 创建或选择项目
1. 点击页面顶部的项目选择器
2. 点击"新建项目"或选择现有项目
3. 如果创建新项目：
   - 输入项目名称（例如：ARLook）
   - 点击"创建"

### 步骤 3: 启用 Maps JavaScript API
1. 在Google Cloud Console中，进入"API和服务" > "库"
2. 搜索"Maps JavaScript API"
3. 点击"Maps JavaScript API"
4. 点击"启用"按钮

### 步骤 4: 创建 API Key
1. 进入"API和服务" > "凭据"
2. 点击顶部"创建凭据" > "API密钥"
3. 系统会生成一个API密钥（例如：AIza...）
4. **重要**：复制这个API密钥，稍后需要用到

### 步骤 5: 配置 API Key 限制（强烈推荐）

为了安全性和防止滥用，建议配置API Key限制：

#### 应用限制
1. 在API密钥页面，点击刚创建的API密钥
2. 在"应用限制"部分：
   - 选择"HTTP引荐来源网址（网站）"
   - 添加以下网址：
     - `http://localhost:3000/*`
     - `http://localhost:3000`
     - `http://127.0.0.1:3000/*`
     - （如果需要，添加生产环境的域名）

#### API限制
1. 在"API限制"部分：
   - 选择"限制密钥"
   - 勾选"Maps JavaScript API"
   - 点击"保存"

### 步骤 6: 更新项目配置

#### 方法1: 使用命令行更新 .env.local
```bash
cd "/Users/lulu/Desktop/Wharton/AI Agents/ARLook_RAG"
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的API密钥" > .env.local
echo "OPENAI_API_KEY=your_openai_key_here" >> .env.local
```

#### 方法2: 手动编辑 .env.local
1. 在项目根目录找到 `.env.local` 文件
2. 打开文件，将 `your_api_key_here` 替换为你的实际API密钥：
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...（你的实际密钥）
OPENAI_API_KEY=your_openai_key_here
```

### 步骤 7: 重启开发服务器
1. 在终端中按 `Ctrl+C` 停止当前服务器
2. 重新启动：
```bash
npm run dev
```

### 步骤 8: 验证
1. 打开浏览器访问 http://localhost:3000
2. 如果看到地图正常显示，说明配置成功！

## 🔒 安全最佳实践

根据 [Google Maps Platform文档](https://developers.google.com/maps/documentation/javascript/get-api-key)：

1. **始终限制API Key**：
   - 设置应用限制（HTTP引荐来源网址）
   - 设置API限制（只允许Maps JavaScript API）

2. **不要在代码中硬编码API Key**：
   - ✅ 使用环境变量（.env.local）
   - ❌ 不要提交到Git仓库

3. **定期轮换API Key**：
   - 如果密钥泄露，立即删除并创建新的

4. **监控API使用**：
   - 在Google Cloud Console中设置配额和警报

## 💰 费用说明

Google Maps Platform提供：
- **每月$200免费额度**（足够开发和小规模使用）
- 超过免费额度后按使用量付费
- 详细定价：https://developers.google.com/maps/billing-and-pricing/pricing

## ⚠️ 常见问题

### 问题1: "This page didn't load Google Maps correctly"
**解决方案**：
- 检查API Key是否正确配置
- 确认Maps JavaScript API已启用
- 检查API Key限制设置（确保localhost被允许）

### 问题2: API Key无效
**解决方案**：
- 检查.env.local文件中的键名是否正确（NEXT_PUBLIC_GOOGLE_MAPS_API_KEY）
- 确认没有多余的空格或引号
- 重启开发服务器

### 问题3: 地图显示但报错
**解决方案**：
- 检查浏览器控制台的错误信息
- 确认API Key限制设置正确
- 确认已启用Maps JavaScript API

## 📝 检查清单

- [ ] 创建了Google Cloud项目
- [ ] 启用了Maps JavaScript API
- [ ] 创建了API Key
- [ ] 配置了API Key限制（应用限制和API限制）
- [ ] 更新了.env.local文件
- [ ] 重启了开发服务器
- [ ] 验证地图正常显示

## 🚀 下一步

配置完成后，您可以：
1. 测试地图功能
2. 测试标记点显示
3. 测试地图与聊天的联动
4. 准备集成OpenAI API


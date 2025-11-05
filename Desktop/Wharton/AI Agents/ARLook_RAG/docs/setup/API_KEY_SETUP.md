# Google Maps API Key 快速设置

## 🚀 快速设置（推荐）

### 方法1: 使用设置脚本
```bash
./setup-api-key.sh
```
脚本会引导您输入API Key并自动更新配置文件。

### 方法2: 手动设置

#### 步骤1: 获取 API Key

根据 [Google Maps Platform文档](https://developers.google.com/maps/documentation/javascript/get-api-key)：

1. **访问 Google Cloud Console**
   - 打开 https://console.cloud.google.com/
   - 登录您的Google账号

2. **创建或选择项目**
   - 点击顶部项目选择器
   - 点击"新建项目"或选择现有项目
   - 项目名称：ARLook（或您喜欢的名称）

3. **启用 Maps JavaScript API**
   - 进入"API和服务" > "库"
   - 搜索"Maps JavaScript API"
   - 点击进入详情页
   - 点击"启用"按钮

4. **创建 API Key**
   - 进入"API和服务" > "凭据"
   - 点击"创建凭据" > "API密钥"
   - 复制生成的API密钥（格式：AIza...）

5. **配置 API Key 限制（重要！）**
   
   **应用限制**：
   - 点击刚创建的API密钥进入详情
   - 在"应用限制"中选择"HTTP引荐来源网址（网站）"
   - 添加以下网址：
     ```
     http://localhost:3000/*
     http://127.0.0.1:3000/*
     ```
   - （生产环境部署时，添加您的域名）

   **API限制**：
   - 在"API限制"中选择"限制密钥"
   - 勾选"Maps JavaScript API"
   - 点击"保存"

#### 步骤2: 更新项目配置

编辑 `.env.local` 文件，将API Key替换为您的实际密钥：

```bash
# 使用命令行编辑
nano .env.local
# 或
code .env.local
```

更新内容：
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...（您的实际API密钥）
OPENAI_API_KEY=your_openai_key_here
```

#### 步骤3: 重启开发服务器

1. 在运行 `npm run dev` 的终端按 `Ctrl+C`
2. 重新启动：
```bash
npm run dev
```

3. 刷新浏览器页面 http://localhost:3000

## ✅ 验证设置

如果设置成功，您应该看到：
- ✅ 地图正常显示（费城大学城区域）
- ✅ 显示5个房源标记点
- ✅ 可以点击标记点查看详情
- ✅ 地图与聊天联动正常

## 🔒 安全提醒

根据Google文档的最佳实践：

1. ✅ **已配置**：使用环境变量存储API Key
2. ✅ **已配置**：.env.local已在.gitignore中
3. ⚠️ **需要配置**：在Google Cloud Console中设置API Key限制
4. ⚠️ **需要配置**：生产环境部署时添加域名限制

## 💰 费用信息

- Google Maps Platform提供**每月$200免费额度**
- 足够开发和小规模使用
- 超过免费额度后按使用量付费
- 详细定价：https://developers.google.com/maps/billing-and-pricing/pricing

## 🆘 故障排除

### 问题：地图不显示
**检查清单**：
- [ ] API Key是否正确复制（没有多余空格）
- [ ] .env.local文件格式正确
- [ ] 已重启开发服务器
- [ ] Maps JavaScript API已启用
- [ ] API Key限制设置正确（允许localhost）

### 问题：API Key无效错误
**解决方案**：
- 检查浏览器控制台的具体错误信息
- 确认API Key限制设置中包含localhost
- 确认Maps JavaScript API已启用

### 问题：配额超限
**解决方案**：
- 检查Google Cloud Console中的API使用情况
- 设置配额限制和警报
- 考虑升级到付费计划

## 📚 参考资源

- [Google Maps Platform文档](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [API Key最佳实践](https://developers.google.com/maps/api-security-best-practices)
- [定价信息](https://developers.google.com/maps/billing-and-pricing/pricing)


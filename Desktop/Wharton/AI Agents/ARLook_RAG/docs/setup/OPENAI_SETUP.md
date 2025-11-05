# OpenAI API Key Setup

## 配置步骤

1. **获取OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 登录您的OpenAI账户
   - 点击 "Create new secret key"
   - 复制生成的API Key（格式：`sk-...`）

2. **配置环境变量**
   - 在项目根目录创建 `.env.local` 文件（如果不存在）
   - 添加以下内容：
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```
   - 将 `sk-your-api-key-here` 替换为您的实际API Key

3. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   npm run dev
   ```

## 功能说明

- **智能搜索**：使用OpenAI GPT-3.5-turbo理解用户需求
- **自动过滤**：AI返回的过滤条件自动应用到房源列表
- **格式化回复**：AI提供结构化的房源推荐和专业建议
- **降级处理**：如果OpenAI API不可用，自动使用本地过滤逻辑

## 注意事项

- API Key必须保密，不要提交到Git仓库
- `.env.local` 文件已在 `.gitignore` 中，不会被提交
- 如果没有配置API Key，系统会自动使用本地过滤功能作为降级方案

## 测试

配置完成后，在聊天界面输入以下测试消息：
- "我想找离Wharton近、有室内洗衣机和健身房的公寓，预算不超过2000美元"
- "Wharton附近学生公寓"
- "带室内洗烘房源"
- "预算$1500-2000"

AI应该能够理解您的需求并返回格式化的房源推荐。


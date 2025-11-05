# ARLook - AI-Powered Rental Assistant

AI 驱动的租房助手，结合 Google Maps 可视化和 RAG 系统。

---

## 📚 文档

- **[架构文档](./docs/ARCHITECTURE.md)** - 完整的架构说明（RAG、数据库、LLM Pipeline）
- **[设置指南](./SETUP.md)** - 环境配置和安装
- **[部署指南](./DEPLOYMENT.md)** - 部署说明

---

## 🏗️ 核心组件位置

### 💾 数据库
- **数据文件**: `src/data/apartments_v2.csv`
- **加载器**: `src/server/utils/csv-loader.ts` (第 415 行: `getAllProperties()`)

### 🤖 LLM Pipeline
- **OpenAI 服务**: `src/server/services/openai.ts`
  - 第 44 行: `formatPropertiesForPrompt()` - 格式化提示词
  - 第 80 行: `parseAIResponse()` - 解析 AI 回复
- **上下文感知**: `src/server/utils/context-aware.ts`

### 🔍 RAG 系统
- **位置**: `src/server/services/rag/`
  - `reasoning.ts` - 推理引擎
  - `retrieval.ts` - 混合检索器
  - `verification.ts` - 验证系统

### 🔗 整合点
- **主 API**: `src/app/api/chat/route.ts` - 整合所有组件

---

## 📂 项目结构

```
src/
├── app/api/chat/route.ts          ⭐ 主 API
├── server/
│   ├── services/
│   │   ├── rag/                   🔍 RAG 系统
│   │   └── openai.ts              🤖 LLM Pipeline
│   └── utils/
│       ├── csv-loader.ts          💾 数据库
│       └── context-aware.ts       🤖 上下文感知
└── data/
    └── apartments_v2.csv          💾 数据文件
```

---

## 🚀 快速开始

查看 [架构文档](./docs/ARCHITECTURE.md) 了解详细说明。

**提示**: 每个关键文件顶部都有详细的文档注释。

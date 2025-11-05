# 🏗️ ARLook 架构文档

完整的项目架构说明，包含 RAG 系统、数据库和 LLM Pipeline 的位置与使用指南。

---

## 📋 目录

- [快速定位](#快速定位)
- [系统架构](#系统架构)
- [核心组件详解](#核心组件详解)
- [数据流](#数据流)
- [文件结构](#文件结构)
- [扩展指南](#扩展指南)

---

## 🎯 快速定位

### 数据库在哪里？

```
📁 数据库
├── src/data/apartments_v2.csv          ← 数据文件（CSV）
└── src/server/utils/csv-loader.ts      ← 数据加载器
    └── getAllProperties()              ← 第 415 行：获取所有房源
```

**使用**：
```typescript
import { getAllProperties } from '@/server/utils/csv-loader';
const allProperties = getAllProperties();
```

### LLM Pipeline 在哪里？

```
📁 LLM Pipeline
├── src/server/services/openai.ts       ← OpenAI 服务
│   ├── formatPropertiesForPrompt()    ← 第 44 行：格式化提示词
│   ├── parseAIResponse()              ← 第 80 行：解析回复
│   └── filterPropertiesByFilters()    ← 第 155 行：过滤房源
└── src/server/utils/context-aware.ts   ← 上下文感知
    └── ContextAwareAssistant          ← 第 42 行：上下文理解类
```

**使用**：
```typescript
import { formatPropertiesForPrompt, parseAIResponse } from '@/server/services/openai';
const prompt = formatPropertiesForPrompt(properties);
const { reply, filters } = parseAIResponse(aiResponse);
```

### RAG 系统在哪里？

```
📁 RAG 系统
└── src/server/services/rag/
    ├── reasoning.ts      ← 推理引擎（需求澄清、策略选择）
    ├── retrieval.ts      ← 混合检索器（关键词/语义搜索）
    └── verification.ts   ← 验证系统（数据验证、幻觉检测）
```

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────┐
│           用户界面层 (Frontend)          │
│  - MapContainer (地图显示)              │
│  - ChatSidebar (对话界面)               │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           API 路由层                     │
│  POST /api/chat (主聊天接口)             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        核心服务层 (Core Services)        │
│  ┌──────────────────────────────────┐  │
│  │  1. RAG 系统                      │  │
│  │     - reasoning.ts                │  │
│  │     - retrieval.ts                │  │
│  │     - verification.ts             │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  2. LLM Pipeline                  │  │
│  │     - openai.ts                  │  │
│  │     - context-aware.ts           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  3. 数据层                       │  │
│  │     - csv-loader.ts              │  │
│  │     - data/apartments_v2.csv     │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔍 核心组件详解

### 1. 💾 数据库层

**文件**: `src/server/utils/csv-loader.ts`

**核心函数**:
- `getAllProperties()` - 获取所有房源（第 415 行）
- `loadPropertiesFromCSV()` - 从 CSV 加载数据（第 183 行）

**数据文件**: `src/data/apartments_v2.csv`

**职责**:
- 解析 CSV 文件
- 转换为 Property 类型
- 合并多个数据源

### 2. 🔍 RAG 系统

#### reasoning.ts - 推理引擎
**路径**: `src/server/services/rag/reasoning.ts`

**核心类**: `RentalReasoningEngine`

**功能**:
- Stage 1: 需求澄清 (`clarifyNeeds()`)
- Stage 2: 策略选择 (`selectSearchStrategy()`)
- Stage 3: 结果排序 (`rankAndExplain()`)
- Stage 4: 建议生成 (`generatePersonalizedAdvice()`)

#### retrieval.ts - 混合检索器
**路径**: `src/server/services/rag/retrieval.ts`

**核心类**: `HybridRetriever`

**功能**:
- `keywordSearch()` - 关键词搜索
- `semanticSearch()` - 语义搜索
- `retrieve()` - 主入口，根据策略选择搜索方式

#### verification.ts - 验证系统
**路径**: `src/server/services/rag/verification.ts`

**核心函数**:
- `verifyPropertyMentions()` - 验证房源提及
- `verifyDataConsistency()` - 验证数据一致性
- `calculateRAGMetrics()` - 计算性能指标
- `sanitizeAIResponse()` - 清理 AI 回复

### 3. 🤖 LLM Pipeline

#### openai.ts - OpenAI 服务
**路径**: `src/server/services/openai.ts`

**核心函数**:
- `formatPropertiesForPrompt()` - 格式化房源数据（第 44 行）
- `parseAIResponse()` - 解析 AI 回复（第 80 行）
- `filterPropertiesByFilters()` - 过滤房源（第 155 行）

#### context-aware.ts - 上下文感知
**路径**: `src/server/utils/context-aware.ts`

**核心类**: `ContextAwareAssistant`

**功能**:
- `understandContext()` - 理解上下文
- `provideProactiveSuggestions()` - 主动建议

### 4. 🔗 整合点

**文件**: `src/app/api/chat/route.ts`

**职责**: 整合所有组件，处理完整的 RAG 流程

**流程**:
1. 接收用户消息
2. 调用数据库获取房源
3. RAG 检索相关房源
4. 调用 LLM 生成回复
5. 验证回复准确性
6. 返回结果

---

## 🔄 数据流

```
用户查询
  ↓
src/app/api/chat/route.ts (POST)
  ↓
1. 数据库访问
  src/server/utils/csv-loader.ts
  └─ getAllProperties()
     └─ 读取 src/data/apartments_v2.csv
  ↓
2. RAG 检索
  src/server/services/rag/retrieval.ts
  └─ HybridRetriever.retrieve()
  ↓
3. LLM 生成
  src/server/services/openai.ts
  ├─ formatPropertiesForPrompt()
  ├─ OpenAI API 调用
  └─ parseAIResponse()
  ↓
4. 验证
  src/server/services/rag/verification.ts
  └─ verifyAndFilterProperties()
  ↓
返回结果给前端
```

---

## 📂 文件结构

```
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts              ⭐ 主 API（整合所有组件）
│
├── server/
│   ├── services/
│   │   ├── rag/                      🔍 RAG 系统
│   │   │   ├── reasoning.ts
│   │   │   ├── retrieval.ts
│   │   │   └── verification.ts
│   │   └── openai.ts                 🤖 LLM Pipeline
│   │
│   └── utils/
│       ├── csv-loader.ts              💾 数据库
│       └── context-aware.ts           🤖 上下文感知
│
└── data/
    └── apartments_v2.csv               💾 数据文件
```

---

## 🛠️ 扩展指南

### 添加新的数据源

1. 在 `src/server/utils/` 创建新的加载器
2. 在 `csv-loader.ts` 的 `getAllProperties()` 中集成
3. 将数据文件放在 `src/data/` 目录

### 增强 RAG 检索

1. 修改 `src/server/services/rag/retrieval.ts`
2. 替换模拟嵌入为真实的 OpenAI embeddings
3. 集成向量数据库（Pinecone、Weaviate）

### 改进 LLM 响应

1. 修改 `src/app/api/chat/route.ts` 的 `createSystemPrompt()`（第 29 行）
2. 调整 `src/server/services/openai.ts` 的 `parseAIResponse()`

### 添加新的验证规则

1. 在 `src/server/services/rag/verification.ts` 添加新函数
2. 更新 `calculateRAGMetrics()` 以包含新指标

---

## 📚 快速参考表

| 组件 | 文件路径 | 关键行号 |
|------|---------|---------|
| **数据库文件** | `src/data/apartments_v2.csv` | - |
| **数据库加载** | `src/server/utils/csv-loader.ts` | 415 |
| **RAG 推理** | `src/server/services/rag/reasoning.ts` | 41 |
| **RAG 检索** | `src/server/services/rag/retrieval.ts` | 41 |
| **RAG 验证** | `src/server/services/rag/verification.ts` | - |
| **LLM 格式化** | `src/server/services/openai.ts` | 44 |
| **LLM 解析** | `src/server/services/openai.ts` | 80 |
| **上下文感知** | `src/server/utils/context-aware.ts` | 42 |
| **整合点** | `src/app/api/chat/route.ts` | 281, 297, 435 |

---

## 💡 提示

- **查看文件顶部注释**：每个关键文件都有详细的文档说明
- **查看整合点**：`src/app/api/chat/route.ts` 展示所有组件的使用方式
- **使用搜索**：使用 `grep` 或 IDE 搜索功能查找特定函数

---

**最后更新**: 2024年


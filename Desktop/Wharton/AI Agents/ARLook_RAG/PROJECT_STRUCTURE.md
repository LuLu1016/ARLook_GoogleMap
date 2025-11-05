# ARLook RAG - 项目结构说明

## 📁 目录结构

```
ARLook_RAG/
├── app/                          # Next.js App Router 目录
│   ├── api/                      # API 路由
│   │   ├── admin/                # 管理 API
│   │   │   └── properties/       # 房源管理
│   │   ├── chat/                 # 聊天 API
│   │   ├── properties/            # 房源查询 API
│   │   ├── search/                # 搜索 API
│   │   ├── rag-status/           # RAG 状态 API
│   │   └── test-*/               # 测试 API（开发/调试用）
│   ├── components/               # React 组件
│   │   ├── ChatSidebar.tsx       # 聊天侧边栏
│   │   └── MapContainer.tsx      # 地图容器
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
│
├── lib/                          # 业务逻辑库
│   ├── csv-loader.ts             # CSV 数据加载
│   ├── google-maps.ts            # Google Maps 工具函数
│   ├── openai.ts                 # OpenAI API 工具
│   ├── properties.ts             # 房源数据处理
│   ├── rag-verification.ts       # RAG 验证逻辑
│   └── retrieval.ts              # RAG 检索逻辑
│
├── types/                        # TypeScript 类型定义
│   └── index.ts                  # 共享类型
│
├── data/                         # 数据文件
│   ├── apartments.csv             # 旧格式 CSV
│   ├── apartments_new.csv        # 新格式 CSV
│   └── apartments_v2.csv         # 最新格式 CSV
│
├── scripts/                      # 脚本文件
│   ├── test/                     # 测试脚本
│   │   ├── test-openai.ts        # OpenAI 测试
│   │   ├── test-verification.mjs # 验证脚本
│   │   ├── preview.html          # 预览页面
│   │   └── test-api-key.html     # API Key 测试
│   └── setup-api-key.sh          # API Key 设置脚本
│
├── docs/                         # 文档目录
│   ├── setup/                    # 设置文档
│   │   ├── API_KEY_SETUP.md
│   │   ├── API_KEY_VERIFICATION.md
│   │   ├── ENV_SETUP.md
│   │   ├── GOOGLE_MAPS_SETUP.md
│   │   ├── HOW_TO_GET_API_KEY.md
│   │   └── OPENAI_SETUP.md
│   ├── deployment/                # 部署文档
│   │   └── DEPLOYMENT_GUIDE.md
│   ├── testing/                  # 测试文档
│   │   ├── COMPREHENSIVE_TEST.md
│   │   ├── FINAL_VERIFICATION.md
│   │   ├── QUALITY_CHECK.md
│   │   ├── QUERY_TESTING_GUIDE.md
│   │   ├── QUICK_VERIFY.md
│   │   ├── RAG_PERFORMANCE.md
│   │   ├── RAG_UPDATE_GUIDE.md
│   │   └── TEST_RESULTS.md
│   ├── architecture/             # 架构文档
│   │   ├── ARCHITECTURE.md
│   │   ├── BACKEND_ARCHITECTURE.md
│   │   ├── CODE_REVIEW.md
│   │   ├── FEATURE_SUMMARY.md
│   │   └── STRUCTURE_CONFIRMATION.md
│   ├── CSV_INTEGRATION.md        # CSV 集成文档
│   ├── TROUBLESHOOTING.md        # 故障排除
│   ├── FRONTEND_PREVIEW.md       # 前端预览
│   └── UI_PREVIEW.md             # UI 预览
│
├── .gitignore                    # Git 忽略文件
├── .eslintrc.json                # ESLint 配置
├── deploy.sh                     # 部署脚本
├── LICENSE                       # 许可证
├── next-env.d.ts                 # Next.js 类型定义
├── package.json                  # 项目依赖
├── package-lock.json             # 依赖锁定文件
├── postcss.config.js             # PostCSS 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
│
├── README.md                     # 项目说明（主文档）
├── PROJECT_SPEC.md               # 项目规范
├── PROJECT_STRUCTURE.md          # 项目结构说明（本文件）
├── CONTRIBUTING.md               # 贡献指南
├── ROADMAP.md                    # 路线图
└── CHANGELOG.md                  # 更新日志
```

## 🎯 设计原则

### 1. **关注点分离**
- `app/` - Next.js 应用层（路由、组件、页面）
- `lib/` - 业务逻辑层（可复用的工具函数）
- `types/` - 类型定义层
- `data/` - 数据层（CSV 文件）
- `docs/` - 文档层（按功能分类）

### 2. **可扩展性**
- **API 路由**: 按功能模块组织（`api/chat/`, `api/properties/`）
- **组件**: 可复用组件放在 `app/components/`
- **工具函数**: 按功能分类（`lib/google-maps.ts`, `lib/openai.ts`）

### 3. **文档组织**
- **设置文档**: `docs/setup/` - API Key 配置、环境变量设置
- **测试文档**: `docs/testing/` - 测试指南、性能报告
- **架构文档**: `docs/architecture/` - 系统设计、代码审查
- **部署文档**: `docs/deployment/` - 部署指南

### 4. **测试和脚本**
- **测试脚本**: `scripts/test/` - 所有测试相关脚本
- **部署脚本**: 根目录的 `deploy.sh` - 快速部署

## 📝 文件命名规范

### 组件文件
- 使用 PascalCase: `ChatSidebar.tsx`, `MapContainer.tsx`

### 工具文件
- 使用 kebab-case: `csv-loader.ts`, `google-maps.ts`

### 文档文件
- 使用 UPPER_SNAKE_CASE: `API_KEY_SETUP.md`, `DEPLOYMENT_GUIDE.md`

### API 路由
- 使用小写: `route.ts` (Next.js App Router 约定)

## 🔄 未来扩展建议

### 添加新功能时：

1. **新 API 路由**: 
   ```
   app/api/[feature-name]/route.ts
   ```

2. **新组件**: 
   ```
   app/components/[ComponentName].tsx
   ```

3. **新工具函数**: 
   ```
   lib/[feature-name].ts
   ```

4. **新类型定义**: 
   ```
   types/index.ts (添加新接口)
   ```

### 添加新数据源：

1. **CSV 文件**: 
   ```
   data/[source-name].csv
   ```

2. **数据加载器**: 
   ```
   lib/[source-name]-loader.ts
   ```

3. **更新主加载器**: 
   ```
   lib/csv-loader.ts (调用新加载器)
   ```

## 📚 文档更新流程

1. **设置相关** → `docs/setup/`
2. **测试相关** → `docs/testing/`
3. **架构相关** → `docs/architecture/`
4. **部署相关** → `docs/deployment/`
5. **通用文档** → `docs/` 根目录

## ✅ 最佳实践

1. **保持简洁**: 每个文件只负责一个功能
2. **类型安全**: 使用 TypeScript 类型定义
3. **文档先行**: 新功能先写文档
4. **测试覆盖**: 重要功能添加测试
5. **代码审查**: 提交前检查代码质量

## 🚫 不应提交的文件

以下文件/目录已在 `.gitignore` 中：
- `node_modules/` - 依赖包
- `.next/` - Next.js 构建输出
- `.env.local` - 本地环境变量
- `.env` - 环境变量文件
- `*.log` - 日志文件
- `.DS_Store` - macOS 系统文件

## 📦 依赖管理

- **生产依赖**: `package.json` 的 `dependencies`
- **开发依赖**: `package.json` 的 `devDependencies`
- **锁定文件**: `package-lock.json` 确保版本一致性

## 🔍 代码质量

- **TypeScript**: 严格类型检查
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化（可选）


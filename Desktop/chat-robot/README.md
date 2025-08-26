# AI聊天陪伴机器人 - ChatRobot

一个功能丰富的AI聊天应用，支持多人格选择、情感化交互和实时预览功能。包含完整的人格工作室，可以创建、编辑和测试自定义AI人格。

## ✨ 核心功能

### 🎭 多人格聊天
- **预设人格**: 温柔、毒舌、学术、治愈等多种预设人格
- **情感交互**: 基于语义的情绪分析，实时表情反馈
- **流式对话**: 支持Markdown渲染的流畅聊天体验
- **会话管理**: 完整的会话历史持久化存储

### 🎨 人格工作室
- **可视化编辑**: 六维语气雷达图，直观调整人格特征
- **实时预览**: 即时测试人格响应，支持对比模式
- **版本管理**: 完整的版本历史和时间线功能
- **性能指标**: 一致性评分、Token统计、响应时间等

### 📱 用户体验
- **响应式设计**: 移动端优先的现代化界面
- **深色模式**: 完整的深色主题支持
- **快捷键**: 丰富的键盘快捷键支持
- **导入导出**: 人格配置的导入导出功能

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **样式方案**: Tailwind CSS + 自定义设计系统
- **状态管理**: Zustand + React Hooks
- **数据库**: PostgreSQL (主数据库) + SQLite (开发备用)
- **AI服务**: OpenAI API兼容接口 (支持DeepSeek等)
- **构建工具**: Vite + SWC (快速开发体验)
- **部署**: Docker + Vercel 一键部署

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- PostgreSQL 12+ (或SQLite用于开发)
- npm 或 yarn 包管理器

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd chat-robot
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量：

```env
# 必需配置
OPENAI_API_KEY=your_openai_compatible_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1

# 数据库配置 (二选一)
# PostgreSQL (推荐生产环境)
DATABASE_URL=postgresql://username:password@localhost:5432/chatrobot

# SQLite (开发环境)
DATABASE_URL=file:./db/chat.db

# 可选配置 - 情绪分析
EMOTION_API_URL=https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions
HF_TOKEN=your_huggingface_token_here

# 应用配置
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. 数据库初始化

#### PostgreSQL 设置

```sql
-- 创建数据库
CREATE DATABASE chatrobot;

-- 创建用户 (可选)
CREATE USER chatrobot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatrobot TO chatrobot_user;
```

#### 数据库迁移

```bash
# 生成Prisma客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate dev

# 或使用重置方式 (开发环境)
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始使用！

## 📁 项目结构

```
chat-robot/
├── app/                    # Next.js App Router
│   ├── api/               # API路由处理
│   │   ├── chat/          # 聊天相关API
│   │   ├── personas/      # 人格管理API
│   │   └── sessions/      # 会话管理API
│   ├── chat/              # 聊天主页面
│   ├── persona-studio/    # 人格工作室
│   └── globals.css        # 全局样式
├── components/            # React组件库
│   ├── persona-studio/    # 人格工作室组件
│   │   ├── ToneRadar.tsx  # 语气雷达图
│   │   ├── PreviewPane.tsx # 实时预览面板
│   │   └── PersonaForm.tsx # 人格表单
│   ├── MessageBubble.tsx  # 消息气泡
│   └── DraftBubble.tsx    # 草稿消息
├── lib/                   # 工具库和配置
│   ├── database.ts        # 数据库连接配置
│   ├── llm.ts            # AI模型接口
│   ├── emotion.ts        # 情绪分析
│   └── api-utils.ts      # API工具函数
├── types/                 # TypeScript类型定义
│   └── index.ts          # 共享类型
├── store/                 # 状态管理
│   └── chatStore.ts      # 聊天状态管理
├── prisma/               # 数据库schema和迁移
│   ├── schema.prisma     # Prisma数据模型
│   └── migrations/       # 数据库迁移文件
├── db/                   # 数据库文件 (SQLite)
├── __tests__/            # 单元测试
└── public/               # 静态资源
```

## 🎯 主要功能详解

### 人格工作室 (Persona Studio)

人格工作室是一个完整的可视化编辑环境，允许用户：

1. **创建和编辑人格**: 通过直观的表单界面定义AI人格特征
2. **语气配置**: 使用六维雷达图调整温柔、直接、学术等语气特征
3. **实时预览**: 即时测试人格响应，支持单一和对比预览模式
4. **版本管理**: 完整的版本历史，支持版本对比和恢复
5. **性能监控**: 实时显示一致性评分、Token使用、响应时间等指标

### 聊天系统

- **多会话管理**: 创建、切换、删除聊天会话
- **流式响应**: 实时显示AI生成内容
- **情感反馈**: 基于消息内容的实时表情反应
- **消息持久化**: 所有聊天记录自动保存
- **导入导出**: 支持会话数据的导入导出

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 运行测试
npm test

# 数据库相关
npx prisma studio      # 打开数据库管理界面
npx prisma generate    # 生成Prisma客户端
npx prisma migrate dev # 创建并应用迁移
npx prisma db push     # 直接同步数据库schema
```

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重建镜像
docker-compose up -d --build
```

### 环境变量配置

创建 `docker-compose.override.yml` 用于自定义配置：

```yaml
version: '3.8'
services:
  app:
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/chatrobot
      - OPENAI_API_KEY=your_api_key_here
    ports:
      - "3000:3000"
```

## ☁️ Vercel 部署

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### 手动部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod

# 配置环境变量于Vercel控制台
```

## 📊 监控和维护

### 健康检查

```bash
# API健康检查
curl http://localhost:3000/api/health

# 数据库连接检查
curl http://localhost:3000/api/personas
```

### 日志管理

应用日志输出到控制台，生产环境建议：

1. 配置集中式日志收集 (ELK、Loki等)
2. 设置日志级别和轮转策略
3. 监控错误率和性能指标

### 数据库维护

```bash
# 备份数据库
pg_dump chatrobot > backup.sql

# 恢复数据库
psql chatrobot < backup.sql

# 性能优化
npx prisma studio # 使用Prisma Studio进行数据管理
```

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查PostgreSQL服务是否运行
   - 验证连接字符串格式
   - 确认防火墙设置

2. **API密钥错误**
   - 检查OPENAI_API_KEY是否正确设置
   - 确认API服务可用性

3. **构建错误**
   - 运行 `npm run type-check` 检查类型错误
   - 清除node_modules重新安装依赖

4. **内存不足**
   - Node.js内存限制: `NODE_OPTIONS="--max-old-space-size=4096"`

### 获取帮助

1. 查看控制台错误信息
2. 检查环境变量配置
3. 验证网络连接
4. 查阅项目文档

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范

- 使用TypeScript严格模式
- 遵循ESLint代码规范
- 编写适当的单元测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Prisma](https://prisma.io/) - 数据库ORM
- [OpenAI](https://openai.com/) - 替代AI模型服务
- [DeepSeek](https://deepseek.com/) - AI模型服务

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 创建 [GitHub Issue](https://github.com/your-username/chat-robot/issues)
- 发送邮件至: asdfadq123@163.com

---

⭐ 如果这个项目对你有帮助，请给它一个Star！
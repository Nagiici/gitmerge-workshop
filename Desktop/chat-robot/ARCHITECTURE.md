# Persona Studio 架构文档

## 项目概述

这是一个完整的 AI 人格可视化微调系统，基于现有的聊天机器人项目构建，添加了全面的人格管理功能。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **测试**: Jest + React Testing Library

## 核心功能

### 1. 人格管理 (CRUD)
- 创建、编辑、删除、复制人格
- 版本控制与差异对比
- 导入/导出功能
- 权限控制（公开/私有）

### 2. 可视化面板
- **语气雷达图**: 6维度语气特征可视化
- **一致性仪表盘**: 人格表现评分
- **统计指标**: 使用数据和性能指标
- **版本时间线**: 版本历史和变更追踪

### 3. 实时预览与 A/B 测试
- 单一预览模式
- 双人格对比模式
- 实时响应生成
- 性能指标分析

### 4. 增强配置
- **语气配置**: 6个维度的滑块控制
- **Few-Shot 示例**: 对话样例管理
- **风格指南**: 写作风格定义
- **行为约束**: Do's 和 Don'ts 列表
- **安全适配器**: 内容过滤规则

## 文件结构

```
project/
├── app/
│   ├── api/
│   │   ├── personas/
│   │   │   ├── route.ts                 # 人格 CRUD API
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts             # 单个人格操作
│   │   │   │   └── versions/route.ts    # 版本管理
│   │   │   └── preview/route.ts         # 预览API
│   │   ├── chat/route.ts                # 增强的聊天API
│   │   └── ...
│   ├── persona-studio/
│   │   └── page.tsx                     # 人格工作室主页
│   ├── chat/page.tsx                    # 增强的聊天页面
│   └── page.tsx                         # 更新的首页
├── components/
│   └── persona-studio/
│       ├── PersonaStudioLayout.tsx      # 主布局组件
│       ├── PersonaList.tsx              # 人格列表
│       ├── PersonaForm.tsx              # 人格表单
│       ├── ToneSliders.tsx              # 语气配置滑块
│       ├── FewShotsEditor.tsx           # Few-Shot编辑器
│       ├── VisualizationPanel.tsx       # 可视化面板
│       ├── ToneRadar.tsx                # 语气雷达图
│       ├── AdherenceGauge.tsx           # 一致性仪表盘
│       ├── VersionTimeline.tsx          # 版本时间线
│       └── PreviewPane.tsx              # 预览面板
├── prisma/
│   ├── schema.prisma                    # 数据库模式
│   └── seed.ts                          # 种子数据
├── types/
│   └── index.ts                         # 扩展的类型定义
└── ...
```

## 数据模型

### 核心实体

1. **Persona** (人格)
   - 基础信息: name, avatar, description
   - 配置: systemPrompt, tone, styleGuide
   - 约束: dos, donts, safetyAdapter
   - 示例: fewShots
   - 权限: isPublic, shareToken

2. **PersonaVersion** (人格版本)
   - 版本化的人格配置
   - 变更日志
   - 支持回滚和对比

3. **PersonaMetric** (人格指标)
   - 一致性评分
   - 使用统计
   - 性能数据

4. **Session** & **Message** (会话和消息)
   - 关联到具体人格
   - 支持表情和元数据

## API 设计

### 人格管理 API

```
GET    /api/personas                    # 获取人格列表
POST   /api/personas                    # 创建新人格
GET    /api/personas/[id]              # 获取人格详情
PATCH  /api/personas/[id]              # 更新人格
DELETE /api/personas/[id]              # 删除人格
GET    /api/personas/[id]/versions     # 获取版本列表
POST   /api/personas/[id]/versions     # 创建新版本
POST   /api/personas/preview           # 预览人格回复
```

### 预览 API

```javascript
POST /api/personas/preview
{
  "persona": { /* 人格配置 */ },
  "message": "测试消息",
  "options": { /* 可选参数 */ }
}

Response:
{
  "content": "AI回复内容",
  "emotion": "happy",
  "emoji": "😊",
  "metrics": {
    "adherenceScore": 0.85,
    "tokenCount": 120,
    "responseTime": 1200,
    "cost": 0.003
  }
}
```

## 组件设计

### PersonaStudioLayout
主布局组件，管理整体状态和数据流：
- 左侧：人格列表和搜索
- 中间：表单编辑区域
- 右侧：可视化和预览面板

### PersonaForm
多标签页表单，包含：
- 基础信息 (名称、描述、标签)
- 语气配置 (6维度滑块)
- 示例管理 (Few-Shot编辑)
- 高级设置 (风格指南、约束)
- 版本历史

### 可视化组件
- **ToneRadar**: Canvas绘制的雷达图
- **AdherenceGauge**: Canvas绘制的仪表盘
- **VersionTimeline**: 时间线式版本展示

### 预览组件
- 实时消息预览
- 双人格对比模式
- 性能指标显示

## 特色功能

### 1. 语气可视化
6个维度的语气特征：
- 温柔度 (Gentle)
- 直接度 (Direct) 
- 学术性 (Academic)
- 治愈性 (Healing)
- 幽默度 (Humor)
- 正式度 (Formal)

### 2. 一致性评分
基于多个因素计算人格一致性：
- 语气匹配度
- 风格遵循度
- 禁忌词避免
- 示例学习度

### 3. 版本控制
- 自动版本创建
- 差异高亮显示
- 一键回滚功能
- 变更日志记录

### 4. A/B 测试
- 并排对比预览
- 实时性能对比
- 成本和时延分析

## 部署注意事项

1. **数据库迁移**: 运行 `npx prisma migrate deploy`
2. **种子数据**: 运行 `npm run db:seed`
3. **环境变量**: 配置 `DATABASE_URL` 和 LLM API 密钥
4. **权限配置**: 设置文件上传和导入限制

## 安全考虑

1. **输入验证**: 所有用户输入都经过验证和清理
2. **敏感词过滤**: 系统提示词和配置自动过滤敏感内容
3. **权限控制**: 私有人格仅创建者可见
4. **文件安全**: 导入文件类型和大小限制

## 性能优化

1. **数据库索引**: 在常用查询字段上添加索引
2. **缓存策略**: API 响应缓存
3. **懒加载**: 大型组件按需加载
4. **虚拟化**: 长列表使用虚拟滚动

## 未来扩展

1. **协作功能**: 多用户共同编辑人格
2. **模板市场**: 公共人格模板库
3. **高级分析**: 更多性能和用户行为分析
4. **自动调优**: 基于反馈自动优化人格配置
5. **插件系统**: 支持第三方扩展功能

## 验收清单

✅ 新建人格并配置所有字段
✅ Few-Shot 示例添加和编辑
✅ 语气滑块实时调整
✅ 预览功能生成回复
✅ A/B 对比测试
✅ 版本创建和差异查看
✅ 导入/导出功能
✅ 权限控制和校验
✅ 在聊天页面选择和应用人格
✅ 可视化图表实时更新
✅ 移动端基础适配

## 维护指南

1. **定期更新**: 保持依赖包最新
2. **监控指标**: 关注API响应时间和错误率
3. **数据备份**: 定期备份人格配置数据
4. **性能测试**: 定期进行负载测试
5. **用户反馈**: 收集和处理用户使用反馈
# e-Agent-OS 架构文档

> 企业数字员工操作系统 · 架构设计 v1.0

---

## 一、产品定位

**e-Agent-OS** = 企业数字员工操作系统

核心价值主张：
- **生产工厂**：一套模板，N个岗位，分钟级创建数字员工
- **运营中心**：效率/成本/质量三维可观测，ROI可量化
- **知识中心**：企业知识资产化，AIGC自动沉淀
- **模型中心**：供应商解耦，智能路由，成本可控

---

## 二、核心业务对象

```
Tenant（企业租户）
    │
    ├── AgentFamily（岗位族）
    │       ├── SOUL配置（人格/MBTI/沟通风格）
    │       ├── IDENTITY配置（岗位/工号/飞书ID）
    │       ├── AGENT配置（职责/边界/绩效/KPI）
    │       └── Policy配置（工具/权限/审批规则）
    │       │
    │       └── AgentInstance[]（数字分身）
    │               ├── Session（会话隔离）
    │               ├── SkillBinding[]（技能绑定）
    │               └── Memory（短期记忆）
    │
    ├── Skill（技能） ← L1通用/L2岗位/L3临时
    │
    ├── Knowledge（知识） ← 文档/案例/SOP
    │
    └── Model（模型） ← MaaS接入/路由策略
```

**关键设计逻辑**：
- AgentFamily 间完全隔离
- AgentInstance 间共享资产（技能、知识、权限模板）
- Session 完全独立

---

## 三、系统架构

### 3.1 逻辑架构总图

```
╔══════════════════════════════════════════════════════════════════╗
║                      渠道层 Channel Layer                       ║
║        飞书(1+N) │ Webhook │ 定时调度 │ 事件总线                 ║
╚═══════════════════════════════╤════════════════════════════════╝
                                │
╔═══════════════════════════════▼════════════════════════════════╗
║                      网关层 Agent Gateway                       ║
║  统一鉴权 │ 租户隔离 │ 路由分发 │ TLS加密 │ 限流熔断 │ 会话编排 ║
╚═══════════════════════════════╤════════════════════════════════╝
                                │
╔═══════════════════════════════▼════════════════════════════════╗
║               运行时层 Agent Runtime Orchestrator               ║
║  AgentFamily调度 │ Session管理 │ Task规划 │ Tool调度 │ HITL    ║
╚═══════════════════════════════╤════════════════════════════════╝
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
╔═══════▼═══════╗   ╔══════════▼══════════╗   ╔═══════▼═══════╗
║   技能中心     ║   ║      知识中心         ║   ║   模型中心    ║
║  SkillHub     ║   ║   KnowledgeHub        ║   ║   ModelHub   ║
║ 三层技能体系  ║   ║ AgenticRAG            ║   ║ 多MaaS接入   ║
║ 发布流水线    ║   ║ 多向量引擎            ║   ║ 智能路由     ║
║ 安全质检      ║   ║ AIGC知识沉淀          ║   ║ 流控与配额   ║
╚═══════╤═══════╝   ╚══════════╤══════════╝   ╚═══════╤═══════╝
        │                          │                      │
        └──────────────────────────┼──────────────────────┘
                                   │
╔═════════════════════════════════▼══════════════════════════════╗
║                        连接器层 ConnectorHub                      ║
║           CLI适配器 >> MCP适配器 >> API适配器 >> CU/BU          ║
╚═════════════════════════════════╤════════════════════════════════╝
                                   │
╔═════════════════════════════════▼══════════════════════════════╗
║                    治理与运营层 Governance & Ops                 ║
║       审计Trace │ Badcase运营 │ ROI看板 │ 配置中心(推拉同步)     ║
╚══════════════════════════════════════════════════════════════════╝
```

### 3.2 模块依赖关系

```
                    Gateway
                        │
                        ▼
                   Runtime
                     │   │
          ┌──────────┘   └──────────┐
          │                         │
    ┌─────▼─────┐          ┌───────▼──────┐
    │ SkillHub  │          │KnowledgeHub   │
    └───────────┘          └───────┬───────┘
                                   │
                          ┌────────▼────────┐
                          │   ModelHub     │
                          └───────┬────────┘
                                  │
                          ┌───────▼───────┐
                          │ ConnectorHub  │
                          └───────────────┘

OpsCenter 聚合所有模块数据
Governance 被 Gateway/Runtime 调用
```

---

## 四、核心模块规格

### 4.1 Gateway（网关层）

**职责**：
- 统一入口鉴权（飞书 token / Bearer token）
- 租户隔离与上下文注入
- 请求路由（按 AgentFamily / Channel / 任务类型）
- 限流熔断与降级策略
- 会话 ID 生成与 Session 前缀路由

**核心接口**：
```http
POST /gateway/dispatch      # 任务分发
POST /gateway/callback      # Webhook回调
GET  /gateway/session/{id}  # 会话历史
GET  /gateway/health        # 健康检查
```

**错误码前缀**：`1xxx`

### 4.2 Runtime（运行时层）

**职责**：
- AgentFamily 实例生命周期管理
- 任务规划与执行（Plan → Act → Reflect）
- 工具调用编排与结果聚合
- 短期记忆（Session Context）管理
- 失败重试与降级策略

**任务执行流程**：
```
输入 → 意图理解 → 技能匹配 → 知识检索 → 生成计划
       ↓
  执行步骤循环（Plan → Act → Reflect）
       ↓
  成功返回 / 失败处理（重试/接管）
```

**核心接口**：
```http
POST /runtime/execute       # 执行任务
POST /runtime/plan          # 获取执行计划
GET  /runtime/status/{id}   # 查询状态
POST /runtime/cancel/{id}   # 取消任务
```

**错误码前缀**：`2xxx`

### 4.3 ModelHub（模型中心）

**职责**：
- 多模型统一接入（OpenAI / Claude / 国内MaaS）
- 动态路由策略（按任务类型 / 成本 / SLA）
- Token 配额与用量统计
- 失败自动降级

**路由策略**：
| 任务类型 | 首选模型 | 降级模型 |
|----------|----------|----------|
| planning | Claude 3.5 | GPT-4o |
| fast | GPT-4o-mini | 通义turbo |
| code | GPT-4o | Claude 3.5 |

**核心接口**：
```http
POST /model/chat              # 统一聊天接口
GET  /model/providers         # 模型列表
GET  /model/usage/{employee}  # 用量查询
```

**错误码前缀**：`3xxx`

### 4.4 ConnectorHub（连接器中心）

**优先级**：
1. CLI（最优）
2. MCP
3. API
4. CU/BU（最后）

**核心接口**：
```http
GET  /connectors             # 连接器列表
POST /connectors/{id}/invoke # 调用连接器
GET  /connectors/{id}/health # 健康检查
```

**错误码前缀**：`4xxx`

### 4.5 SkillHub（技能中心）

**三层技能**：
| 层级 | 说明 | 示例 |
|------|------|------|
| L1 | 企业通用技能 | 审批、通知、邮件 |
| L2 | 岗位专用技能 | 工单处理、报表生成 |
| L3 | 场景临时技能 | 一次性任务 |

**生命周期**：
```
Draft → Testing → Staging → Published → Deprecated
```

**错误码前缀**：`5xxx`

### 4.6 KnowledgeHub（知识中心）

**检索流程**：
```
查询 → 预处理 → 多路召回（向量+全文+关键词）
       ↓
     融合重排 → 证据组装 → 返回结果
```

**AIGC沉淀**：
```
AgentFamily历史任务 → 案例提取
       ├──► Skill（COE专家审核后形成可执行技能）
       └──► Knowledge（案例/复盘/Playbook）
```

**错误码前缀**：`6xxx`

### 4.7 OpsCenter（运营中心）

**三大运营闭环**：
1. Badcase 运营：受理 → 分类分流 → 根因修复 → 验证闭环
2. 能效运营：AgentFamily级 / AgentInstance级 / Skill级指标
3. 审计Trace：全链路事件日志，每次任务 TraceID 可回放

### 4.8 Governance（治理模块）

**角色定义**：
| 角色 | 权限范围 |
|------|----------|
| platform_admin | 所有权限 |
| tenant_admin | 租户内所有权限 |
| tenant_operator | 租户内运营权限 |
| employee_user | 基础使用权限 |

---

## 五、数据模型

### 5.1 核心实体关系

```
Tenant
    │
    ├── TenantMember
    │
    └── AgentTemplate
            │
            └── DigitalEmployee
                    │
                    ├── Task
                    │       └── TaskStep
                    │
                    └── SkillInvocation
                            │
                            └── ConnectorCall
```

### 5.2 主要数据表

| 表名 | 说明 |
|------|------|
| tenants | 租户表 |
| tenant_members | 租户成员表 |
| digital_employees | 数字员工表 |
| agent_templates | 员工模板表 |
| tasks | 任务表 |
| task_steps | 任务步骤表 |
| skills | 技能表 |
| skill_capabilities | 技能能力表 |
| knowledge_documents | 知识文档表 |
| document_chunks | 文档分块表 |
| model_calls | 模型调用表 |
| audit_logs | 审计日志表 |
| alerts | 告警表 |

---

## 六、部署架构

### 6.1 服务拆分

```
apps/
├── gateway/           # 网关服务（1-2实例）
├── runtime/          # 运行时服务（N实例，无状态）
├── model-hub/        # 模型中心（1-2实例）
├── connector-hub/    # 连接器中心（1-2实例）
├── skill-hub/        # 技能中心（1实例）
├── knowledge-hub/    # 知识中心（1-2实例）
├── governance/       # 治理服务（1-2实例）
├── ops-center/       # 运营中心（1实例）
└── admin-portal/     # 管理Portal
```

### 6.2 基础设施

| 组件 | 推荐方案 | 说明 |
|------|----------|------|
| 数据库 | PostgreSQL | 主数据存储 |
| 缓存 | Redis | Session、限流、缓存 |
| 消息队列 | RabbitMQ/Kafka | 异步任务、事件 |
| 向量数据库 | Qdrant | 知识检索 |
| 对象存储 | S3/MinIO | 文档、日志 |
| 日志 | Loki | 日志收集分析 |
| 监控 | Prometheus+Grafana | 指标监控 |

---

## 七、开发路线图

| 阶段 | 时间 | 里程碑 |
|------|------|--------|
| **Phase 0** | Week 1-4 | 核心闭环：Gateway + Runtime + ModelHub + 1连接器 |
| **Phase 1** | Week 5-8 | 能力丰富：SkillHub + KnowledgeHub + 运营看板 |
| **Phase 2** | Week 9-12 | 治理增强：RBAC/ABAC + 审批流 + 多租户 |

---

**文档版本**: v1.0
**创建日期**: 2026-03-28

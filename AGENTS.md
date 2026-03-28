# AGENTS.md - 开发地图

> 本文件是进入代码仓库的入口地图。Codex从这里开始导航。

## 项目概述

**e-Agent-OS** = 企业数字员工操作系统
目标：构建企业数字员工的"兵工厂 + 运营中心"。

## 架构地图

```
┌─────────────────────────────────────────────────────────┐
│                    渠道层 Channel Layer                  │
│            飞书机器人 | Webhook | 定时任务                │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                 网关层 Gateway Layer                   │
│        统一鉴权 | 路由分发 | 限流熔断 | 会话管理          │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              运行时层 Agent Runtime Layer                │
│     AgentFamily管理 | Session管理 | Task规划              │
│     Tool调度 | Human-in-Loop                             │
└─────────────┬───────────────────────┬───────────────────┘
              │                       │
┌─────────────▼───────┐ ┌─────────────▼───────┐ ┌─────────▼─────────┐
│    技能中心         │ │    知识中心          │ │   模型中心        │
│    SkillHub        │ │   KnowledgeHub       │ │   ModelHub       │
│    apps/skill-hub  │ │   apps/knowledge-hub │ │   apps/model-hub │
└─────────────┬───────┘ └─────────────┬───────┘ └─────────┬─────────┘
              │                       │                   │
              └───────────────────────┼───────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────┐
│                 连接器层 ConnectorHub                    │
│              CLI > MCP > API > CU/BU                     │
└─────────────────────────────────────┬───────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────┐
│              治理与运营层 Governance & Ops                 │
│     审计Trace | Badcase运营 | ROI看板 | 配置中心          │
└───────────────────────────────────────────────────────────┘
```

## 模块导航

| 模块 | 路径 | 职责 | 状态 |
|------|------|------|------|
| Gateway | `apps/gateway/` | 统一接入、鉴权、路由 | 待开发 |
| Runtime | `apps/runtime/` | Agent生命周期、任务执行 | 待开发 |
| ModelHub | `apps/model-hub/` | 多模型接入、路由、配额 | 待开发 |
| ConnectorHub | `apps/connector-hub/` | IT系统连接器管理 | 待开发 |
| SkillHub | `apps/skill-hub/` | 技能注册、发现、发布 | 待开发 |
| KnowledgeHub | `apps/knowledge-hub/` | 知识接入、检索、沉淀 | 待开发 |
| OpsCenter | `apps/ops-center/` | 运营指标、告警、Badcase | 待开发 |
| AdminPortal | `apps/admin-portal/` | 管理后台 | 待开发 |

## 关键文档

| 文档 | 位置 | 用途 |
|------|------|------|
| 架构文档 | `ARCHITECTURE.md` | 完整架构设计 |
| 开发军规 | `DEVELOPMENT.md` | 开发规范与流程 |
| 质量标准 | `QUALITY.md` | 质量要求与检查项 |
| Phase 1 详细设计 | `docs/phase1-design.md` | 核心模块详细规格 |

## 入口点

```bash
# 启动所有服务（开发模式）
uvicorn apps.gateway.main:app --reload --port 8000

# 运行测试
pytest tests/ -v

# 运行 lint
ruff check apps/ common/ configs/

# 查看覆盖率
pytest tests/ --cov=apps --cov=common --cov-report=html
```

## 设计原则（来自 Harness Engineering）

1. **代码仓库是唯一真实来源** — 所有决策必须 commit 到仓库
2. **渐进式披露** — 从小入口开始，不要给AI淹没性信息
3. **架构约束必须机械执行** — 没有 linter 验证的规则 = 不存在的规则
4. **人类品味编码进系统** — 发现问题后，将规则编码防止复发
5. **熵管理自动化** — 定期运行垃圾回收，保持代码库健康

## 快速命令

```bash
# 启动 gateway
cd apps/gateway && uvicorn main:app --reload

# 启动 runtime
cd apps/runtime && uvicorn main:app --reload

# 运行全量测试
pytest tests/ -v --cov

# 查看活跃的执行计划
ls docs/exec-plans/active/
```

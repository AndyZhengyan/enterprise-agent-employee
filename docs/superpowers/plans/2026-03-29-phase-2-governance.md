# Phase 2 — 治理增强：RBAC + 审批流 + 多租户

> **For agentic workers:** Phase 1 验收完成后开始本计划。
> 详细 Task 内容在 Phase 1 验收后根据实际情况细化。

**Goal:** 完成企业级数字员工平台必需的治理能力——权限体系、审批流、多租户隔离，为正式生产部署做好准备。

**Architecture:**
- RBAC/ABAC: 基于角色 + 属性的动态权限控制
- 审批流: 高风险操作的二级审批或多级审批
- 多租户: Tenant 完全隔离，数据权限严格划分
- 配置中心: 集中配置 + 推拉同步

**Tech Stack:** Python 3.11, FastAPI, PostgreSQL, Redis

---

## Phase 2 里程碑

| 里程碑 | 说明 | 验收条件 |
|--------|------|----------|
| M1 | RBAC 就绪 | 角色/权限可配置，Gateway 鉴权 |
| M2 | 审批流可用 | 高风险操作触发人工审批 |
| M3 | 多租户隔离 | Tenant 间数据完全隔离 |
| M4 | 配置中心 | AgentFamily 配置可热更新 |
| M5 | Production Ready | 可在生产环境部署 |

---

## Task 1: RBAC/ABAC 权限体系

**规格依据:** `ARCHITECTURE.md` 4.8 节，角色定义表

**Files:**
- Create: `apps/governance/`
  - `__init__.py`
  - `main.py` — FastAPI 入口
  - `rbac.py` — 角色/权限定义
  - `abac.py` — 属性策略引擎
  - `middleware.py` — Gateway 鉴权中间件

**详细步骤:** （Phase 1 验收后补充）

---

## Task 2: 审批流引擎

**规格依据:** `ARCHITECTURE.md` 4.7 节，Escalation 机制

**Files:**
- Modify: `apps/governance/approval.py` — 审批流状态机
- Modify: `apps/runtime/executor.py` — 高风险操作触发审批

**详细步骤:** （Phase 1 验收后补充）

---

## Task 3: 多租户隔离

**规格依据:** `ARCHITECTURE.md` 5.1 节，核心实体关系

**Files:**
- Modify: `apps/gateway/main.py` — Tenant 中间件
- Modify: `apps/runtime/` — Tenant 上下文传递
- Modify: `common/models.py` — Tenant 相关模型

**详细步骤:** （Phase 1 验收后补充）

---

## Task 4: 配置中心

**规格依据:** `ARCHITECTURE.md` 4.7 节，推拉同步

**Files:**
- Create: `apps/ops-center/config_store.py` — 配置存储
- Modify: `configs/agent-families/` — AgentFamily YAML 配置

**详细步骤:** （Phase 1 验收后补充）

---

## Task 5: 完整 E2E 测试 + 部署文档

**目的:** Phase 2 完成后，验证完整系统可端到端运行。

**Files:**
- Create: `tests/e2e/` — 端到端测试
- Create: `docs/deployment.md` — 部署文档

---

## 架构约束（从 ARCHITECTURE.md）

```
✅ 每层职责严格遵守（禁止跨层直接调用）
✅ AgentFamily 配置必须包含 SOUL/IDENTITY/AGENT/POLICY 四段
✅ 循环依赖严格禁止
✅ 跨模块调用必须通过接口，不通过具体实现
```

---

**文档版本**: v0.1
**创建日期**: 2026-03-29
**前置**: Phase 1 验收完成
**状态**: 框架，待 Phase 1 验收后细化

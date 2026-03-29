# e-Agent-OS Master Roadmap

> **For agentic workers:** 执行本路标前，请先阅读 CLAUDE.md、ARCHITECTURE.md、DEVELOPMENT.md 了解项目全貌。
> 每个 Phase 为独立计划文件，链接在下方。

**Goal:** 完成 e-Agent-OS 全部三个 Phase，从 MVP 核心闭环到完整的企业级数字员工平台。

**Architecture:** 三阶段渐进式建设：
- Phase 0：核心闭环（Gateway + Runtime + 1连接器）
- Phase 1：能力丰富（ModelHub + SkillHub + KnowledgeHub + ConnectorHub）
- Phase 2：治理增强（RBAC + 审批流 + 多租户）

**Tech Stack:** Python 3.11, FastAPI, Pydantic 2.x, structlog, Redis, PostgreSQL (Phase 1+), OpenClaw PiAgent

---

## 项目全景

```
Phase 0: MVP 核心闭环 (Week 1-4)  ← 当前位置
Phase 1: 能力丰富 (Week 5-8)
Phase 2: 治理增强 (Week 9-12)
```

---

## Phase 0 现状（详细分析）

| 模块 | 文件 | 状态 | 说明 |
|------|------|------|------|
| CI/CD | `.github/workflows/ci.yml` | ✅ 完成 | Lint → Test → Security |
| common/models | `common/models.py` | ✅ 完成 | 325行，所有核心类型 |
| common/errors | `common/errors.py` | ✅ 完成 | 222行，1xxx-9xxx 错误码 |
| common/tracing | `common/tracing.py` | ✅ 完成 | structlog + trace context |
| Gateway | `apps/gateway/main.py` | ⚠️ 部分 | 主体完成，但有安全漏洞 |
| Runtime 逻辑 | `apps/runtime/executor.py` | ✅ 完成 | Plan→Act→Reflect 循环 |
| Runtime 模型 | `apps/runtime/models.py` | ✅ 完成 | 所有请求/响应模型 |
| Runtime 记忆 | `apps/runtime/memory.py` | ✅ 完成 | Session 管理 + 压缩 |
| Runtime PiAgent | `apps/runtime/piagent_client.py` | ✅ 完成 | CLI 封装 |
| Runtime FastAPI | `apps/runtime/main.py` | ❌ 缺失 | **Phase 0 卡点** |
| Gateway 安全 | `apps/gateway/main.py:259` | ❌ 缺陷 | `details=str(exc)` 泄漏异常 |
| E2E 测试 | `tests/` | ⚠️ 缺 | 只有单元测试，无集成测试 |

---

## Phase 0 执行计划

**前置条件：** `apps/runtime/main.py` 缺失导致 Phase 0 无法完成，Phase 1/2 无法开始。

详细计划见：[`2026-03-29-phase-0-completion.md`](./2026-03-29-phase-0-completion.md)

### Phase 0 步骤清单

```
[Plan] phase-0-completion

Task 1: 修复 Gateway 安全漏洞 (details=str(exc))
Task 2: 创建 apps/runtime/main.py FastAPI 入口
Task 3: 修复 executor.py bug (冗余赋值 skill_name)
Task 4: 补全 Runtime E2E 集成测试
Task 5: 运行全量检查 (ruff + mypy + pytest) 确认 green
Task 6: 验收 Phase 0
```

---

## Phase 1 执行计划

**前置条件：** Phase 0 完成。

详细计划见：[`2026-03-29-phase-1-hubs.md`](./2026-03-29-phase-1-hubs.md)

### Phase 1 步骤清单

```
[Plan] phase-1-hubs

Task 1: ModelHub — 多模型接入 + 智能路由
Task 2: ConnectorHub — CLI/MCP/API 连接器注册
Task 3: SkillHub — 技能注册 + 生命周期管理
Task 4: KnowledgeHub — AgenticRAG 基础实现
Task 5: 运营看板基础 (OpsCenter v1)
Task 6: Gateway → Runtime → 各 Hub 端到端串联
Task 7: 验收 Phase 1
```

---

## Phase 2 执行计划

**前置条件：** Phase 1 完成。

详细计划见：[`2026-03-29-phase-2-governance.md`](./2026-03-29-phase-2-governance.md)

### Phase 2 步骤清单

```
[Plan] phase-2-governance

Task 1: RBAC/ABAC 权限体系
Task 2: 审批流引擎
Task 3: 多租户隔离
Task 4: 配置中心 (推拉同步)
Task 5: 完整 E2E 测试
Task 6: 部署文档
Task 7: 验收 Phase 2 / Production Ready
```

---

## 当前决策日志

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-29 | Phase 0 未完成，不开始 Phase 1 | Runtime FastAPI 入口缺失，CI 无法 green |
| 2026-03-29 | Phase 0 按原有 spec 执行，不重构 | Gateway/Runtime 逻辑已是最终形态 |
| 2026-03-29 | Phase 1/2 计划暂不写死，等 Phase 0 验收后再细化 | 用户可能有新需求/优先级调整 |

---

## 下一步行动

**立即开始 Phase 0 完成计划：**

```bash
# 确认当前状态
git checkout main && git pull
pytest tests/ -v 2>&1 | tail -10

# 开始执行 phase-0-completion 计划
# （见 docs/superpowers/plans/2026-03-29-phase-0-completion.md）
```

---

**文档版本**: v1.0
**创建日期**: 2026-03-29
**维护者**: 老郑 & Claude

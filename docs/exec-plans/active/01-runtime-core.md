# Exec Plan: Runtime Core（Phase 0 MVP）

## 元信息

| 字段 | 内容 |
|------|------|
| 模块 | apps/runtime/ |
| 负责人 | 老郑 & Claude |
| 开始日期 | 2026-03-28 |
| 目标日期 | TBD |
| 状态 | 🟡 进行中 |
| PR 数 | 预计 3-5 个 |

---

## 背景

Runtime（运行时层）是 e-Agent-OS 的核心，负责：
- 管理 AgentFamily 实例生命周期
- 任务规划与执行（Plan → Act → Reflect）
- 工具调用编排与结果聚合
- 短期记忆管理
- 失败重试与降级策略

**为什么先做 Runtime**：
- Gateway 已就绪，需要下游服务
- Runtime 是所有模块的依赖核心
- 其他模块（SkillHub/ModelHub）可并行开发，通过接口隔离

---

## 目标（Goals）

1. ✅ Runtime 服务可独立启动
2. ✅ 支持 `/runtime/execute` 任务执行接口
3. ✅ 支持 `/runtime/plan` 执行计划生成接口
4. ✅ 支持 `/runtime/status/{task_id}` 状态查询
5. ✅ 支持 `/runtime/cancel/{task_id}` 任务取消
6. ✅ Plan → Act → Reflect 循环可执行
7. ✅ 短期记忆（Session Context）管理
8. ✅ 失败重试与超时处理
9. ✅ 人工接管（Escalation）机制

---

## 不做（Out of Scope）

- SkillHub 集成（Phase 1）
- KnowledgeHub 集成（Phase 1）
- 多 Agent 协同
- 持久化存储（Phase 1）
- 高可用/多实例

---

## 步骤（Steps）

### Step 1: 项目骨架 + 基础测试
- [ ] 创建 `apps/runtime/` 目录结构
- [ ] 创建 `apps/runtime/main.py` FastAPI 入口
- [ ] 编写 `tests/unit/apps/test_runtime/` 骨架测试
- [ ] 验证服务可启动：`uvicorn apps.runtime.main:app --port 8001`

### Step 2: 数据模型
- [ ] `apps/runtime/models.py` - 请求/响应模型
- [ ] `apps/runtime/task_store.py` - 内存任务存储
- [ ] 编写模型单元测试
- [ ] 对接 `common/models.py` 中的核心类型

### Step 3: Plan → Act → Reflect 执行循环
- [ ] `apps/runtime/executor.py` - 执行器核心
- [ ] `apps/runtime/planner.py` - 计划生成（调用 ModelHub）
- [ ] `apps/runtime/reflection.py` - 反思与结果评估
- [ ] 编写执行循环集成测试

### Step 4: Session 记忆管理
- [ ] `apps/runtime/memory.py` - Session Context 管理
- [ ] 与 Gateway 的 Session 接口对接
- [ ] 记忆压缩（防止上下文溢出）
- [ ] 编写记忆管理测试

### Step 5: 错误处理与降级
- [ ] 对接 `common/errors.py` 错误码
- [ ] 重试机制（指数退避）
- [ ] 超时处理
- [ ] Escalation 人工接管
- [ ] 编写降级测试

### Step 6: 健康检查 + 可观测性
- [ ] `/health` 接口
- [ ] 结构化日志接入
- [ ] Trace ID 贯穿
- [ ] 端到端测试

---

## 验收标准（Acceptance Criteria）

### 功能验收
```
✅ POST /runtime/execute 可接收任务并返回 task_id
✅ 任务状态可查询（queued → running → completed/failed）
✅ Plan 生成后有步骤分解
✅ Act 执行后有工具调用记录
✅ Reflect 完成后有结果评估
✅ Session 上下文可保持（多轮对话）
✅ 超时任务自动标记 failed
✅ 失败任务可重试（最多3次）
✅ 高风险操作触发 Escalation
```

### 质量验收
```
✅ 所有测试通过（pytest）
✅ 覆盖率 common + runtime > 80%
✅ 通过 ruff lint
✅ 通过 mypy 类型检查
✅ 文档已更新（ARCHITECTURE.md）
```

---

## 依赖（Dependencies）

| 依赖 | 说明 | 状态 |
|------|------|------|
| apps/gateway | 已完成 | ✅ |
| common/models | 已完成 | ✅ |
| common/errors | 已完成 | ✅ |
| common/tracing | 已完成 | ✅ |
| apps/model-hub | 并行开发，接口隔离 | ⬜ |

---

## 决策日志（Decision Log）

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-28 | 任务存储先用内存，后续迁 PostgreSQL | Phase 0 先跑通核心流程 |
| 2026-03-28 | 不实现多 Agent 协同 | Phase 0 单 Agent 闭环优先 |
| 2026-03-28 | Plan 使用 ModelHub 接口，不直接调用模型 | 保持架构解耦 |

---

## 下一步

完成此 Exec Plan 后，进入 Step 1。

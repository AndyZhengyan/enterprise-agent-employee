# Blueprint → AgentFamily 模型对齐分析

> **日期**: 2026-04-17
> **状态**: 分析完成，待执行

---

## 背景

Master Spec 定义了完整对象模型（17 表），当前 ops SQLite 只有 9 张表，且核心表名是 `blueprints` 而非 `agent_families`。本次分析确认迁移路径。

## 关键发现

### Blueprint 与 OpenClaw 文件系统的关系

两者是**模板 vs 部署产物**的关系，不冲突：

| 存储位置 | 内容 | 谁写入 |
|---------|------|--------|
| `blueprints` 表（SQLite） | Blueprint 模板（裸 Markdown） | ops onboarding wizard |
| `~/.openclaw/agents/{id}/agent/*.md` | 已部署的 SOUL/IDENTITY/AGENT 文件 | `avatar_assembler.write_avatar_files()` 在 deploy 时写入 |

Blueprint 是模板，OpenClaw 文件系统是部署产物。两者一一对应，但用途不同。

### 当前表结构 vs Spec

| 当前表名 | 对齐 Spec | 备注 |
|---------|---------|------|
| `blueprints` | `agent_families` | 字段基本对应，缺 Policy |
| `task_executions` | `tasks` | 缺 task_steps / TraceID |
| `activity_log` | `audit_logs` | 结构化程度不足 |
| `api_keys` | ✅ 保留 | 无需改 |
| `tools` | ✅ 基本 OK | 无需改 |
| `dashboard_stats` 等 | 运营视图 | Spec 无此表，保留 |

### 缺失的关键实体

- `Tenant` / `tenant_members` — 治理多租户持久化缺失
- `sessions` — 会话隔离无法追溯
- `task_steps` — 链路追踪不完整
- `audit_logs` — 合规审计无结构化
- `badcases` — Badcase 运营无法闭环
- `knowledge_documents` / `document_chunks` — 知识库无法持久化
- `skill_bindings` — Skill 与 Family/Instance 绑定关系缺失

## 选定路径：Path B — 术语重命名

理由：
- `blueprints` 的核心字段（role, alias, department, versions, capacity）已经是 AgentFamily 的内容
- 只需加 `policy_json TEXT` 列 + 前端术语改名
- 不动底层数据流，不引入 Tenant 迁移

### 具体改动

#### 后端（最小）

1. `apps/ops/db/_schema.py` — `blueprints` 表保持（SQLite 改名代价大），加 `ALTER TABLE blueprints ADD COLUMN policy_json TEXT`
2. `apps/ops/routers/onboarding.py` — 注释、变量名更新（Blueprint → AgentFamily）
3. API 返回字段逐步从 `blueprint_id` → `agent_family_id`（双写兼容）

#### 前端（术语改名）

1. `frontend/` — 所有 Blueprint 标签 → AgentFamily
2. API 调用路径 `/api/onboarding/blueprints` → `/api/onboarding/agent-families`（路由改）
3. 类型/变量名重命名

## 待后续处理（不在本次范围内）

- `task_executions` → `tasks` + `task_steps` 拆分（需 PostgreSQL 迁移）
- `Tenant` / `tenant_members` 引入
- `audit_logs` 结构化
- `badcases` 表
- `knowledge_documents` / `document_chunks`
- `skill_bindings`

这些都需要 PostgreSQL，而不仅仅是 SQLite 列改名。

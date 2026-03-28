# Runtime 模块规格说明

> 本文档定义 Runtime（运行时层）的完整规格。
> 先写规格，再写代码。规格是代码的合同。

---

## 一、核心职责

Runtime 负责：
1. **任务执行编排** - Plan → Act → Reflect 循环
2. **生命周期管理** - Agent 实例的启动/暂停/停止
3. **短期记忆管理** - Session Context 维护
4. **降级与恢复** - 重试/超时/Escalation

### 一（补充）：PiAgent 集成

Runtime 通过 OpenClaw Gateway 调用 PiAgent。PiAgent 是真正的执行引擎，Runtime 是企业治理壳。

#### 架构关系

```
e-Agent-OS Runtime（企业治理壳）
  ├── RBAC / 审计 / 限流
  ├── Plan 生成（通过 PiAgent LLM 调用）
  ├── Act 执行（通过 PiAgent 调用 Skill/Connector）
  └── Reflect 评估（通过 PiAgent LLM 调用）
         │
         ▼
  OpenClaw Gateway（本地，端口 18789）
         │
         ├── chat（小虾米）- 前台调度，简单任务
         ├── deep-work（小龙）- 深度专家，复杂多步任务
         ├── super-work（大龙）- 超级专家，高风险/关键任务
         └── system（⚙️）- 系统维护
```

#### 集成方式

**优先**：HTTP/WebSocket API → **回退**：subprocess 调用 `openclaw agent` CLI

```python
# apps/runtime/piagent_client.py
class PiAgentClient:
    """PiAgent 客户端"""
    DEFAULT_AGENT = "chat"

    def invoke(self, message: str, session_id: Optional[str] = None) -> PiAgentResult:
        """同步调用 PiAgent（subprocess → openclaw agent --json）"""
        args = ["openclaw", "agent",
                "--agent", self.agent_id,
                "--message", message,
                "--json",
                "--thinking", self.thinking_level,
                "--timeout", str(self.timeout_seconds)]
        result = subprocess.run(args, capture_output=True, text=True, timeout=...)
        return PiAgentResult.from_dict(json.loads(result.stdout))

    def invoke_async(self, message: str, ...) -> subprocess.Popen:
        """异步调用（用于长时间任务）"""
```

#### Agent 选择策略

| 任务特征 | Agent | 说明 |
|---------|-------|------|
| 简单问答/查询 | `chat` | 小虾米，前台调度 |
| 复杂多步/分析 | `deep-work` | 小龙，深度专家 |
| 高风险（删除/支付/取消） | `super-work` | 大龙，超级专家 |

#### PiAgent 返回格式

```python
@dataclass
class PiAgentResult:
    run_id: str           # 唯一运行 ID
    status: str           # ok | error
    summary: str          # 执行摘要
    text: Optional[str]   # 主要文本输出
    session_id: Optional[str]  # 会话 ID（用于多轮对话）
    duration_ms: int      # 执行耗时
    usage: Dict[str, Any] # Token 使用量
    raw: Dict[str, Any]   # 原始响应
```

#### Gateway 配置

- **地址**：`http://127.0.0.1:18789`
- **Token**：从 `~/.openclaw/openclaw.json` 的 `gateway.auth.token` 读取
- **健康检查**：`GET /health` → `{"ok": true, "status": "live"}`

---

## 二、API 接口

### 2.1 执行任务

```http
POST /runtime/execute
Headers:
  Authorization: Bearer {token}
  X-Trace-ID: {trace_id}  # 可选，不提供则自动生成

Body:
{
  "employee_id": "agent-001",
  "task_id": "task-xxx",       # 可选，不提供则自动生成
  "task_type": "inquiry",       # inquiry | action | analysis
  "input": {
    "query": "查询今日P1工单",
    "params": {}
  },
  "context": {
    "session_id": "sess-xxx",
    "user_id": "user-xxx",
    "skills": ["skill-search"],  # 可用技能列表
    "attachments": []            # 附件
  }
}

Response (同步模式):
{
  "task_id": "task-xxx",
  "status": "completed",         # queued | running | completed | failed | escalated
  "result": {
    "answer": "今日有3个P1工单...",
    "sources": ["knowledge-xxx"],
    "actions": []
  },
  "trace_id": "trace-xxx",
  "duration_ms": 1250
}

Response (流式模式):
Headers: Accept: text/event-stream
event: start
data: {"task_id": "task-xxx", "status": "running"}

event: step
data: {"step": 1, "type": "plan", "content": {"steps": [...]}}

event: step
data: {"step": 2, "type": "act", "tool": "skill-search", "input": {...}}

event: step
data: {"step": 3, "type": "reflect", "assessment": "..."}

event: done
data: {"status": "completed", "result": {...}}
```

### 2.2 生成执行计划

```http
POST /runtime/plan

Body:
{
  "employee_id": "agent-001",
  "task": "查询今日新增的P1工单并总结",
  "available_skills": ["skill-search", "skill-ticket", "skill-summary"],
  "context": {}
}

Response:
{
  "plan_id": "plan-xxx",
  "task_id": "task-xxx",
  "steps": [
    {
      "order": 1,
      "type": "call_skill",
      "skill": "skill-ticket",
      "input": {"filter": "priority=P1,created_after=today"},
      "expected_output": "P1工单列表"
    },
    {
      "order": 2,
      "type": "call_skill",
      "skill": "skill-summary",
      "input": {"data": "${step1.output}"},
      "expected_output": "工单总结"
    }
  ],
  "estimated_duration_ms": 3000,
  "confidence": 0.85
}
```

### 2.3 查询状态

```http
GET /runtime/status/{task_id}

Response:
{
  "task_id": "task-xxx",
  "status": "running",           # queued | running | completed | failed | escalated | cancelled
  "current_step": 2,
  "total_steps": 3,
  "progress": 0.67,
  "started_at": "2026-03-28T10:00:00Z",
  "estimated_finish_at": "2026-03-28T10:00:05Z",
  "steps": [
    {"order": 1, "type": "plan", "status": "completed", "duration_ms": 120},
    {"order": 2, "type": "act", "skill": "skill-ticket", "status": "running"},
    {"order": 3, "type": "reflect", "status": "pending"}
  ]
}
```

### 2.4 取消任务

```http
POST /runtime/cancel/{task_id}

Response:
{
  "task_id": "task-xxx",
  "status": "cancelled",
  "cancelled_at": "2026-03-28T10:00:03Z",
  "reason": "user_requested"
}
```

### 2.5 健康检查

```http
GET /runtime/health

Response:
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-03-28T10:00:00Z",
  "checks": {
    "memory": "ok",
    "piagent": "ok"           # OpenClaw Gateway 健康检查
  },
  "stats": {
    "active_tasks": 5,
    "completed_tasks_today": 123,
    "failed_tasks_today": 2
  }
}
```

---

## 三、执行循环

### 3.1 Plan → Act → Reflect 流程

```
                    ┌─────────────────────────────────────┐
                    │           Execution Loop             │
                    │                                     │
User Input ────────►│                                     │
                    │  ┌─────────┐                       │
                    │  │  PLAN   │                       │
                    │  │ 生成步骤 │                       │
                    │  └────┬────┘                       │
                    │       │                            │
                    │       ▼                            │
                    │  ┌─────────┐                       │
                    │  │   ACT   │                       │
                    │  │ 执行步骤 │                       │
                    │  └────┬────┘                       │
                    │       │                            │
                    │       ▼                            │
                    │  ┌─────────┐                       │
                    │  │ REFLECT │                       │
                    │  │ 评估结果 │                       │
                    │  └───┬─────┘                       │
                    │      │                            │
                    │      │ 继续？                      │
                    │      │ Yes                         │
                    │      └────────────────────────────►│
                    │                                     │
                    │      │ No                          │
                    │      ▼                            │
                    │  ┌─────────┐                       │
                    │  │  DONE   │                       │
                    │  │ 返回结果 │                       │
                    └─────────────────────────────────────┘
```

### 3.2 Plan 阶段

**输入**：用户 query + 可用技能 + 上下文

**处理**：
1. 根据任务特征选择 PiAgent（chat/deep-work/super-work）
2. 发送 ReAct 风格 prompt，调用 LLM 生成计划 JSON
3. 解析计划为步骤列表
4. 验证步骤可执行性

**输出**：Plan（步骤列表 + 置信度）

### 3.3 Act 阶段

**输入**：Plan 中的一个步骤

**处理**：
1. 根据步骤类型（call_skill/call_connector）构建 prompt
2. 调用 PiAgent 执行
3. 处理异常和超时
4. 记录执行结果

**输出**：步骤执行结果

### 3.4 Reflect 阶段

**输入**：当前步骤结果 + 历史结果

**处理**：
1. 发送给 PiAgent 进行评估
2. 判断是否需要补充
3. 决定是否继续或结束

**输出**：继续/结束 + 决策理由

---

## 四、记忆管理

### 4.1 Session Context 结构

```python
class SessionContext:
    """单个会话的上下文"""

    session_id: str
    employee_id: str          # AgentFamily ID
    user_id: str

    # 对话历史
    messages: List[Message]    # role + content + timestamp

    # 当前任务上下文
    current_task: Optional[Task]
    task_history: List[Task]   # 最近 N 个任务

    # 工作记忆
    working_memory: Dict[str, Any]  # 键值对形式
    artifacts: List[Artifact]       # 生成的产物

    # 元信息
    created_at: datetime
    last_active_at: datetime
    message_count: int
```

### 4.2 记忆压缩策略

当 messages 超过阈值时，触发压缩：

```
压缩触发条件：
  - messages > 50
  - total_tokens > 16000

压缩策略：
  1. 保留系统消息
  2. 保留最近 20 条对话
  3. 中间消息摘要为：<摘要: 讨论了X个话题，解决了Y问题>
  4. 保留关键决策和产物
```

---

## 五、错误处理

### 5.1 重试策略

```python
RETRY_CONFIG = {
    "max_retries": 3,
    "initial_delay_ms": 500,
    "backoff_multiplier": 2.0,
    "max_delay_ms": 10000,

    # 可重试的错误
    "retryable_errors": [
        ErrorCode.MODEL_TIMEOUT,
        ErrorCode.MODEL_PROVIDER_ERROR,
        ErrorCode.CONNECTOR_TIMEOUT,
    ],

    # 不可重试的错误
    "non_retryable_errors": [
        ErrorCode.RUNTIME_TASK_CANCELLED,
        ErrorCode.CONNECTOR_APPROVAL_REQUIRED,
        ErrorCode.MODEL_QUOTA_EXCEEDED,
    ]
}
```

### 5.2 超时处理

```
任务超时：30 秒（可配置）
  └── 超时 → 标记 failed → 返回超时错误

步骤超时：10 秒（可配置）
  └── 超时 → 重试（最多3次）
              └── 全部超时 → Escalation
```

### 5.3 Escalation 机制

触发条件：
- 重试耗尽仍失败
- 高风险操作失败
- 用户主动要求

Escalation 处理：
```
1. 标记任务状态为 "escalated"
2. 记录升级原因和上下文
3. 通知人工处理通道
4. 返回用户：正在转接人工...
```

---

## 六、错误码（扩展）

Runtime 层新增错误码：

| 错误码 | 名称 | 说明 | 可重试 |
|--------|------|------|--------|
| 2001 | TASK_NOT_FOUND | 任务不存在 | ❌ |
| 2002 | TASK_CANCELLED | 任务已取消 | ❌ |
| 2003 | PLAN_FAILED | 生成执行计划失败 | ✅ |
| 2004 | EXECUTION_FAILED | 任务执行失败 | ✅ |
| 2005 | TASK_TIMEOUT | 任务执行超时 | ✅ |
| 2006 | ESCALATED | 任务已升级人工 | ❌ |
| 2007 | AGENT_NOT_FOUND | Agent不存在 | ❌ |
| 2008 | SKILL_NOT_FOUND | 所需技能未找到 | ❌ |
| 2009 | INVALID_CONTEXT | 任务上下文无效 | ❌ |
| 2010 | SESSION_NOT_FOUND | 会话不存在 | ❌ |
| 2011 | SESSION_EXPIRED | 会话已过期 | ❌ |

---

## 七、配置参数

```python
RUNTIME_CONFIG = {
    # 执行
    "max_concurrent_tasks": 100,
    "task_timeout_seconds": 30,
    "step_timeout_seconds": 10,

    # 重试
    "max_retries": 3,
    "retry_backoff_multiplier": 2.0,

    # 记忆
    "max_messages_in_session": 50,
    "max_session_memory_tokens": 16000,
    "session_ttl_hours": 24,

    # 降级
    "escalation_threshold_retries": 3,
    "enable_escalation": True,

    # ModelHub
    "model_hub_url": "http://localhost:8002",
    "default_model": "gpt-4o-mini",
    "planning_model": "claude-3-5-sonnet",
}
```

---

## 八、测试规格

### 8.1 单元测试

```python
# test_executor.py
def test_executor_plan_generation():
    """测试计划生成"""

def test_executor_single_step_execution():
    """测试单步骤执行"""

def test_executor_reflect_continue():
    """测试 Reflect 决定继续"""

def test_executor_reflect_done():
    """测试 Reflect 决定结束"""

# test_memory.py
def test_session_context_creation():
    """测试会话上下文创建"""

def test_session_message_append():
    """测试消息追加"""

def test_session_memory_compression():
    """测试记忆压缩"""

# test_error_handling.py
def test_retry_on_timeout():
    """测试超时重试"""

def test_escalation_after_max_retries():
    """测试重试耗尽后 Escalation"""

def test_cancel_running_task():
    """测试取消运行中任务"""
```

### 8.2 集成测试

```python
# test_runtime_integration.py
@pytest.mark.asyncio
async def test_full_task_execution_flow():
    """端到端：查询 → 计划 → 执行 → 完成"""

@pytest.mark.asyncio
async def test_multi_turn_conversation():
    """多轮对话：保持上下文"""

@pytest.mark.asyncio
async def test_task_cancellation():
    """任务取消：中途停止"""
```

---

## 九、依赖关系

```
apps/runtime/
    ├── common/models.py      # 核心类型
    ├── common/errors.py      # 错误码
    ├── common/tracing.py     # 日志/Trace
    ├── apps/runtime/piagent_client.py   # PiAgent 客户端（OpenClaw Gateway）
    ├── apps/skill-hub/       # 技能调用（接口，Phase 1）
    └── apps/knowledge-hub/    # 知识检索（接口，Phase 1）
```

> **PiAgent 集成**：通过 subprocess 调用本地 `openclaw agent` CLI，连接 OpenClaw Gateway（端口 18789）。
> 无需额外 API Key，Gateway token 从 `~/.openclaw/openclaw.json` 自动读取。

---

**文档版本**: v1.0
**创建日期**: 2026-03-28
**状态**: 已评审

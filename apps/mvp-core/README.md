# MVP Core

该目录包含最小可运行 MVP：
- 核心 Agent（Plan/Act/Review/Complete）
- 基础控制台（数字员工、任务、告警）
- 高速事故处理场景 Demo（地图态势 + 联动日志）

## 运行
```bash
cd apps/mvp-core
python3 server.py
```

访问：
- 首页: http://localhost:8100/
- 控制台: http://localhost:8100/console
- 场景: http://localhost:8100/scenario

## 模型调用（OpenAI Compatible）
服务已支持“真实模型规划 + 本地回退策略”：
- 若配置 `OPENAI_API_KEY`，会调用 `OPENAI_BASE_URL/chat/completions` 生成任务计划。
- 若模型调用失败，会自动重试并回退到内置 SOP，保障任务可继续执行。

环境变量：
- `OPENAI_API_KEY`：模型密钥（未配置则使用回退策略）
- `OPENAI_BASE_URL`：默认 `https://api.openai.com/v1`
- `OPENAI_MODEL`：默认 `gpt-4o-mini`
- `MODEL_TIMEOUT_SEC`：单次模型调用超时（默认 35）
- `MODEL_MAX_RETRY`：模型调用重试次数（默认 2）

示例：
```bash
OPENAI_API_KEY=xxx OPENAI_MODEL=gpt-4o-mini python3 server.py
```

## API（核心）
- `GET /api/health`
- `GET /api/employees`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `GET /api/scenario`
- `POST /api/scenario/reset`
- `GET /api/alerts`
- `GET /api/commands`
- `GET /api/audit-logs`
- `GET /api/agent-runtime`

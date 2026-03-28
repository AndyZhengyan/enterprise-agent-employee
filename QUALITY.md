# e-Agent-OS 质量标准

> 所有质量规则必须可自动化验证。不可验证的规则 = 不存在的规则。

---

## 一、代码质量标准

### 1.1 Lint 检查

```bash
# 必须通过所有检查
ruff check apps/ common/ configs/
ruff check --fix apps/ common/ configs/  # 自动修复可修复问题
```

**检查项**：
- E/F/W：错误、致命错误、警告
- I：import 排序（isort 规则）
- N：命名规范
- UP：语法兼容性
- ANN：类型注解检查

**强制规则**：
- 所有公开函数必须有类型注解
- 所有公开函数必须有 docstring
- 禁止 bare except
- 禁止 print（使用结构化日志）

### 1.2 类型检查

```bash
mypy apps/ common/ --ignore-missing-imports
```

### 1.3 格式化

```bash
ruff format apps/ common/ configs/
```

---

## 二、测试标准

### 2.1 覆盖率基线

| 模块 | 最低覆盖率 |
|------|-----------|
| common/ | 90% |
| apps/gateway/ | 80% |
| apps/runtime/ | 80% |
| apps/model-hub/ | 85% |
| apps/connector-hub/ | 80% |

### 2.2 测试命名规范

```
tests/
├── unit/
│   ├── common/
│   │   ├── test_models.py
│   │   ├── test_errors.py
│   │   └── test_tracing.py
│   └── apps/
│       ├── test_gateway/
│       ├── test_runtime/
│       └── test_model_hub/
├── integration/
│   └── test_gateway_runtime.py
└── e2e/
    └── test_task_flow.py
```

### 2.3 测试编写原则

```python
# 正确示范：每个测试一个断言
def test_task_status_enum_values():
    assert TaskStatus.QUEUED.value == "queued"
    assert TaskStatus.RUNNING.value == "running"

# 正确示范：使用 fixture
def test_session_creation(fresh_session):
    session = fresh_session
    assert session.id.startswith("sess-")

# 正确示范：测试异常
def test_gateway_auth_error():
    with pytest.raises(GatewayAuthError) as exc_info:
        raise GatewayAuthError(details="无效Token")
    assert exc_info.value.error_code == ErrorCode.GATEWAY_AUTH_FAILED
```

### 2.4 Mock 原则

```
可以 Mock 的：
  - 外部 API 调用（httpx）
  - 数据库连接（sqlalchemy）
  - Redis 连接
  - 第三方 SDK

禁止 Mock 的：
  - 内部模块间调用
  - 业务逻辑函数
  - 数据模型
```

---

## 三、PR 合并检查清单

```bash
# 1. Lint 通过
ruff check apps/ common/

# 2. 类型检查通过
mypy apps/ common/ --ignore-missing-imports

# 3. 所有测试通过
pytest tests/ -v

# 4. 覆盖率达标
pytest tests/ --cov=apps --cov=common --cov-fail-under=80
```

---

**文档版本**: v1.0
**创建日期**: 2026-03-28

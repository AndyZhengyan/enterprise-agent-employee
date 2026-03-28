# e-Agent-OS 开发军规
> 企业数字员工操作系统 · Harness Engineering 开发规范 v1.0

> **核心理念**：人类掌舵，AI执行。
> 人类负责设计环境、澄清意图、构建反馈回路。
> AI负责编写代码、测试、部署、维护。
> 纪律体现在支撑结构上，而非代码本身。

---

## 一、角色定义

### 1.1 人类角色（老郑）

- **产品Owner**：定义功能意图、验收标准、优先级
- **架构把关**：审批技术方案、决策架构漂移
- **品味编码者**：将业务规则、人味偏好翻译成可执行的约束
- **质量验收者**：最终验收人，不做日常编码

> **一句话**：老郑是"船长"，不是"水手"。

### 1.2 AI角色（Claude Code / Cursor）

- **代码执行者**：按指令生成、修改、重构代码
- **测试编写者**：为每个功能编写测试用例
- **文档维护者**：保持文档与代码同步
- **PR驱动者**：完成功能后主动开PR

### 1.3 协作模式

```
老郑：给指令（"帮我实现 XXX"）
   │
   ▼
Claude：执行开发
   │
   ├──► 写代码
   ├──► 写测试
   ├──► 写文档
   └──► 开PR
   │
   ▼
老郑：审核 + 验收
   │
   ▼
Claude：根据反馈修改
```

---

## 二、铁律（不可违反）

### 2.1 代码仓库是唯一真实来源

```
✅ 一切都在代码仓库里：代码、文档、设计、决策
✅ 架构决策必须 commit 到 ARCHITECTURE.md
✅ 会议结论必须翻译成 PR 文档更新
❌ 不要把决策留在 Slack/微信/大脑里
❌ 不要创建不在代码仓库里的"文档"
```

**为什么**：Codex 能看到的 = Codex 能操作的。Codex 看不到的 = 不存在。

### 2.2 渐进式披露

```
AGENTS.md ≈ 100行，作为目录
   └──► ARCHITECTURE.md（顶层地图）
   └──► docs/（具体文档）
   └──► specs/（规格说明）
   └──► exec-plans/（执行计划）
```

**为什么**：上下文是稀缺资源。不要一开始就给AI淹没性的信息。

### 2.3 架构约束必须机械执行

```
任何架构规则都必须有对应的 linter 或测试来强制验证。
没有 linter 验证的架构规则 = 不存在的规则。
```

**示例**：
- "每个模块必须有自己的 `__init__.py`" → lint 检查
- "AgentFamily配置必须有 SOUL/IDENTITY/AGENT 三段" → schema 校验
- "禁止跨层直接调用" → 结构化测试

### 2.4 PR 必须小而频

```
每个 PR < 400 行变更（越少越好）
每天至少 1 个 PR
PR 生命周期 < 24小时
```

**为什么**：Harness 经验告诉我们，在AI时代，等待人类注意力是最大的瓶颈。

### 2.5 测试是功能的一部分

```
没有测试的代码 = 未完成的代码
PR 附带测试才允许合并
集成测试优先于单元测试
端到端测试验证核心流程
```

### 2.6 人类品味必须编码进系统

```
发现一个问题 → 不只修复一个问题
                → 将规则编码到 lint/测试/约束
                → 防止同类问题再次出现

示例：
发现 AgentFamily 配置缺少 SOUL 字段 → 写一个 schema validator
发现 Skill 文档过期 → 写一个 freshness checker
发现某类 badcase → 写一个 regression test
```

### 2.7 熵管理自动化

```
每周定期运行"垃圾回收"任务：
├──► 扫描过期的文档
├──► 扫描未使用的代码
├──► 扫描缺失测试的文件
└──► 自动发起清理 PR
```

---

## 三、仓库结构规范

```
e-agent-os/
│
├── AGENTS.md                      # 地图（约100行）
├── ARCHITECTURE.md                 # 架构文档
├── DEVELOPMENT.md                  # 本文件
├── QUALITY.md                      # 质量标准
│
├── apps/                           # 应用模块
│   ├── gateway/                    # 网关服务
│   │   ├── main.py
│   │   ├── router.py
│   │   ├── auth.py
│   │   ├── rate_limiter.py
│   │   └── circuit_breaker.py
│   │
│   ├── runtime/                    # 运行时服务
│   │   ├── main.py
│   │   ├── executor.py
│   │   ├── planner.py
│   │   ├── memory.py
│   │   └── escalation.py
│   │
│   ├── model-hub/                  # 模型中心
│   │   ├── main.py
│   │   ├── router.py
│   │   └── providers/
│   │
│   ├── connector-hub/              # 连接器中心
│   │   ├── main.py
│   │   ├── registry.py
│   │   └── connectors/
│   │
│   ├── skill-hub/                  # 技能中心
│   │   ├── main.py
│   │   ├── registry.py
│   │   └── skills/
│   │
│   ├── knowledge-hub/              # 知识中心
│   │   ├── main.py
│   │   ├── indexer.py
│   │   └── retriever.py
│   │
│   ├── ops-center/                 # 运营中心
│   │   ├── main.py
│   │   ├── metrics.py
│   │   └── alerts.py
│   │
│   └── admin-portal/               # 管理后台
│       └── ...
│
├── common/                         # 公共模块
│   ├── models/                     # 数据模型
│   ├── errors.py                   # 错误码定义
│   ├── logging.py                  # 结构化日志
│   └── tracing.py                  # Trace工具
│
├── configs/                        # 配置中心
│   ├── agent-families/             # AgentFamily配置
│   │   └── .schema.yaml            # 配置schema
│   ├── skills/                     # 技能配置
│   └── policies/                   # 治理策略
│
├── tests/                          # 测试
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                        # 脚本
│   ├── lint.sh                    # Lint检查
│   ├── test.sh                    # 测试运行
│   └── garbage-collect.sh          # 熵清理
│
├── docs/                           # 文档
│   ├── design/                     # 设计文档
│   ├── exec-plans/                 # 执行计划
│   │   ├── active/                # 进行中的计划
│   │   └── completed/             # 已完成的计划
│   └── references/                # 参考文档
│
└── infra/                          # 基础设施
    ├── docker/
    └── k8s/
```

---

## 四、开发流程

### 4.1 任务发起

老郑通过以下方式发起任务：

```
方式1：直接指令
"帮我实现 ModelHub 的路由策略，包括按任务类型和成本路由"

方式2：执行计划
在 docs/exec-plans/active/ 下创建 <feature-name>.md
包含：背景、目标、步骤清单、验收标准

方式3：Issue
创建 GitHub Issue，标注优先级（P0/P1/P2）
```

### 4.2 开发循环

```
1. 理解任务
   └──► 阅读 specs/ 或 exec-plans/ 中的相关文档
   └──► 阅读 ARCHITECTURE.md 了解上下文

2. 编写规格（如果需要）
   └──► 在 specs/ 下创建 <feature-name>.md
   └──► 包含：接口定义、数据模型、错误处理、验收标准

3. 写代码
   └──► 按模块路径创建/修改文件
   └──► 遵循仓库结构规范
   └──► 每个类/函数必须有 docstring

4. 写测试
   └──► 单元测试：每个函数有对应的 test
   └──► 集成测试：每个模块间接口有对应的 test
   └──► E2E测试：核心流程有端到端 test

5. 自检
   └──► 运行 lint
   └──► 运行全部测试
   └──► 检查文档是否更新

6. 开PR
   └──► PR 标题格式：[<module>] <简短描述>
   └──► PR 描述包含：背景、变更内容、测试结果
   └──► 指定老郑 review

7. 响应反馈
   └──► 根据老郑的 review 意见修改
   └──► 更新相关文档
   └──► 合并后关闭 exec-plan
```

### 4.3 PR 审核清单

老郑审核时检查：

```
□ 代码是否符合架构规范
□ 是否有对应的测试
□ 接口设计是否合理
□ 错误处理是否完善
□ 文档是否同步更新
□ 是否有明显的bad smell
□ 是否有安全风险
□ 变更范围是否合理（<400行）
```

---

## 五、质量标准

### 5.1 代码质量

```
- 所有 Python 代码通过 ruff lint 检查
- 所有代码有类型注解（type hints）
- 所有公开函数有 docstring
- 禁止 hardcode，使用配置
- 错误码遵循规范（见 common/errors.py）
```

### 5.2 测试质量

```
- 覆盖率基线：核心模块 > 80%
- 新增代码必须附带测试
- Mock 使用原则：只 mock 外部依赖，不 mock 内部模块
- E2E 测试验证核心用户流程
```

### 5.3 文档质量

```
- 每个模块有 README.md（<50行）
- 每个公开接口有 docstring
- 架构变更必须更新 ARCHITECTURE.md
- exec-plan 有明确的验收标准
- 过时文档有 stale 标记
```

### 5.4 可观测性

```
- 所有服务有健康检查接口 /health
- 关键操作有结构化日志（包含 trace_id）
- 每个请求有唯一的 trace_id
- 日志包含：level, timestamp, trace_id, module, message
```

---

## 六、架构规范

### 6.1 分层架构

```
每层职责严格遵守：

UI/Channel Layer（渠道层）
    │
    ▼
Gateway Layer（网关层）
    │
    ▼
Runtime Layer（运行时层）
    │
    ├──► SkillHub
    ├──► KnowledgeHub
    ├──► ConnectorHub
    └──► ModelHub
    │
    ▼
Data/Infra Layer（数据/基础设施层）
```

**强制规则**：
- 禁止跨层直接调用（只能上层调用下层）
- 循环依赖严格禁止
- 跨模块调用必须通过接口，不通过具体实现

### 6.2 AgentFamily 配置规范

每个 AgentFamily 配置必须包含四段：

```yaml
family_id: "xxx"
family_name: "岗位名称"

soul:
  mbti: "INTJ"           # 人格类型
  communication_style: "严谨/简洁/..."  # 沟通风格
  risk_preference: "low"  # 风险偏好

identity:
  role: "岗位角色"
  employee_id: "DE-AI-XXX"
  organization: "所属部门"

agent:
  responsibilities: []    # 职责列表
  service_for: []         # 服务对象
  boundaries: []          # 能力边界
  kpi: []                 # 绩效指标

policy:
  skills: []              # 绑定的技能
  tools: []               # 允许的工具
  approval_required: []   # 需要审批的操作
```

---

## 七、Git 规范

### 7.1 分支命名

```
main                  # 主分支，始终可部署
├── feat/<feature>   # 功能开发
├── fix/<bug>        # Bug修复
├── docs/<topic>     # 文档更新
└── chore/<task>     # 杂项
```

### 7.2 Commit 规范

```
<type>(<scope>): <描述>

Types:
  feat: 新功能
  fix: Bug修复
  docs: 文档更新
  test: 测试
  refactor: 重构
  style: 代码格式
  chore: 构建/工具

Examples:
  feat(gateway): 添加限流功能
  fix(runtime): 修复任务超时处理
  docs(architecture): 更新模块依赖图
  test(skill-hub): 添加技能注册测试
```

### 7.3 Commit 频率

```
最低要求：每天至少 1 个 commit
推荐节奏：每天 3-5 个小 commit
合并时机：功能完成 + 测试通过 + 文档更新
```

---

## 八、自动化任务

### 8.1 CI/CD 流水线

```
PR 创建时自动运行：
├──► lint（ruff + mypy）
├──► 单元测试
├──► 覆盖率检查
├──► 安全扫描
└──► 文档 freshness 检查

合并到 main 后：
├──► 集成测试
├──► E2E 测试
└──► 部署到 staging
```

### 8.2 定期自动化任务

```
每日（CI pipeline）：
├──► lint + 测试
├──► 覆盖率检查
└──► 过期文档扫描

每周（Garbage Collection）：
├──► 扫描未使用的配置
├──► 扫描缺失测试的模块
├──► 扫描过期的文档
└──► 发起清理 PR
```

---

## 九、工具与环境

### 9.1 开发工具

```
语言：Python 3.11+
框架：FastAPI
测试：pytest + pytest-asyncio
Lint：ruff
类型检查：mypy
格式化：ruff format
```

### 9.2 依赖管理

```
使用 uv 管理依赖
pyproject.toml 作为单一配置源
.lock 文件提交到仓库
```

---

## 十、下一步行动

> 详见 docs/exec-plans/active/00-foundation-setup.md

---

**文档版本**: v1.0
**创建日期**: 2026-03-28
**维护者**: 老郑 & Claude

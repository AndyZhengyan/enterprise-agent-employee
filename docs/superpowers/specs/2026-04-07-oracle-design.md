# Oracle 设计文档

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** Oracle 是 Avatar 的**长期记忆中心**，也是企业业务数据的语义表征层。按知识主题组织（全局记忆网络），而非按 Avatar 分组。记忆来自 Avatar 任务执行自动沉淀 + 外部档案导入（早期：手工上传 md 文件）。

**Architecture:** 档案以 Markdown 文件存储于指定目录（`data/oracle/`），按主题子目录组织。前端直接读取文件系统，Ops API 提供上传和管理接口。

**Tech Stack:** FastAPI（apps/ops）、Vue 3、文件系统存储（无需新建数据库表）

---

## 核心定位

**Oracle = Avatar 长期记忆 + 企业档案**

- 不是文档管理工具，而是**知识沉淀视图**
- 每个 Avatar 执行任务后，AI 自动提炼关键知识点存入 Oracle
- 外部交易系统数据可通过文件上传导入
- 记忆按**主题**聚合（同一主题可来自多个 Avatar 的经验）

## 档案来源

| 来源 | 方式 | 状态 |
|------|------|------|
| Avatar 任务执行 | AI 自动沉淀关键知识点 | 后续迭代 |
| 交易系统定时同步 | 配置数据源定时拉取 | 后续迭代 |
| 交易系统 API | 外部系统推送 | 后续迭代 |
| **手工上传 md 文件** | **管理员上传 md 到 oracle/ 目录** | **MVP** |

## MVP 范围（第一期）

### 功能

1. **档案目录页**：左侧按来源分类（Avatar / 导入），右侧档案列表
2. **档案详情页**：展示 md 文件内容，支持 Markdown 渲染
3. **手工上传**：管理员上传 md 文件到指定主题目录
4. **档案元数据**：文件名 → 标题，创建时间，来源标签

### 存储结构

```
data/oracle/
├── avatar/
│   ├── 合同风险识别.md
│   ├── 供应商管理.md
│   └── 代码重构模式.md
└── import/
    ├── 供应商合同模板.md
    └── 采购流程规范.md
```

每个 md 文件顶部包含 Frontmatter 元数据：

```markdown
---
title: 合同风险识别
source: avatar      # avatar | import
contributor: 明律   # Avatar 别名或"管理员"
created_at: 2026-04-07
tags: [合同, 法务, 风险]
---
```

## 页面布局

```
┌──────────────────────┬──────────────────────────────────────┐
│  档案分类             │                                      │
│  📂 Avatar 记忆 (3)  │   档案详情                            │
│  📂 导入档案 (2)     │                                      │
│                      │   # 合同风险识别                       │
│  ─────────────────  │                                      │
│  标签云               │   来源：明律Avatar · 2026-04-07      │
│  [合同] [法务] [采购] │                                      │
│                      │   主题内容以 Markdown 渲染展示...      │
└──────────────────────┴──────────────────────────────────────┘
```

## API 设计

```
GET /api/oracle/archives
    列出所有档案（读取 data/oracle/ 目录结构）
    Response: { items: [{ id, title, source, contributor, created_at, tags, path }] }

GET /api/oracle/archives/:id
    读取指定档案的 md 内容
    Response: { meta: {...}, content: "raw markdown string" }

POST /api/oracle/archives/upload
    上传 md 文件（multipart form）
    Body: { file: .md, source: "avatar" | "import", contributor: string }
    Response: { id, path, message: "上传成功" }
```

## 实现范围（MVP）

1. `GET /api/oracle/archives` — 扫描 `data/oracle/` 目录，返回档案索引
2. `GET /api/oracle/archives/:id` — 读取指定 md 文件内容和元数据
3. `POST /api/oracle/archives/upload` — 上传 md 文件（需 API Key 认证）
4. Vue 页面：左侧分类导航 + 右侧档案详情，支持 Markdown 渲染
5. 初始化 `data/oracle/` 目录和示例档案

## 后续迭代方向（不进入 MVP）

- Avatar 任务执行后自动沉淀记忆条目
- 外部数据源定时同步
- 全文搜索（跨档案搜索）
- 记忆置信度 + 有效期字段

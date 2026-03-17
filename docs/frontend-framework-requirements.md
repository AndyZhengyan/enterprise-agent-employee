# Frontend Framework Requirements（统一前端架构要求）

## 目标
在 EnterpriseDigitalEmployee 全仓中统一前端设计与工程组织，避免“每个页面一套写法”。

## 强制要求
1. **统一框架**：所有前端页面默认使用 Vue 3 ESM（无构建版本）。
2. **统一分层**：
   - `index.html`：仅承载结构与样式
   - `*-app.js`：状态管理、交互编排、接口调用
   - `*-data.js`（可选）：静态数据与配置
   - `*-map.js` / `*-engine.js`（可选）：复杂渲染引擎封装
3. **禁止**：新增大型 inline `<script>` 直接堆业务逻辑。
4. **可扩展性**：页面职责明确，支持后续迁移到 Vite + SFC。

## 目录落地规范
- `apps/highway-rescue-demo/static/demo/`
  - `index.html` + `app.js` + `app-data.js` + `map-engine.js`
- `apps/highway-rescue-demo/static/adminconsole/`
  - `index.html` + `app.js` + `app-data.js`
- `apps/mvp-core/static/`
  - `index.html` + `index-app.js`
  - `console.html` + `console-app.js`
  - `scenario.html` + `scenario-app.js` + `scenario-map.js`

## 代码风格与约束
- API 请求统一走 `async/await`，并按页面维度做最小封装。
- 地图类能力抽离到渲染引擎模块，禁止散落多处 DOM + map 混写。
- 复用状态字段命名（如 `runtime`, `tasks`, `alerts`, `commands`, `logs`）。
- 所有页面需保留可读的中文业务语义与统一视觉基线。

## 架构演进路线
- 当前阶段：Vue 3 ESM 模块化（零构建依赖、快速迭代）。
- 下一阶段：迁移至 Vite Monorepo + TS + ESLint + 单元测试。

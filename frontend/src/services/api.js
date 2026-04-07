// frontend/src/services/api.js
// e-Agent-OS OpCenter — API Service Layer
import axios from 'axios';
import {
  MOCK_EMPLOYEES,
  MOCK_DASHBOARD_STATS,
  MOCK_STATUS_DIST,
  MOCK_TOKEN_TREND,
  MOCK_TASK_TREND,
  MOCK_ACTIVITY,
} from '../mock/data.js';
import {
  MOCK_BLUEPRINTS,
  DEPARTMENTS,
} from '../mock/blueprints.js';

const USE_MOCK = true; // flip to false when connecting to real backend

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// ---- Mock Implementations ----

function mockGetEmployees({ status, department, title, search } = {}) {
  let result = [...MOCK_EMPLOYEES];
  if (status) result = result.filter(e => e.status === status);
  if (department) result = result.filter(e => e.department === department);
  if (title) result = result.filter(e => e.title === title);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q),
    );
  }
  return Promise.resolve({ data: result });
}

function mockGetEmployee(id) {
  const emp = MOCK_EMPLOYEES.find(e => e.id === id);
  if (!emp) return Promise.reject({ response: { status: 404 } });
  return Promise.resolve({ data: emp });
}

function mockGetDashboardStats() {
  return Promise.resolve({ data: MOCK_DASHBOARD_STATS });
}

function mockGetStatusDist() {
  return Promise.resolve({ data: MOCK_STATUS_DIST });
}

function mockGetTokenTrend() {
  return Promise.resolve({ data: MOCK_TOKEN_TREND });
}

function mockGetTaskTrend() {
  return Promise.resolve({ data: MOCK_TASK_TREND });
}

function mockGetActivity({ limit = 10 } = {}) {
  return Promise.resolve({ data: MOCK_ACTIVITY.slice(0, limit) });
}

function mockGetBlueprints() {
  return Promise.resolve({ data: MOCK_BLUEPRINTS });
}

function mockDeploy(payload) {
  const id = `av-${payload.role}-${Date.now()}`;
  return Promise.resolve({
    data: {
      id,
      role: payload.role,
      alias: payload.alias || payload.role,
      department: payload.department,
      versions: [
        {
          version: 'v1.0.0',
          status: 'published',
          traffic: 100,
          replicas: payload.scaling?.minReplicas ?? 1,
          config: { soul: payload.soul || {}, skills: [], tools: [], model: '' },
          scaling: payload.scaling || { minReplicas: 1, maxReplicas: 5, targetLoad: 70 },
        },
      ],
      capacity: {
        used: payload.scaling?.minReplicas ?? 1,
        max: payload.scaling?.maxReplicas ?? 5,
      },
    },
  });
}

function mockAdjustTraffic(blueprintId, versionIndex, traffic) {
  return Promise.resolve({
    data: { blueprintId, versionIndex, traffic },
  });
}

// ---- Public API Functions ----

export const employeeApi = {
  list: (params) =>
    USE_MOCK ? mockGetEmployees(params) : api.get('/employees', { params }),
  get: (id) =>
    USE_MOCK ? mockGetEmployee(id) : api.get(`/employees/${id}`),
};

export const dashboardApi = {
  stats: () =>
    USE_MOCK ? mockGetDashboardStats() : api.get('/dashboard/stats'),
  statusDist: () =>
    USE_MOCK ? mockGetStatusDist() : api.get('/dashboard/status-dist'),
  tokenTrend: () =>
    USE_MOCK ? mockGetTokenTrend() : api.get('/dashboard/token-trend'),
  taskTrend: () =>
    USE_MOCK ? mockGetTaskTrend() : api.get('/dashboard/task-trend'),
  activity: (params) =>
    USE_MOCK ? mockGetActivity(params) : api.get('/activity', { params }),
};

export const opsApi = {
  execute: (payload) =>
    USE_MOCK
      ? Promise.resolve({
          data: {
            status: 'ok',
            summary: 'mock',
            tokenTotal: 100,
            durationMs: 2000,
          },
        })
      : api.post('/ops/execute', payload),
};

export const onboardingApi = {
  list: () =>
    USE_MOCK ? mockGetBlueprints() : api.get('/onboarding/blueprints'),
  deploy: (payload) =>
    USE_MOCK ? mockDeploy(payload) : api.post('/onboarding/deploy', payload),
  adjustTraffic: (blueprintId, versionIndex, traffic) =>
    USE_MOCK
      ? mockAdjustTraffic(blueprintId, versionIndex, traffic)
      : api.put(`/onboarding/blueprints/${blueprintId}/traffic`, {
          versionIndex,
          traffic,
        }),
  deprecateVersion: (blueprintId, versionIndex) =>
    api.put(`/onboarding/blueprints/${blueprintId}/deprecate`, {
      versionIndex,
    }),
};

// ---- Mock Journal Data ----

const MOCK_JOURNAL = [
  {
    id: 'exec-001',
    alias: '码哥',
    role: '软件工程师',
    dept: '技术研发部',
    blueprintId: 'av-swe-001',
    status: 'ok',
    message: '帮我审查代码',
    input: '用户发送了一段 Python 代码，要求审查是否存在安全漏洞和性能问题。\n\n```python\ndef process_user_data(user_input):\n    eval(user_input)\n    return "Done"\n```',
    summary: '审查完成，发现 1 个高风险漏洞（eval 注入）和 1 个性能问题。已在代码中标注。',
    tokenTotal: 1500,
    durationMs: 2300,
    createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'exec-002',
    alias: '明律',
    role: '法务专员',
    dept: '法务合规部',
    blueprintId: 'av-legal-001',
    status: 'error',
    message: '审阅采购合同',
    input: '请审阅以下采购合同，重点检查违约责任条款和知识产权归属。\n\n甲方：A公司\n乙方：B公司\n金额：500万元\n期限：2年',
    summary: '合同存在重大风险：1）违约金条款过重；2）知识产权默认归甲方所有。建议修改第8条和第12条。',
    tokenTotal: 700,
    durationMs: 3800,
    createdAt: '2026-04-07T10:15:00Z',
  },
  {
    id: 'exec-003',
    alias: '行行',
    role: '行政专员',
    dept: '综合管理部',
    blueprintId: 'av-admin-001',
    status: 'ok',
    message: '安排下周会议',
    input: '需要安排一个周一至周五的工作会议，参与者：王总、李经理、张助理，地点在公司大会议室。',
    summary: '已安排：周四下午2:00，公司大会议室。已发送日历邀请给所有参与者。',
    tokenTotal: 420,
    durationMs: 1100,
    createdAt: '2026-04-07T11:30:00Z',
  },
  {
    id: 'exec-004',
    alias: '合同小秘',
    role: '合同专员',
    dept: '商务运营部',
    blueprintId: 'av-legal-002',
    status: 'ok',
    message: '起草劳动合同',
    input: '为新入职员工起草一份标准劳动合同，岗位：高级产品经理，基本月薪35000元，合同期限3年。',
    summary: '劳动合同已起草完成，包含标准条款：试用期、工作内容、薪酬福利、保密协议、竞业限制。',
    tokenTotal: 980,
    durationMs: 2800,
    createdAt: '2026-04-07T14:00:00Z',
  },
  {
    id: 'exec-005',
    alias: '码哥',
    role: '软件工程师',
    dept: '技术研发部',
    blueprintId: 'av-swe-001',
    status: 'ok',
    message: '解释分布式锁原理',
    input: 'Redis 分布式锁的实现原理是什么？如何避免死锁？',
    summary: 'Redis 分布式锁基于 SET NX EX 原子命令实现。避免死锁需设置过期时间，并使用唯一 value 标识持有者，释放时先检查再删除。',
    tokenTotal: 2100,
    durationMs: 1500,
    createdAt: '2026-04-07T15:45:00Z',
  },
  {
    id: 'exec-006',
    alias: '明律',
    role: '法务专员',
    dept: '法务合规部',
    blueprintId: 'av-legal-001',
    status: 'ok',
    message: '提供数据合规建议',
    input: '我们的 App 即将上线，需要确认是否符合《个人信息保护法》要求。',
    summary: '建议补充：1）隐私政策公示；2）用户同意书；3）数据删除机制；4）未成年人保护条款。上线前需完成个人信息保护影响评估。',
    tokenTotal: 1200,
    durationMs: 4200,
    createdAt: '2026-04-07T16:30:00Z',
  },
];

function mockListExecutions({ status, role, dept, q } = {}) {
  let result = [...MOCK_JOURNAL];
  if (status && status !== 'all') {
    result = result.filter((e) => e.status === status);
  }
  if (role && role !== 'all') {
    result = result.filter((e) => e.role === role);
  }
  if (dept && dept !== 'all') {
    result = result.filter((e) => e.dept === dept);
  }
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (e) =>
        e.message.toLowerCase().includes(lower) ||
        e.summary.toLowerCase().includes(lower) ||
        e.alias.toLowerCase().includes(lower),
    );
  }
  return Promise.resolve({ data: { total: result.length, items: result } });
}

function mockGetExecution(id) {
  const exec = MOCK_JOURNAL.find((e) => e.id === id);
  if (!exec) return Promise.reject({ response: { status: 404 } });
  return Promise.resolve({ data: exec });
}

// ---- Journal API ----

export const journalApi = {
  list: (filters) =>
    USE_MOCK ? mockListExecutions(filters) : api.get('/journal/executions', { params: filters }),
  get: (id) =>
    USE_MOCK ? mockGetExecution(id) : api.get(`/journal/executions/${id}`),
};

export { DEPARTMENTS };
export default api;

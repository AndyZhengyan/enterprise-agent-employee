export const KPIS = [
  { label: '接入数字员工', value: '12' },
  { label: '运行中任务', value: '37' },
  { label: '告警数（24h）', value: '3' },
  { label: '平均响应时间', value: '1.8s' }
];

export const MODULES = [
  { name: '员工中心', desc: '员工档案、技能绑定、权限分组', status: '正常', level: 'ok', owner: '平台运营组' },
  { name: '任务中心', desc: '任务编排、SLA、消息通知', status: '正常', level: 'ok', owner: '流程产品组' },
  { name: '场景编排', desc: '业务场景流、规则引擎、审批链路', status: '待升级', level: 'warn', owner: '架构治理组' },
  { name: '运行告警', desc: '健康检查、故障告警、值班路由', status: '异常波动', level: 'danger', owner: 'SRE 团队' }
];

export function defaultLogs() {
  return [
    { ts: Date.now() / 1000 - 3600, message: '完成员工中心权限策略同步。' },
    { ts: Date.now() / 1000 - 1500, message: '任务中心新增高速救援场景模板。' },
    { ts: Date.now() / 1000 - 500, message: '运行告警模块触发阈值波动告警。' }
  ];
}

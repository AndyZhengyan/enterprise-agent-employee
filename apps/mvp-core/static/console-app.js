import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

const getJson = async (url) => (await fetch(url)).json();

createApp({
  data() {
    return {
      runtime: {},
      employees: [],
      tasks: [],
      commands: [],
      alerts: [],
      timer: null
    };
  },
  mounted() {
    this.refresh();
    this.timer = setInterval(this.refresh, 1500);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    fmtTs(ts) { return ts ? new Date(ts * 1000).toLocaleTimeString() : '-'; },
    badgeClass(v) { return `b-${String(v || '').toLowerCase()}`; },
    async refresh() {
      const [runtime, emps, tasks, commands, alerts] = await Promise.all([
        getJson('/api/agent-runtime'),
        getJson('/api/employees'),
        getJson('/api/tasks'),
        getJson('/api/commands'),
        getJson('/api/alerts')
      ]);
      this.runtime = runtime;
      this.employees = emps.items || [];
      this.tasks = (tasks.items || []).slice(0, 20);
      this.commands = (commands.items || []).slice(0, 20);
      this.alerts = (alerts.items || []).slice(0, 20);
    },
    async createTask() {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_type: 'highway_incident_response', priority: 'P1' })
      });
      await this.refresh();
    }
  }
}).mount('#app');

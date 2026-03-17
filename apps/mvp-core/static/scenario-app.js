import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { ScenarioMap } from './scenario-map.js';

const getJson = async (url) => (await fetch(url)).json();

createApp({
  data() {
    return {
      mapEngine: null,
      incident: null,
      assets: [],
      commands: [],
      logs: [],
      timer: null
    };
  },
  computed: {
    incidentText() {
      if (!this.incident) return '无';
      return `${this.incident.id}（${this.incident.status}）`;
    }
  },
  mounted() {
    this.mapEngine = new ScenarioMap('map');
    this.refresh();
    this.timer = setInterval(this.refresh, 1000);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    fmtTs(ts) { return ts ? new Date(ts * 1000).toLocaleTimeString() : '-'; },
    async refresh() {
      const [data, commandsResp] = await Promise.all([getJson('/api/scenario'), getJson('/api/commands')]);
      this.incident = data.incident;
      this.assets = Object.values(data.assets || {});
      this.logs = (data.logs || []).slice().reverse().slice(0, 20);
      this.commands = (commandsResp.items || []).slice(0, 12);
      this.mapEngine.renderAssets(this.assets);
      this.mapEngine.renderIncident(this.incident);
    },
    async triggerTask() {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_type: 'highway_incident_response', priority: 'P1' })
      });
      await this.refresh();
    },
    async resetScenario() {
      await fetch('/api/scenario/reset', { method: 'POST' });
      await this.refresh();
    }
  }
}).mount('#app');

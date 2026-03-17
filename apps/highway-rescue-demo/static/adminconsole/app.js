import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { KPIS, MODULES, defaultLogs } from './app-data.js';

createApp({
  data() {
    return {
      kpis: KPIS,
      modules: MODULES,
      logs: defaultLogs()
    };
  },
  methods: {
    formatTime(ts) {
      return new Date(ts * 1000).toLocaleTimeString();
    }
  }
}).mount('#app');

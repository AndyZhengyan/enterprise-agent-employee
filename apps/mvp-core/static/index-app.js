import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

createApp({
  data() {
    return {
      title: 'Enterprise Digital Employee MVP',
      subtitle: '统一前端框架入口：Vue 3 ESM 模块化',
      entries: [
        { href: '/console', label: '进入管理控制台（Console）' },
        { href: '/scenario', label: '进入高速事故处理 Demo（Scenario）' }
      ]
    };
  }
}).mount('#app');

import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { BASE_CENTER, FRAMES } from './app-data.js';
import { InspectionMapEngine } from './map-engine.js';

createApp({
  data() {
    return {
      mapEngine: null,
      frameIndex: 0,
      frames: FRAMES,
      layers: { vector: true, satellite: false, heat: true, links: true },
      selectedEntity: null,
      query: '',
      autoplay: true,
      autoplayTimer: null
    };
  },
  computed: {
    currentFrame() {
      return this.frames[this.frameIndex];
    },
    highPriorityCount() {
      return this.currentFrame.defects.filter((d) => ['严重', '紧急'].includes(d.severity)).length;
    },
    selectedVehicle() {
      if (!this.selectedEntity) return null;
      return this.currentFrame.vehicles.find((v) => {
        return Math.abs(v.lat - this.selectedEntity.lat) + Math.abs(v.lng - this.selectedEntity.lng) < 0.05;
      }) || this.currentFrame.vehicles[0];
    },
    latestLogs() {
      return this.currentFrame.logs;
    }
  },
  mounted() {
    this.mapEngine = new InspectionMapEngine('map', BASE_CENTER);
    this.mapEngine.applyBaseLayers(this.layers);
    this.selectedEntity = this.currentFrame.defects[0] || null;
    this.renderMap();

    this.autoplayTimer = setInterval(() => {
      if (!this.autoplay) return;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.renderMap();
    }, 4000);
  },
  beforeUnmount() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
  },
  methods: {
    severityClass(sev) {
      if (sev === '关注') return 'sev-warn';
      if (sev === '严重' || sev === '紧急') return 'sev-critical';
      return 'sev-ok';
    },
    selectDefect(defect) {
      this.selectedEntity = defect;
      this.renderMap();
    },
    runSearch() {
      const text = this.query.toLowerCase();
      const match = this.currentFrame.defects.find((d) => {
        return text.includes(d.type) || text.includes(d.id.toLowerCase()) || text.includes(d.road);
      });
      if (!match) return;
      this.selectedEntity = match;
      this.mapEngine.focusOn(match.lat, match.lng);
      this.renderMap();
    },
    updateLayers() {
      this.mapEngine.applyBaseLayers(this.layers);
      this.renderMap();
    },
    renderMap() {
      if (!this.mapEngine) return;
      this.mapEngine.renderFrame(this.currentFrame, this.selectedEntity, this.layers, (defect) => {
        this.selectDefect(defect);
      });
    }
  },
  watch: {
    frameIndex() {
      this.selectedEntity = this.currentFrame.defects[0] || null;
    }
  }
}).mount('#app');

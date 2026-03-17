import L from 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/+esm';

export class InspectionMapEngine {
  constructor(containerId, center) {
    this.map = L.map(containerId, { zoomControl: false }).setView(center, 11.8);
    this.vectorLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CARTO'
    });
    this.satelliteLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    });
    this.dynamicLayers = [];
  }

  applyBaseLayers(layers) {
    [this.vectorLayer, this.satelliteLayer].forEach((layer) => this.map.removeLayer(layer));
    if (layers.vector) this.vectorLayer.addTo(this.map);
    if (layers.satellite) this.satelliteLayer.addTo(this.map);
  }

  focusOn(lat, lng) {
    this.map.flyTo([lat, lng], 13, { duration: 0.8 });
  }

  clearDynamic() {
    this.dynamicLayers.forEach((layer) => this.map.removeLayer(layer));
    this.dynamicLayers = [];
  }

  renderFrame(frame, selectedEntity, layers, onDefectClick) {
    this.clearDynamic();

    frame.vehicles.forEach((v) => {
      const marker = L.circleMarker([v.lat, v.lng], {
        radius: 6,
        color: '#48e29f',
        weight: 2,
        fillOpacity: 0.7
      }).addTo(this.map);
      marker.bindTooltip(`${v.name} · ${v.status}`);
      this.dynamicLayers.push(marker);
    });

    frame.defects.forEach((d) => {
      const color = d.severity === '紧急' ? '#ff6b7f' : d.severity === '严重' ? '#f2b35d' : '#72c7ff';
      const marker = L.circleMarker([d.lat, d.lng], {
        radius: selectedEntity?.id === d.id ? 9 : 7,
        color,
        weight: 2,
        fillOpacity: 0.8
      }).addTo(this.map);
      marker.bindTooltip(`${d.id} · ${d.type}`);
      marker.on('click', () => onDefectClick(d));
      this.dynamicLayers.push(marker);

      if (layers.heat) {
        const heat = L.circle([d.lat, d.lng], {
          radius: 220 + d.sizeCm * 2,
          color,
          weight: 1,
          fillOpacity: 0.08
        }).addTo(this.map);
        this.dynamicLayers.push(heat);
      }
    });

    if (layers.links) {
      frame.defects.forEach((d, index) => {
        const v = frame.vehicles[index % frame.vehicles.length];
        const mid = [d.lat + 0.008, d.lng + 0.006];
        const line = L.polyline([[v.lat, v.lng], [d.lat, d.lng], mid], {
          color: '#9d7bff',
          weight: selectedEntity?.id === d.id ? 3 : 1.8,
          opacity: 0.7,
          dashArray: '6 4'
        }).addTo(this.map);
        this.dynamicLayers.push(line);
      });
    }
  }
}

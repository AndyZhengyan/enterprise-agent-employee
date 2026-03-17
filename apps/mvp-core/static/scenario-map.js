import L from 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/+esm';

const ICONS = {
  recon_drone: L.divIcon({ html: '🛰️', className: '', iconSize: [24, 24] }),
  fire_drone: L.divIcon({ html: '🚁', className: '', iconSize: [24, 24] }),
  rescue_dog: L.divIcon({ html: '🐕', className: '', iconSize: [24, 24] }),
  incident: L.divIcon({ html: '🚧', className: '', iconSize: [24, 24] })
};

export class ScenarioMap {
  constructor(containerId) {
    this.map = L.map(containerId).setView([31.2304, 121.4737], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.markers = {};
  }

  upsert(id, lat, lng, type, popup) {
    const icon = ICONS[type] || ICONS.incident;
    if (!this.markers[id]) {
      this.markers[id] = L.marker([lat, lng], { icon }).addTo(this.map);
    } else {
      this.markers[id].setLatLng([lat, lng]);
    }
    this.markers[id].bindPopup(popup);
  }

  renderAssets(assets) {
    assets.forEach((a) => this.upsert(a.id, a.lat, a.lng, a.type, `${a.name}<br/>${a.status}`));
  }

  renderIncident(incident) {
    if (!incident) return;
    this.upsert('incident', incident.lat, incident.lng, 'incident', `${incident.id}<br/>${incident.status}`);
  }
}

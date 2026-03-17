export const BASE_CENTER = [31.2304, 121.4737];

export const FRAMES = [
  {
    timeLabel: '06:00',
    vehicles: [
      { id: 'V-21', name: '巡检车-21', status: '例行巡航', zone: '工区A', lat: 31.236, lng: 121.43 },
      { id: 'V-11', name: '巡检车-11', status: '道路影像采集', zone: '工区B', lat: 31.209, lng: 121.488 }
    ],
    defects: [
      { id: 'D-901', type: '裂缝', severity: '关注', road: '绕城高速', sizeCm: 22, confidence: 0.81, lat: 31.226, lng: 121.448, repairIntensity: '中', recommendation: '48小时内灌缝处理' }
    ],
    logs: ['06:00 巡检任务启动，图像流接入完成。']
  },
  {
    timeLabel: '09:00',
    vehicles: [
      { id: 'V-21', name: '巡检车-21', status: '复核裂缝点位', zone: '工区A', lat: 31.229, lng: 121.451 },
      { id: 'V-11', name: '巡检车-11', status: '例行巡航', zone: '工区B', lat: 31.22, lng: 121.51 }
    ],
    defects: [
      { id: 'D-901', type: '裂缝', severity: '关注', road: '绕城高速', sizeCm: 26, confidence: 0.87, lat: 31.226, lng: 121.448, repairIntensity: '中', recommendation: '24小时内灌缝并封闭慢车道' },
      { id: 'D-944', type: '护栏损坏', severity: '严重', road: '沪宁高速', sizeCm: 120, confidence: 0.91, lat: 31.24, lng: 121.49, repairIntensity: '高', recommendation: '立即更换并发布绕行指令' }
    ],
    logs: ['09:00 D-944 由 V-11 发现，升级至严重告警。']
  },
  {
    timeLabel: '12:00',
    vehicles: [
      { id: 'V-21', name: '巡检车-21', status: '现场交通引导', zone: '工区A', lat: 31.239, lng: 121.486 },
      { id: 'V-11', name: '巡检车-11', status: '积水复核', zone: '工区B', lat: 31.214, lng: 121.503 }
    ],
    defects: [
      { id: 'D-944', type: '护栏损坏', severity: '严重', road: '沪宁高速', sizeCm: 120, confidence: 0.93, lat: 31.24, lng: 121.49, repairIntensity: '高', recommendation: '已派发维护队列 M-7' },
      { id: 'D-977', type: '积水', severity: '紧急', road: '外环高速', sizeCm: 300, confidence: 0.89, lat: 31.217, lng: 121.502, repairIntensity: '中', recommendation: '立即排水并临时封控' }
    ],
    logs: ['12:00 D-977 雨后形成积水，优先级升为紧急。']
  },
  {
    timeLabel: '15:00',
    vehicles: [
      { id: 'V-21', name: '巡检车-21', status: '恢复巡航', zone: '工区A', lat: 31.233, lng: 121.462 },
      { id: 'V-11', name: '巡检车-11', status: '协同维护验收', zone: '工区B', lat: 31.221, lng: 121.496 }
    ],
    defects: [
      { id: 'D-977', type: '积水', severity: '关注', road: '外环高速', sizeCm: 80, confidence: 0.74, lat: 31.217, lng: 121.502, repairIntensity: '低', recommendation: '监测排水系统并回访' }
    ],
    logs: ['15:00 紧急告警解除，进入回访阶段。']
  }
];

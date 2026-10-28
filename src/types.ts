import type * as THREE from 'three';

export type ViewMode = 'perspective' | 'top';

export type OverlayMode = 'normal' | 'heatmap_temp' | 'heatmap_lux' | 'sensor_coverage';

export type TemplateId = 'smart_office' | 'server_room' | 'smart_meeting' | 'smart_cafe' | 'greenhouse_lab';

export type ItemCategory = 'sensor' | 'climate' | 'lighting' | 'security' | 'power' | 'furniture';

export type LightingPreset = 'daylight' | 'golden_hour' | 'evening' | 'studio' | 'night_eco' | 'lounge';

export type WallPaintTheme =
  | 'executive_travertine'
  | 'charcoal_gallery'
  | 'warm_ochre'
  | 'mint_coral'
  | 'pastel_fiesta'
  | 'tropical_sunrise'
  | 'berry_pop';

export type SimulationScenario = 'normal' | 'heatwave' | 'rush_hour' | 'smoke_hazard' | 'night_eco';

export interface LightingConfig {
  preset: LightingPreset;
  intensity: number; // 0.3 to 2.0
  ceilingSpots: boolean;
  wallSconces: boolean;
  colorTemp: 'warm' | 'neutral' | 'cool' | 'gold';
  shadows: boolean;
  wallTheme?: WallPaintTheme;
}

export interface DeviceState {
  online: boolean;
  power: boolean;
  battery: number; // 0 - 100%
  rssi: number; // -90 to -30 dBm
  wattage: number; // current power draw in Watts
  // Sensor specifics
  temperature?: number; // °C
  humidity?: number; // %
  co2?: number; // ppm
  pm25?: number; // µg/m³
  lightLux?: number; // Lux
  motionDetected?: boolean;
  smokeDetected?: boolean;
  noiseDb?: number; // dB
  // Actuator specifics
  targetTemp?: number; // °C
  fanSpeed?: 'low' | 'med' | 'high' | 'auto';
  brightness?: number; // 0 - 100%
  colorRgb?: string; // hex
  locked?: boolean;
  alarmActive?: boolean;
  curtainOpen?: number; // 0 - 100%
  lastUpdated?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  iconName: string;
  price: number;
  seats: number;
  baseWatts: number; // power draw when on
  dim: [number, number]; // [width, depth] in meters
  height: number;
  isIoT: boolean;
  coverageRadius?: number; // meters for sensor radius
  defaultState?: Partial<DeviceState>;
  factory: (brandColor: string, state?: DeviceState) => THREE.Group;
}

export interface PlacedItem {
  id: string;
  type: string;
  name: string;
  category: ItemCategory;
  price: number;
  seats: number;
  position: { x: number; z: number };
  rotation: number;
  isIoT: boolean;
  state: DeviceState;
  mesh?: THREE.Group;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerType: 'temperature' | 'motion' | 'co2' | 'smoke' | 'lightLux' | 'time' | 'scenario';
  operator: '>' | '<' | '==' | '!=' | 'detected' | 'cleared';
  thresholdValue: number | boolean | string;
  sourceDeviceId?: string;
  targetDeviceId?: string;
  actionType: 'power_on' | 'power_off' | 'set_temp' | 'set_brightness' | 'trigger_alarm' | 'lock_door' | 'unlock_door';
  actionParam?: number | string | boolean;
  lastTriggered?: number;
}

export interface AlertNotification {
  id: string;
  timestamp: number;
  deviceId: string;
  deviceName: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  acknowledged: boolean;
}

export interface TelemetryHistoryPoint {
  time: string;
  timestamp: number;
  avgTemp: number;
  avgHumidity: number;
  totalWatts: number;
  co2: number;
  pm25: number;
  comfortIndex: number;
}

export interface RoomTelemetrySummary {
  avgTemp: number;
  avgHumidity: number;
  avgCo2: number;
  avgPm25: number;
  totalWatts: number;
  dailyKwh: number;
  estimatedDailyCostIdr: number;
  comfortIndex: number; // 0 - 100
  aqiRating: 'Bagus' | 'Sedang' | 'Kurang Sehat' | 'Berbahaya';
  onlineDeviceCount: number;
  totalDeviceCount: number;
  activeAlertsCount: number;
  occupancyCount: number;
}

export interface ProjectTemplate {
  id: TemplateId;
  name: string;
  icon: string;
  areaSqFt: number;
  description: string;
  defaultBrandColor: string;
  maxCapacity: number;
  environmentTarget: {
    targetTemp: number;
    targetHumidity: number;
    targetLux: number;
  };
  items: Array<{
    type: string;
    x: number;
    z: number;
    rotation?: number;
    initialState?: Partial<DeviceState>;
  }>;
}

export interface RoomConfig {
  width: number; // 12m
  depth: number; // 10m
  height: number; // 3.4m
  areaM2: number; // 120m2
}

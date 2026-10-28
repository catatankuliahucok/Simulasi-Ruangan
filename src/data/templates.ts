import type { ProjectTemplate } from '../types';

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'smart_office',
    name: 'Smart Open-Plan Office',
    icon: 'Laptop',
    areaSqFt: 1292,
    description: 'Kantor modern dengan integrasi HVAC hemat energi, sensor okupansi otomatis, pemantau AQI, dan smart lighting terpusat.',
    defaultBrandColor: '#0EA5E9',
    maxCapacity: 24,
    environmentTarget: {
      targetTemp: 23,
      targetHumidity: 50,
      targetLux: 500,
    },
    items: [
      // Server & Edge Gateway Hub
      { type: 'smart_server_rack', x: -5.0, z: -4.0, rotation: 0 },
      
      // Smart AC HVAC Units (North & South walls)
      { type: 'smart_ac_unit', x: -2.0, z: -4.8, rotation: 0 },
      { type: 'smart_ac_unit', x: 2.0, z: -4.8, rotation: 0 },

      // Access Control
      { type: 'smart_door_lock', x: -5.8, z: 0.0, rotation: Math.PI / 2 },

      // Environmental Stations & Sensors
      { type: 'air_quality_sensor', x: 0.0, z: -4.8, rotation: 0 },
      { type: 'pir_motion_sensor', x: -2.0, z: 0.0 },
      { type: 'pir_motion_sensor', x: 2.0, z: 0.0 },
      { type: 'smoke_detector', x: 0.0, z: 0.0 },
      { type: 'smart_cctv', x: 5.2, z: -4.2 },

      // Smart Lighting Grid
      { type: 'smart_ceiling_light', x: -3.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: 0.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: 3.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: -3.0, z: 2.0 },
      { type: 'smart_ceiling_light', x: 0.0, z: 2.0 },
      { type: 'smart_ceiling_light', x: 3.0, z: 2.0 },

      // Workstation Clusters
      { type: 'workstation', x: -2.8, z: -2.0 },
      { type: 'ergo_chair', x: -2.8, z: -1.35, rotation: Math.PI },
      { type: 'workstation', x: 2.8, z: -2.0 },
      { type: 'ergo_chair', x: 2.8, z: -1.35, rotation: Math.PI },

      { type: 'workstation', x: -2.8, z: 1.4 },
      { type: 'ergo_chair', x: -2.8, z: 2.05, rotation: Math.PI },
      { type: 'workstation', x: 2.8, z: 1.4 },
      { type: 'ergo_chair', x: 2.8, z: 2.05, rotation: Math.PI },

      // Designer Pendant Luminaires above Workstations
      { type: 'smart_pendant', x: -2.8, z: -2.0 },
      { type: 'smart_pendant', x: 2.8, z: -2.0 },

      // Smart Plugs
      { type: 'smart_plug', x: -3.5, z: -2.0 },
      { type: 'smart_plug', x: 3.5, z: -2.0 },

      // Executive Lounge Zone
      { type: 'smart_sofa', x: 0.0, z: 3.8, rotation: Math.PI },
      { type: 'plant', x: -5.2, z: 3.8 },
      { type: 'plant', x: 5.2, z: 3.8 },
      { type: 'plant', x: 0.0, z: -4.2 },
    ],
  },
  {
    id: 'server_room',
    name: 'Data Center & Server Room',
    icon: 'Server',
    areaSqFt: 1292,
    description: 'Fasilitas server mission-critical dengan pendingin presisi CRAC ganda, proteksi kebakaran berstandar tinggi, dan sensor suhu termal mikro.',
    defaultBrandColor: '#10B981',
    maxCapacity: 6,
    environmentTarget: {
      targetTemp: 20,
      targetHumidity: 45,
      targetLux: 350,
    },
    items: [
      // Row 1 Server Racks
      { type: 'smart_server_rack', x: -3.2, z: -2.5, rotation: 0 },
      { type: 'smart_server_rack', x: -2.0, z: -2.5, rotation: 0 },
      { type: 'smart_server_rack', x: -0.8, z: -2.5, rotation: 0 },
      { type: 'smart_server_rack', x: 0.8, z: -2.5, rotation: 0 },
      { type: 'smart_server_rack', x: 2.0, z: -2.5, rotation: 0 },
      { type: 'smart_server_rack', x: 3.2, z: -2.5, rotation: 0 },

      // Row 2 Server Racks
      { type: 'smart_server_rack', x: -3.2, z: 2.0, rotation: Math.PI },
      { type: 'smart_server_rack', x: -2.0, z: 2.0, rotation: Math.PI },
      { type: 'smart_server_rack', x: -0.8, z: 2.0, rotation: Math.PI },
      { type: 'smart_server_rack', x: 0.8, z: 2.0, rotation: Math.PI },
      { type: 'smart_server_rack', x: 2.0, z: 2.0, rotation: Math.PI },
      { type: 'smart_server_rack', x: 3.2, z: 2.0, rotation: Math.PI },

      // Precision HVAC Cooling
      { type: 'smart_ac_unit', x: -4.5, z: -4.8, rotation: 0 },
      { type: 'smart_ac_unit', x: 4.5, z: -4.8, rotation: 0 },
      { type: 'smart_ac_unit', x: 0.0, z: 4.8, rotation: Math.PI },

      // Fire & Smoke Safety
      { type: 'smoke_detector', x: -2.5, z: 0.0 },
      { type: 'smoke_detector', x: 2.5, z: 0.0 },

      // Air Quality & Thermal Stations
      { type: 'air_quality_sensor', x: -5.0, z: 0.0, rotation: Math.PI / 2 },
      { type: 'air_quality_sensor', x: 5.0, z: 0.0, rotation: -Math.PI / 2 },

      // Access Security
      { type: 'smart_door_lock', x: -5.8, z: 3.5, rotation: Math.PI / 2 },
      { type: 'smart_cctv', x: -5.0, z: -4.2 },
      { type: 'smart_cctv', x: 5.0, z: 4.2 },

      // Lighting
      { type: 'smart_ceiling_light', x: 0.0, z: -0.2 },
      { type: 'smart_ceiling_light', x: -3.0, z: -0.2 },
      { type: 'smart_ceiling_light', x: 3.0, z: -0.2 },
    ],
  },
  {
    id: 'smart_meeting',
    name: 'Executive Smart Boardroom',
    icon: 'Users',
    areaSqFt: 1292,
    description: 'Ruang konferensi cerdas dengan penyesuaian pencahayaan presentasi otomatis, pelacak kehadiran radar PIR, dan optimasi sirkulasi udara CO2.',
    defaultBrandColor: '#8B5CF6',
    maxCapacity: 16,
    environmentTarget: {
      targetTemp: 22,
      targetHumidity: 50,
      targetLux: 450,
    },
    items: [
      // Smart Conference Table in Center
      { type: 'boardroom_table', x: 0.0, z: 0.0 },

      // Chairs around table (North row at z=-1.05 faces +Z [rotation: 0]; South row at z=+1.05 faces -Z [rotation: Math.PI])
      { type: 'ergo_chair', x: -1.1, z: -1.05, rotation: 0 },
      { type: 'ergo_chair', x: 0.0, z: -1.05, rotation: 0 },
      { type: 'ergo_chair', x: 1.1, z: -1.05, rotation: 0 },

      { type: 'ergo_chair', x: -1.1, z: 1.05, rotation: Math.PI },
      { type: 'ergo_chair', x: 0.0, z: 1.05, rotation: Math.PI },
      { type: 'ergo_chair', x: 1.1, z: 1.05, rotation: Math.PI },

      // Head-of-table chairs (West at x=-1.95 faces +X [Math.PI/2]; East at x=+1.95 faces -X [-Math.PI/2])
      { type: 'ergo_chair', x: -1.95, z: 0.0, rotation: Math.PI / 2 },
      { type: 'ergo_chair', x: 1.95, z: 0.0, rotation: -Math.PI / 2 },

      // IoT Lighting
      { type: 'smart_pendant', x: -0.8, z: 0.0 },
      { type: 'smart_pendant', x: 0.8, z: 0.0 },
      { type: 'smart_ceiling_light', x: -3.5, z: -3.0 },
      { type: 'smart_ceiling_light', x: 3.5, z: -3.0 },
      { type: 'smart_ceiling_light', x: -3.5, z: 3.0 },
      { type: 'smart_ceiling_light', x: 3.5, z: 3.0 },

      // Climate & AQI
      { type: 'smart_ac_unit', x: 0.0, z: -4.8, rotation: 0 },
      { type: 'air_quality_sensor', x: 3.5, z: -4.8, rotation: 0 },
      { type: 'pir_motion_sensor', x: 0.0, z: 0.0 },
      { type: 'smoke_detector', x: 0.0, z: 3.5 },

      // Security & Door
      { type: 'smart_door_lock', x: -5.8, z: -2.0, rotation: Math.PI / 2 },
      { type: 'smart_cctv', x: 5.0, z: -4.2 },

      // Decor
      { type: 'plant', x: -5.0, z: -4.0 },
      { type: 'plant', x: 5.0, z: 4.0 },
      { type: 'smart_sofa', x: -3.8, z: 3.6, rotation: Math.PI },
    ],
  },
  {
    id: 'smart_cafe',
    name: 'Smart Cafe & Lounge',
    icon: 'Coffee',
    areaSqFt: 1292,
    description: 'Kafe modern dengan pencahayaan suasana IoT adaptif, pemantau kenyamanan pelanggan, dan kontrol daya peralatan espresso.',
    defaultBrandColor: '#D4AF37',
    maxCapacity: 30,
    environmentTarget: {
      targetTemp: 24,
      targetHumidity: 55,
      targetLux: 300,
    },
    items: [
      // HVAC & Climate
      { type: 'smart_ac_unit', x: -2.5, z: -4.8, rotation: 0 },
      { type: 'smart_ac_unit', x: 2.5, z: -4.8, rotation: 0 },
      { type: 'air_quality_sensor', x: 0.0, z: -4.8, rotation: 0 },

      // Lighting Ambiance
      { type: 'smart_pendant', x: -2.2, z: -1.5 },
      { type: 'smart_pendant', x: 2.2, z: -1.5 },
      { type: 'smart_pendant', x: -2.2, z: 2.0 },
      { type: 'smart_pendant', x: 2.2, z: 2.0 },

      // Sensors & Safety
      { type: 'pir_motion_sensor', x: 0.0, z: 0.0 },
      { type: 'smoke_detector', x: 3.0, z: -3.0 },
      { type: 'smart_cctv', x: -5.0, z: -4.2 },
      { type: 'smart_door_lock', x: -5.8, z: 0.0, rotation: Math.PI / 2 },

      // Seating & Tables
      { type: 'smart_sofa', x: -3.8, z: -1.5, rotation: Math.PI / 2 },
      { type: 'smart_sofa', x: 3.8, z: -1.5, rotation: -Math.PI / 2 },
      { type: 'smart_sofa', x: -3.8, z: 2.0, rotation: Math.PI / 2 },
      { type: 'smart_sofa', x: 3.8, z: 2.0, rotation: -Math.PI / 2 },

      { type: 'boardroom_table', x: 0.0, z: 0.5 },
      { type: 'ergo_chair', x: -1.0, z: -0.55, rotation: 0 },
      { type: 'ergo_chair', x: 1.0, z: -0.55, rotation: 0 },
      { type: 'ergo_chair', x: -1.0, z: 1.55, rotation: Math.PI },
      { type: 'ergo_chair', x: 1.0, z: 1.55, rotation: Math.PI },

      // Power Meters
      { type: 'smart_plug', x: -5.0, z: -4.0 },
      { type: 'plant', x: -5.2, z: -4.2 },
      { type: 'plant', x: 5.2, z: 4.2 },
    ],
  },
  {
    id: 'greenhouse_lab',
    name: 'Smart Agritech Lab & Greenhouse',
    icon: 'Flower2',
    areaSqFt: 1292,
    description: 'Laboratorium tanaman cerdas dengan regulasi spektrum pencahayaan tumbuh, humidifikasi mikroklimat presisi, dan sensor emisi CO2.',
    defaultBrandColor: '#16A34A',
    maxCapacity: 8,
    environmentTarget: {
      targetTemp: 26,
      targetHumidity: 75,
      targetLux: 850,
    },
    items: [
      // Precision Climate & Humidity Control
      { type: 'smart_ac_unit', x: 0.0, z: -4.8, rotation: 0 },
      { type: 'air_quality_sensor', x: -3.5, z: -4.8, rotation: 0 },
      { type: 'air_quality_sensor', x: 3.5, z: -4.8, rotation: 0 },

      // Grow Spectrum Smart Lights
      { type: 'smart_ceiling_light', x: -3.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: 0.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: 3.0, z: -2.0 },
      { type: 'smart_ceiling_light', x: -3.0, z: 2.0 },
      { type: 'smart_ceiling_light', x: 0.0, z: 2.0 },
      { type: 'smart_ceiling_light', x: 3.0, z: 2.0 },

      // Sensor cluster
      { type: 'pir_motion_sensor', x: 0.0, z: 0.0 },
      { type: 'smoke_detector', x: 0.0, z: 3.5 },
      { type: 'smart_cctv', x: 5.0, z: -4.2 },
      { type: 'smart_door_lock', x: -5.8, z: 0.0, rotation: Math.PI / 2 },

      // Plants & Lab Benches
      { type: 'plant', x: -3.0, z: -2.0 },
      { type: 'plant', x: -1.5, z: -2.0 },
      { type: 'plant', x: 1.5, z: -2.0 },
      { type: 'plant', x: 3.0, z: -2.0 },

      { type: 'plant', x: -3.0, z: 2.0 },
      { type: 'plant', x: -1.5, z: 2.0 },
      { type: 'plant', x: 1.5, z: 2.0 },
      { type: 'plant', x: 3.0, z: 2.0 },

      { type: 'workstation', x: 0.0, z: 0.0 },
      { type: 'ergo_chair', x: 0.0, z: 0.68, rotation: Math.PI },
    ],
  },
];

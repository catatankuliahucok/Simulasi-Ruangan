import type {
  PlacedItem,
  DeviceState,
  AutomationRule,
  AlertNotification,
  RoomTelemetrySummary,
  SimulationScenario,
  TelemetryHistoryPoint,
} from '../types';

export const DEFAULT_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-cooling',
    name: 'Auto-HVAC Pendingin Cerdas',
    description: 'Nyalakan AC ke 22°C jika suhu ruangan melebihi 26°C',
    enabled: true,
    triggerType: 'temperature',
    operator: '>',
    thresholdValue: 26,
    actionType: 'set_temp',
    actionParam: 22,
  },
  {
    id: 'occupancy-lighting',
    name: 'Pencahayaan Adaptif Okupansi',
    description: 'Nyalakan lampu ke 100% jika sensor PIR mendeteksi aktivitas',
    enabled: true,
    triggerType: 'motion',
    operator: 'detected',
    thresholdValue: true,
    actionType: 'set_brightness',
    actionParam: 100,
  },
  {
    id: 'smoke-evacuation',
    name: 'Protokol Evakuasi & Keselamatan Kebakaran',
    description: 'Buka kunci darurat & bunyikan alarm jika asap atau panas ekstrem terdeteksi',
    enabled: true,
    triggerType: 'smoke',
    operator: 'detected',
    thresholdValue: true,
    actionType: 'unlock_door',
    actionParam: true,
  },
  {
    id: 'air-quality-boost',
    name: 'Sirkulasi Kualitas Udara (CO2 > 900 ppm)',
    description: 'Aktifkan ventilasi maksimal ketika kadar CO2 di atas ambang batas sehat',
    enabled: true,
    triggerType: 'co2',
    operator: '>',
    thresholdValue: 900,
    actionType: 'power_on',
    actionParam: true,
  },
];

export function updateDeviceSimulation(
  items: PlacedItem[],
  scenario: SimulationScenario,
  rules: AutomationRule[]
): {
  updatedItems: PlacedItem[];
  newAlerts: AlertNotification[];
  triggeredRules: string[];
} {
  const newAlerts: AlertNotification[] = [];
  const triggeredRules: string[] = [];

  // 1. Calculate active AC cooling influence
  const activeAcs = items.filter((i) => i.type === 'smart_ac_unit' && i.state.power);
  const targetAvgTemp =
    activeAcs.length > 0
      ? activeAcs.reduce((acc, a) => acc + (a.state.targetTemp || 22), 0) / activeAcs.length
      : 27;

  // 2. Scenario ambient factors
  let ambientTempTarget = 24.5;
  let ambientCo2Target = 520;
  let ambientPm25Target = 12;
  let ambientHumidityTarget = 52;
  let hasSmokeHazard = false;
  let motionActive = true;

  switch (scenario) {
    case 'heatwave':
      ambientTempTarget = 31.5;
      ambientHumidityTarget = 40;
      break;
    case 'rush_hour':
      ambientTempTarget = 25.8;
      ambientCo2Target = 1150;
      ambientPm25Target = 35;
      ambientHumidityTarget = 65;
      motionActive = true;
      break;
    case 'smoke_hazard':
      ambientTempTarget = 36.0;
      ambientCo2Target = 1800;
      ambientPm25Target = 145;
      hasSmokeHazard = true;
      break;
    case 'night_eco':
      ambientTempTarget = 26.0;
      ambientCo2Target = 420;
      ambientPm25Target = 8;
      motionActive = false;
      break;
    case 'normal':
    default:
      ambientTempTarget = 23.5;
      ambientCo2Target = 560;
      ambientPm25Target = 14;
      break;
  }

  // If AC is active, it fights ambient heat
  const effectiveRoomTemp =
    activeAcs.length > 0
      ? targetAvgTemp + (ambientTempTarget - targetAvgTemp) * 0.25
      : ambientTempTarget;

  // 3. Mutate each placed item telemetry
  const updatedItems = items.map((item) => {
    if (!item.isIoT) return item;

    const st = { ...item.state };
    const jitter = (Math.random() - 0.5) * 0.4;
    const now = Date.now();

    // Wattage calculation based on power
    if (!st.power) {
      st.wattage = 0.5; // standby power
    } else {
      switch (item.type) {
        case 'smart_ac_unit':
          st.wattage = Math.round(550 + Math.random() * 200 + (30 - (st.targetTemp || 22)) * 30);
          break;
        case 'smart_server_rack':
          st.wattage = Math.round(1120 + Math.random() * 80);
          break;
        case 'smart_ceiling_light':
        case 'smart_pendant':
          st.wattage = Math.round(((st.brightness || 100) / 100) * (item.type === 'smart_pendant' ? 24 : 18));
          break;
        case 'smart_cctv':
          st.wattage = 11.5 + Math.random() * 1.5;
          break;
        case 'smart_plug':
          st.wattage = 65 + Math.random() * 15;
          break;
        default:
          st.wattage = 2.0 + Math.random() * 0.8;
          break;
      }
    }

    // Specific sensor updates
    if (item.type === 'air_quality_sensor') {
      st.temperature = Number((effectiveRoomTemp + jitter).toFixed(1));
      st.humidity = Math.min(95, Math.max(20, Math.round(ambientHumidityTarget + (Math.random() - 0.5) * 4)));
      st.co2 = Math.round(ambientCo2Target + (Math.random() - 0.5) * 40);
      st.pm25 = Math.max(1, Math.round(ambientPm25Target + (Math.random() - 0.5) * 6));
    }

    if (item.type === 'pir_motion_sensor') {
      st.motionDetected = scenario === 'night_eco' ? Math.random() < 0.1 : motionActive;
      st.lightLux = st.power ? (scenario === 'night_eco' ? 25 : 480 + Math.round(jitter * 20)) : 10;
    }

    if (item.type === 'smoke_detector') {
      st.smokeDetected = hasSmokeHazard;
      st.temperature = Number((effectiveRoomTemp + (hasSmokeHazard ? 12 : 0) + jitter).toFixed(1));
      if (hasSmokeHazard) {
        st.alarmActive = true;
      }
    }

    if (item.type === 'smart_ac_unit') {
      st.temperature = Number((effectiveRoomTemp + jitter * 0.5).toFixed(1));
    }

    st.lastUpdated = now;

    return {
      ...item,
      state: st,
    };
  });

  // 4. Automation rule evaluation
  const executedRuleIds: string[] = [];
  const finalItems = [...updatedItems];

  rules.forEach((rule) => {
    if (!rule.enabled) return;

    let triggerFired = false;

    if (rule.triggerType === 'temperature') {
      const avgT =
        finalItems
          .filter((i) => i.state.temperature !== undefined)
          .reduce((acc, i) => acc + (i.state.temperature || 0), 0) /
        (finalItems.filter((i) => i.state.temperature !== undefined).length || 1);

      if (rule.operator === '>' && avgT > Number(rule.thresholdValue)) triggerFired = true;
      if (rule.operator === '<' && avgT < Number(rule.thresholdValue)) triggerFired = true;
    } else if (rule.triggerType === 'smoke') {
      const hasSmoke = finalItems.some((i) => i.state.smokeDetected);
      if (hasSmoke) triggerFired = true;
    } else if (rule.triggerType === 'motion') {
      const hasMotion = finalItems.some((i) => i.state.motionDetected);
      if (hasMotion) triggerFired = true;
    } else if (rule.triggerType === 'co2') {
      const maxCo2 = Math.max(...finalItems.map((i) => i.state.co2 || 0));
      if (maxCo2 > Number(rule.thresholdValue)) triggerFired = true;
    }

    if (triggerFired) {
      executedRuleIds.push(rule.id);

      // Execute rule actions across targeted device types
      finalItems.forEach((item, idx) => {
        if (!item.isIoT) return;

        if (rule.actionType === 'set_temp' && item.type === 'smart_ac_unit') {
          finalItems[idx] = {
            ...item,
            state: {
              ...item.state,
              power: true,
              targetTemp: Number(rule.actionParam || 22),
            },
          };
        }

        if (rule.actionType === 'set_brightness' && (item.type === 'smart_ceiling_light' || item.type === 'smart_pendant')) {
          finalItems[idx] = {
            ...item,
            state: {
              ...item.state,
              power: true,
              brightness: Number(rule.actionParam || 100),
            },
          };
        }

        if (rule.actionType === 'unlock_door' && item.type === 'smart_door_lock') {
          finalItems[idx] = {
            ...item,
            state: {
              ...item.state,
              locked: false,
            },
          };
        }

        if (rule.actionType === 'power_on' && item.type === 'smart_ac_unit') {
          finalItems[idx] = {
            ...item,
            state: {
              ...item.state,
              power: true,
              fanSpeed: 'high',
            },
          };
        }
      });
    }
  });

  // 5. Generate Notifications / Alerts
  if (hasSmokeHazard) {
    newAlerts.push({
      id: `alert-smoke-${Date.now()}`,
      timestamp: Date.now(),
      deviceId: 'smoke-det-01',
      deviceName: 'Detektor Asap & Api IoT',
      type: 'critical',
      title: 'BAHAYA: Asap / Api Terdeteksi!',
      message: 'Konsentrasi asap melebihi batas aman. Protokol evakuasi diaktifkan secara otomatis.',
      acknowledged: false,
    });
  }

  const highCo2Item = finalItems.find((i) => (i.state.co2 || 0) > 1200);
  if (highCo2Item) {
    newAlerts.push({
      id: `alert-co2-${Date.now()}`,
      timestamp: Date.now(),
      deviceId: highCo2Item.id,
      deviceName: highCo2Item.name,
      type: 'warning',
      title: 'Kadar CO2 Tinggi (>1200 ppm)',
      message: 'Kualitas udara ruangan menurun. Dianjurkan menyalakan sirkulasi udara atau membuka ventilasi.',
      acknowledged: false,
    });
  }

  return {
    updatedItems: finalItems,
    newAlerts,
    triggeredRules: executedRuleIds,
  };
}

export function calculateRoomSummary(items: PlacedItem[]): RoomTelemetrySummary {
  const iotItems = items.filter((i) => i.isIoT);
  const tempItems = iotItems.filter((i) => i.state.temperature !== undefined);
  const humidityItems = iotItems.filter((i) => i.state.humidity !== undefined);
  const co2Items = iotItems.filter((i) => i.state.co2 !== undefined);
  const pm25Items = iotItems.filter((i) => i.state.pm25 !== undefined);

  const avgTemp =
    tempItems.length > 0
      ? Number((tempItems.reduce((acc, i) => acc + (i.state.temperature || 0), 0) / tempItems.length).toFixed(1))
      : 24.0;

  const avgHumidity =
    humidityItems.length > 0
      ? Math.round(humidityItems.reduce((acc, i) => acc + (i.state.humidity || 0), 0) / humidityItems.length)
      : 50;

  const avgCo2 =
    co2Items.length > 0
      ? Math.round(co2Items.reduce((acc, i) => acc + (i.state.co2 || 0), 0) / co2Items.length)
      : 550;

  const avgPm25 =
    pm25Items.length > 0
      ? Math.round(pm25Items.reduce((acc, i) => acc + (i.state.pm25 || 0), 0) / pm25Items.length)
      : 12;

  const totalWatts = iotItems.reduce((acc, i) => acc + (i.state.wattage || 0), 0);
  const dailyKwh = Number(((totalWatts * 24) / 1000).toFixed(2));
  // IDR commercial tariff roughly Rp 1.444,70 / kWh
  const estimatedDailyCostIdr = Math.round(dailyKwh * 1445);

  // Comfort Index Calculation (0-100)
  let comfort = 100;
  // Temp penalty (ideal 21 - 25)
  if (avgTemp < 21) comfort -= (21 - avgTemp) * 10;
  if (avgTemp > 25) comfort -= (avgTemp - 25) * 12;
  // Humidity penalty (ideal 45 - 60)
  if (avgHumidity < 45) comfort -= (45 - avgHumidity) * 1.5;
  if (avgHumidity > 60) comfort -= (avgHumidity - 60) * 1.5;
  // CO2 penalty
  if (avgCo2 > 800) comfort -= ((avgCo2 - 800) / 20);
  comfort = Math.max(10, Math.min(100, Math.round(comfort)));

  let aqiRating: RoomTelemetrySummary['aqiRating'] = 'Bagus';
  if (avgCo2 > 1400 || avgPm25 > 55) aqiRating = 'Berbahaya';
  else if (avgCo2 > 1000 || avgPm25 > 35) aqiRating = 'Kurang Sehat';
  else if (avgCo2 > 750 || avgPm25 > 20) aqiRating = 'Sedang';

  const onlineDeviceCount = iotItems.filter((i) => i.state.online).length;
  const activeAlertsCount = iotItems.filter((i) => i.state.smokeDetected || (i.state.co2 || 0) > 1200).length;
  const occupancyCount = items.reduce((acc, i) => acc + i.seats, 0);

  return {
    avgTemp,
    avgHumidity,
    avgCo2,
    avgPm25,
    totalWatts,
    dailyKwh,
    estimatedDailyCostIdr,
    comfortIndex: comfort,
    aqiRating,
    onlineDeviceCount,
    totalDeviceCount: iotItems.length,
    activeAlertsCount,
    occupancyCount,
  };
}

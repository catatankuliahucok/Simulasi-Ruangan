import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const textureCache = new Map<string, THREE.CanvasTexture>();
const geometryCache = new Map<string, THREE.BufferGeometry>();

export function createRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius = 0.02,
  segments = 4
): THREE.BufferGeometry {
  const key = `rbox_${width}_${height}_${depth}_${radius}_${segments}`;
  let geom = geometryCache.get(key);
  if (!geom) {
    geom = new RoundedBoxGeometry(width, height, depth, segments, radius);
    geometryCache.set(key, geom);
  }
  return geom;
}

export function getContactShadowTexture(): THREE.CanvasTexture {
  const key = 'contact_shadow';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.48)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function createContactShadow(width: number, depth: number, opacity = 0.55): THREE.Mesh {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.18, depth * 1.18),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.008;
  return plane;
}

export function getFloorTileTexture(): THREE.CanvasTexture {
  const key = 'floor_travertine_luxury';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base architectural warm honed travertine / limestone
  ctx.fillStyle = '#EAE6DF';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 256;
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;

      const grad = ctx.createLinearGradient(x0, y0, x0 + tileSize, y0 + tileSize);
      const shadeA = (tx + ty) % 2 === 0 ? '#F3EFEA' : '#EDE8E1';
      const shadeB = (tx + ty) % 2 === 0 ? '#E8E2D9' : '#F1EDE7';
      grad.addColorStop(0, shadeA);
      grad.addColorStop(1, shadeB);
      ctx.fillStyle = grad;
      ctx.fillRect(x0 + 2, y0 + 2, tileSize - 4, tileSize - 4);

      // Subtle travertine mineral veins
      ctx.strokeStyle = 'rgba(180, 168, 152, 0.22)';
      ctx.lineWidth = 1.5;
      for (let v = 0; v < 5; v++) {
        ctx.beginPath();
        const vy = y0 + 28 + v * 44;
        ctx.moveTo(x0 + 6, vy);
        ctx.bezierCurveTo(
          x0 + 80,
          vy + ((v % 2 === 0 ? 1 : -1) * 12),
          x0 + 170,
          vy - ((v % 2 === 0 ? 1 : -1) * 10),
          x0 + tileSize - 6,
          vy + 4
        );
        ctx.stroke();
      }

      // Micro stone flecks
      for (let i = 0; i < 160; i++) {
        const rx = x0 + 6 + ((i * 73) % (tileSize - 12));
        const ry = y0 + 6 + ((i * 137) % (tileSize - 12));
        ctx.fillStyle = i % 2 === 0 ? 'rgba(161, 150, 136, 0.14)' : 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(rx, ry, 2, 2);
      }

      // Crisp chamfered tile edge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + 2.5, y0 + 2.5, tileSize - 5, tileSize - 5);
    }
  }

  // Fine recessed architectural stone joint lines
  ctx.fillStyle = '#D0C9BE';
  ctx.fillRect(0, 0, 512, 3);
  ctx.fillRect(0, 255, 512, 3);
  ctx.fillRect(0, 0, 3, 512);
  ctx.fillRect(255, 0, 3, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 5);
  textureCache.set(key, tex);
  return tex;
}

export function getRugTexture(): THREE.CanvasTexture {
  const key = 'executive_boucle_rug';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm oatmeal / taupe woven wool base
  ctx.fillStyle = '#DED8CE';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle woven boucle texture
  for (let y = 0; y < 512; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(120,113,108,0.12)';
    ctx.fillRect(0, y, 512, 2);
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.fillStyle = x % 8 === 0 ? 'rgba(120,113,108,0.1)' : 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, 0, 2, 512);
  }

  // Minimalist architectural double-border frame
  ctx.strokeStyle = '#78716C';
  ctx.lineWidth = 8;
  ctx.strokeRect(22, 22, 468, 468);

  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, 440, 440);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getWoodTexture(variant: 'walnut' | 'oak' | 'ash' = 'oak'): THREE.CanvasTexture {
  const key = `wood_${variant}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const palettes = {
    walnut: { base: '#3E2723', streak1: '#2D1B17', streak2: '#4E342E', highlight: '#5D4037' },
    oak: { base: '#C89F72', streak1: '#B3885B', streak2: '#D7B38C', highlight: '#E2C4A2' },
    ash: { base: '#E4DCD3', streak1: '#D2C7B8', streak2: '#EFEAE4', highlight: '#F7F4F0' },
  };
  const pal = palettes[variant];

  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, 512, 512);

  // Longitudinal wood fibers
  for (let i = 0; i < 220; i++) {
    const y = (i / 220) * 512;
    ctx.fillStyle = i % 3 === 0 ? pal.streak1 : i % 2 === 0 ? pal.streak2 : pal.highlight;
    ctx.globalAlpha = 0.22 + (i % 5) * 0.04;
    const h = 1 + (i % 3);
    ctx.fillRect(0, y, 512, h);
  }

  // Organic cathedral grain waves
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = pal.streak1;
  ctx.lineWidth = 2;
  for (let w = 0; w < 28; w++) {
    ctx.beginPath();
    const baseY = w * 18;
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= 512; x += 32) {
      const wave = Math.sin((x / 512) * Math.PI * 2 + w * 0.5) * 7;
      ctx.lineTo(x, baseY + wave);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, tex);
  return tex;
}

export function getFabricTexture(baseHex = '#334155'): THREE.CanvasTexture {
  const key = `fabric_${baseHex}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Fine woven upholstery threads
  for (let y = 0; y < 256; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.09)';
    ctx.fillRect(0, y, 256, 2);
  }
  for (let x = 0; x < 256; x += 4) {
    ctx.fillStyle = x % 8 === 0 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, 0, 2, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  textureCache.set(key, tex);
  return tex;
}

export function getServerMeshTexture(): THREE.CanvasTexture {
  const key = 'server_mesh_grille';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, 0, 256, 256);

  // Perforated dark ventilation slots
  ctx.fillStyle = '#050507';
  const step = 12;
  for (let y = 6; y < 256; y += step) {
    for (let x = 6; x < 256; x += step) {
      const offsetX = (y / step) % 2 === 0 ? 0 : step / 2;
      ctx.beginPath();
      ctx.arc((x + offsetX) % 256, y, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 6);
  textureCache.set(key, tex);
  return tex;
}

export function getAcDisplayTexture(isOn: boolean, temp: number, fanSpeed = 'auto'): THREE.CanvasTexture {
  const key = `ac_disp_${isOn}_${Math.round(temp)}_${fanSpeed}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Glossy black OLED bezel
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, 256, 96);

  if (isOn) {
    const accent = temp <= 22 ? '#38BDF8' : '#FBBF24';
    ctx.fillStyle = accent;
    ctx.font = 'bold 46px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${temp.toFixed(0)}°C`, 18, 48);

    // Mode & fan indicator
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('COOL · ECO', 148, 34);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px monospace';
    ctx.fillText(`FAN: ${fanSpeed.toUpperCase()}`, 148, 62);
  } else {
    ctx.fillStyle = '#3F3F46';
    ctx.font = 'bold 22px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('STANDBY', 72, 48);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getAqiDisplayTexture(co2 = 550, pm25 = 12, temp = 23.4, humidity = 52): THREE.CanvasTexture {
  const bucketCo2 = Math.round(co2 / 25) * 25;
  const key = `aqi_disp_${bucketCo2}_${Math.round(pm25)}_${Math.round(temp)}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 280;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, 256, 280);

  const statusColor = co2 > 1000 ? '#EF4444' : co2 > 800 ? '#F59E0B' : '#10B981';

  // Top header bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(14, 14, 228, 32);
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('AIR QUALITY MONITOR', 26, 35);

  // Circular gauge arc
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 126, 58, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  const ratio = Math.min(1, Math.max(0.1, (co2 - 400) / 1200));
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 126, 58, Math.PI * 0.8, Math.PI * (0.8 + ratio * 1.4));
  ctx.stroke();

  // CO2 Numeric readout
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(co2)}`, 128, 128);
  ctx.fillStyle = statusColor;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ppm CO₂', 128, 150);

  // Bottom metrics row
  ctx.textAlign = 'left';
  ctx.fillStyle = '#18181B';
  ctx.fillRect(16, 204, 224, 56);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`${temp.toFixed(1)}°C`, 28, 228);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText(`RH ${Math.round(humidity)}%`, 28, 248);

  ctx.fillStyle = statusColor;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`PM2.5: ${Math.round(pm25)}`, 124, 228);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px sans-serif';
  ctx.fillText(co2 > 1000 ? 'VENTILATE' : 'OPTIMAL', 124, 248);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getMonitorScreenTexture(side: 'left' | 'right'): THREE.CanvasTexture {
  const key = `monitor_screen_${side}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  // Dark slate IDE / BMS UI background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 512, 288);

  // Top window bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 512, 24);
  ['#EF4444', '#F59E0B', '#10B981'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(16 + i * 14, 12, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  if (side === 'left') {
    // BMS Telemetry Charts
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(16, 38, 140, 234);
    ctx.fillRect(170, 38, 326, 110);
    ctx.fillRect(170, 162, 156, 110);
    ctx.fillRect(340, 162, 156, 110);

    // Trend line
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(186, 120);
    [100, 88, 95, 72, 64, 78, 56, 62].forEach((y, idx) => {
      ctx.lineTo(186 + (idx + 1) * 35, y);
    });
    ctx.stroke();

    // Donut gauge on bottom left card
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(248, 216, 32, 0, Math.PI * 1.65);
    ctx.stroke();

    // Bar chart on bottom right card
    [45, 68, 52, 80, 62, 74].forEach((h, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#0EA5E9' : '#6366F1';
      ctx.fillRect(358 + idx * 20, 254 - h, 12, h);
    });
  } else {
    // 3D CAD / Code view
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(16, 38, 480, 234);

    // Simulated syntax highlighted lines
    const colors = ['#38BDF8', '#A78BFA', '#34D399', '#FBBF24', '#94A3B8'];
    for (let row = 0; row < 12; row++) {
      const y = 54 + row * 17;
      const indent = (row % 3) * 18;
      ctx.fillStyle = colors[row % colors.length];
      ctx.fillRect(32 + indent, y, 60 + ((row * 37) % 140), 7);
      ctx.fillStyle = '#475569';
      ctx.fillRect(210 + indent, y, 80 + ((row * 23) % 110), 7);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getKeypadTexture(isLocked: boolean): THREE.CanvasTexture {
  const key = `keypad_${isLocked}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, 128, 256);

  // Status banner
  ctx.fillStyle = isLocked ? '#EF4444' : '#10B981';
  ctx.fillRect(16, 16, 96, 8);

  // Backlit keypad matrix 3x4
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  keys.forEach((k, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = 30 + col * 34;
    const cy = 58 + row * 42;

    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(k, cx, cy);
  });

  // RFID reader badge icon at bottom
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 214, 52, 26);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export interface WallThemePalette {
  id:
    | 'executive_travertine'
    | 'charcoal_gallery'
    | 'warm_ochre'
    | 'mint_coral'
    | 'pastel_fiesta'
    | 'tropical_sunrise'
    | 'berry_pop';
  label: string;
  subLabel: string;
  styleType: 'architectural' | 'mural';
  baseBg: string;
  archPrimary: string;
  archSecondary: string;
  sunCircle: string;
  waveAccent: string;
  skyBlock: string;
  sideTop: string;
  sideWainscot: string;
  stripeAccent: string;
  trimColor: number;
}

export const WALL_PAINT_PALETTES: Record<WallThemePalette['id'], WallThemePalette> = {
  executive_travertine: {
    id: 'executive_travertine',
    label: 'Executive Travertine & Walnut',
    subLabel: 'Batu travertine hangat, panel kisi kayu walnut & aksen kuningan',
    styleType: 'architectural',
    baseBg: '#F4F0EA',
    archPrimary: '#5D4037',
    archSecondary: '#D6CFC5',
    sunCircle: '#C5A059',
    waveAccent: '#E6E0D6',
    skyBlock: '#EDE8DF',
    sideTop: '#F5F2EC',
    sideWainscot: '#E5DEC9',
    stripeAccent: '#C5A059',
    trimColor: 0xF5F5F4,
  },
  charcoal_gallery: {
    id: 'charcoal_gallery',
    label: 'Obsidian Gallery & Brass',
    subLabel: 'Plester Venesia antrasit elegan, alabaster hangat & garis emas',
    styleType: 'architectural',
    baseBg: '#EAE6DF',
    archPrimary: '#27272A',
    archSecondary: '#3F3F46',
    sunCircle: '#D4AF37',
    waveAccent: '#D6D3D1',
    skyBlock: '#E7E5E4',
    sideTop: '#F4F1EA',
    sideWainscot: '#27272A',
    stripeAccent: '#D4AF37',
    trimColor: 0xE4E4E7,
  },
  warm_ochre: {
    id: 'warm_ochre',
    label: 'Nordic Warm Ochre',
    subLabel: 'Krem arsitektural dengan geometri ochre & biru teal lembut',
    styleType: 'mural',
    baseBg: '#FAF6F0',
    archPrimary: '#D97706',
    archSecondary: '#5EEAD4',
    sunCircle: '#F59E0B',
    waveAccent: '#FDE68A',
    skyBlock: '#E0F2FE',
    sideTop: '#FAF7F2',
    sideWainscot: '#FEF3C7',
    stripeAccent: '#C5A059',
    trimColor: 0xF5F5F4,
  },
  mint_coral: {
    id: 'mint_coral',
    label: 'Sage Mint & Terracotta',
    subLabel: 'Hijau sage tenang berpadu terakota lembut & emas pasir',
    styleType: 'mural',
    baseBg: '#F8FAF7',
    archPrimary: '#6EE7B7',
    archSecondary: '#FDA4AF',
    sunCircle: '#FCD34D',
    waveAccent: '#99F6E4',
    skyBlock: '#FEF3C7',
    sideTop: '#F9FBF9',
    sideWainscot: '#D1FAE5',
    stripeAccent: '#FDA4AF',
    trimColor: 0xECFDF5,
  },
  pastel_fiesta: {
    id: 'pastel_fiesta',
    label: 'Pastel Fiesta Mural',
    subLabel: 'Mural lengkung koral, kuning mentari, mint & biru langit',
    styleType: 'mural',
    baseBg: '#FFFBF5',
    archPrimary: '#FF9E8A',
    archSecondary: '#A7F3D0',
    sunCircle: '#FDE047',
    waveAccent: '#BAE6FD',
    skyBlock: '#DDD6FE',
    sideTop: '#FFFDF9',
    sideWainscot: '#DCFCE7',
    stripeAccent: '#FF9E8A',
    trimColor: 0xF1F5F9,
  },
  tropical_sunrise: {
    id: 'tropical_sunrise',
    label: 'Tropical Sunrise',
    subLabel: 'Nuansa hangat kuning amber, koral persik & merah muda',
    styleType: 'mural',
    baseBg: '#FFFBEB',
    archPrimary: '#FB923C',
    archSecondary: '#FDE047',
    sunCircle: '#F43F5E',
    waveAccent: '#FDBA74',
    skyBlock: '#FECDD3',
    sideTop: '#FFFBEB',
    sideWainscot: '#FFEDD5',
    stripeAccent: '#FB7185',
    trimColor: 0xFEF3C7,
  },
  berry_pop: {
    id: 'berry_pop',
    label: 'Berry & Lavender Studio',
    subLabel: 'Ungu lilac ceria, merah muda ceri & biru periwinkle',
    styleType: 'mural',
    baseBg: '#FDFCFE',
    archPrimary: '#C084FC',
    archSecondary: '#F472B6',
    sunCircle: '#FACC15',
    waveAccent: '#A5B4FC',
    skyBlock: '#FBCFE8',
    sideTop: '#FDFBFF',
    sideWainscot: '#F3E8FF',
    stripeAccent: '#F472B6',
    trimColor: 0xF5F3FF,
  },
};

export function getWallBumpTexture(): THREE.CanvasTexture {
  const key = 'wall_roller_bump';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 3200; i++) {
    const x = (i * 97) % 256;
    const y = (i * 151) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)';
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 3);
  textureCache.set(key, tex);
  return tex;
}

export function getWallAccentMuralTexture(
  themeId: WallThemePalette['id'] = 'executive_travertine'
): THREE.CanvasTexture {
  const key = `wall_mural_v2_${themeId}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const pal = WALL_PAINT_PALETTES[themeId] || WALL_PAINT_PALETTES.executive_travertine;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Base coat
  ctx.fillStyle = pal.baseBg;
  ctx.fillRect(0, 0, 1024, 512);

  if (pal.styleType === 'architectural') {
    // Luxury Venetian Plaster & Honed Travertine Block Pattern
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, pal.baseBg);
    grad.addColorStop(0.5, pal.skyBlock);
    grad.addColorStop(1, pal.waveAccent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle large-scale architectural stone panel joints
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.18)';
    ctx.lineWidth = 2;
    [170, 340, 684, 854].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    });
    [160, 350].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    });

    // Left, Center & Right Vertical Fluted Walnut / Dark Slate Acoustic Slat Zones
    const drawFlutedPanel = (xStart: number, width: number) => {
      // Dark acoustic felt backing
      ctx.fillStyle = '#18181B';
      ctx.fillRect(xStart, 24, width, 464);

      // Vertical wood/slat ribs
      const slatCount = Math.floor(width / 10);
      for (let s = 0; s < slatCount; s++) {
        const sx = xStart + 3 + s * 10;
        ctx.fillStyle = s % 2 === 0 ? pal.archPrimary : '#4E342E';
        ctx.fillRect(sx, 26, 6, 460);
        // Specular wood highlight edge
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(sx, 26, 1.5, 460);
      }

      // Brushed champagne brass perimeter frame
      ctx.strokeStyle = pal.sunCircle;
      ctx.lineWidth = 3;
      ctx.strokeRect(xStart, 24, width, 464);
    };

    // Fluted acoustic panels on left, center-flanks, and right
    drawFlutedPanel(20, 108);
    drawFlutedPanel(396, 56);
    drawFlutedPanel(572, 56);
    drawFlutedPanel(896, 108);

    // Central Minimalist Architectural Relief Arch / Brass Inlay Feature on Center Pillar
    ctx.fillStyle = pal.archSecondary;
    ctx.fillRect(458, 90, 108, 340);

    ctx.strokeStyle = pal.sunCircle;
    ctx.lineWidth = 3;
    ctx.strokeRect(464, 96, 96, 328);

    // Subtle geometric brass circle & vertical line motif in center column
    ctx.strokeStyle = pal.sunCircle;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(512, 235, 34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, 130);
    ctx.lineTo(512, 385);
    ctx.stroke();
  } else {
    // Cheerful Geometric Pastel Mural Style
    ctx.fillStyle = pal.skyBlock;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(360, 0);
    ctx.lineTo(220, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = pal.waveAccent;
    ctx.beginPath();
    ctx.moveTo(720, 0);
    ctx.lineTo(1024, 0);
    ctx.lineTo(1024, 512);
    ctx.lineTo(610, 512);
    ctx.closePath();
    ctx.fill();

    const drawArch = (cx: number, bottomY: number, w: number, h: number, color: string) => {
      const r = w / 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, bottomY - h + r, r, Math.PI, 0, false);
      ctx.lineTo(cx + r, bottomY);
      ctx.lineTo(cx - r, bottomY);
      ctx.closePath();
      ctx.fill();
    };

    drawArch(165, 512, 210, 380, pal.archSecondary);
    drawArch(512, 512, 250, 420, pal.archPrimary);
    drawArch(860, 512, 210, 360, pal.archSecondary);

    ctx.fillStyle = pal.sunCircle;
    ctx.beginPath();
    ctx.arc(385, 145, 74, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(385, 145, 92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = pal.sunCircle;
    ctx.beginPath();
    ctx.arc(665, 130, 54, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.archPrimary;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, 410);
    ctx.bezierCurveTo(260, 345, 420, 465, 680, 390);
    ctx.bezierCurveTo(840, 345, 940, 420, 1024, 385);
    ctx.lineTo(1024, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 292, 105, Math.PI, 0, false);
    ctx.lineTo(617, 512);
    ctx.moveTo(407, 292);
    ctx.lineTo(407, 512);
    ctx.stroke();
  }

  // Fine Venetian plaster / matte roller micro-grain
  for (let i = 0; i < 3600; i++) {
    const rx = (i * 193) % 1024;
    const ry = (i * 251) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.035)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(key, tex);
  return tex;
}

export function getWallSidePastelTexture(
  themeId: WallThemePalette['id'] = 'executive_travertine'
): THREE.CanvasTexture {
  const key = `wall_side_v2_${themeId}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const pal = WALL_PAINT_PALETTES[themeId] || WALL_PAINT_PALETTES.executive_travertine;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Upper wall tone
  ctx.fillStyle = pal.sideTop;
  ctx.fillRect(0, 0, 512, 325);

  // Lower architectural wainscot panel
  ctx.fillStyle = pal.sideWainscot;
  ctx.fillRect(0, 325, 512, 187);

  if (pal.styleType === 'architectural') {
    // Recessed architectural boiserie / wainscoting frames on lower wall
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.35)';
    ctx.lineWidth = 3;
    for (let x = 24; x < 512; x += 120) {
      ctx.strokeRect(x, 348, 96, 136);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.strokeRect(x + 3, 351, 90, 130);
    }

    // Upper minimalist gallery frame molding
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.22)';
    ctx.lineWidth = 2;
    for (let x = 24; x < 512; x += 120) {
      ctx.strokeRect(x, 42, 96, 248);
    }

    // Sleek brushed brass dado rail reveal strip
    ctx.fillStyle = pal.stripeAccent;
    ctx.fillRect(0, 320, 512, 6);
  } else {
    // Cheerful dual-color horizontal dado rail accent band
    ctx.fillStyle = pal.stripeAccent;
    ctx.fillRect(0, 315, 512, 10);

    ctx.fillStyle = pal.sunCircle;
    ctx.fillRect(0, 325, 512, 7);

    for (let x = 32; x < 512; x += 64) {
      ctx.fillStyle = pal.archPrimary;
      ctx.beginPath();
      ctx.arc(x, 315, 14, Math.PI, 0, false);
      ctx.fill();
    }
  }

  // Fine plaster grain
  for (let i = 0; i < 2000; i++) {
    const rx = (i * 131) % 512;
    const ry = (i * 197) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.03)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(2, 1);
  textureCache.set(key, tex);
  return tex;
}

export function getSoilMulchTexture(): THREE.CanvasTexture {
  const key = 'soil_mulch_bark_v1';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#241710';
  ctx.fillRect(0, 0, 256, 256);

  const chipColors = ['#3B261A', '#4E3424', '#1A110B', '#5C402E', '#2E1E14', '#6E4F3A'];
  for (let i = 0; i < 650; i++) {
    const x = (i * 73) % 256;
    const y = (i * 139) % 256;
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    const w = 5 + (i % 12);
    const h = 2 + (i % 4);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = chipColors[i % chipColors.length];
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getMonsteraLeafTexture(
  variant: 'fresh' | 'deep' | 'gloss' = 'deep'
): THREE.CanvasTexture {
  const key = `monstera_leaf_v1_${variant}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Draw cordate (heart-shaped) Monstera leaf silhouette
  // Petiole attachment notch is at (256, 435), leaf apex is at (256, 22)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(256, 430);
  // Left basal lobe (curves down then wide out)
  ctx.bezierCurveTo(215, 475, 105, 450, 72, 355);
  // Left margin curving up to apex
  ctx.bezierCurveTo(36, 250, 88, 105, 256, 20);
  // Right margin curving down from apex
  ctx.bezierCurveTo(424, 105, 476, 250, 440, 355);
  // Right basal lobe back to petiole sinus
  ctx.bezierCurveTo(407, 450, 297, 475, 256, 430);
  ctx.closePath();
  ctx.clip();

  // Base chlorophyll radial/linear gradients matching the reference Monstera foliage
  const grad = ctx.createLinearGradient(60, 40, 452, 460);
  if (variant === 'fresh') {
    grad.addColorStop(0, '#65A30D');
    grad.addColorStop(0.45, '#4D8B1A');
    grad.addColorStop(1, '#366814');
  } else if (variant === 'gloss') {
    grad.addColorStop(0, '#467D2B');
    grad.addColorStop(0.5, '#31631D');
    grad.addColorStop(1, '#224914');
  } else {
    grad.addColorStop(0, '#3D761E');
    grad.addColorStop(0.5, '#2B5B15');
    grad.addColorStop(1, '#1D420E');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle organic chlorophyll mottling & sheen variation between ribs
  const sideGrad = ctx.createRadialGradient(256, 240, 20, 256, 240, 240);
  sideGrad.addColorStop(0, 'rgba(132, 204, 22, 0.22)');
  sideGrad.addColorStop(0.65, 'rgba(77, 124, 15, 0.06)');
  sideGrad.addColorStop(1, 'rgba(20, 45, 10, 0.22)');
  ctx.fillStyle = sideGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Lateral primary veins & fine secondary venation
  const veinColor =
    variant === 'fresh' ? 'rgba(163, 230, 53, 0.55)' : 'rgba(132, 204, 22, 0.42)';
  const shadowVeinColor = 'rgba(15, 38, 8, 0.35)';

  const ribYPositions = [395, 340, 282, 224, 168, 114, 68];
  ribYPositions.forEach((ry, idx) => {
    const span = 185 - idx * 21;
    [-1, 1].forEach((dir) => {
      // Shadow under rib
      ctx.strokeStyle = shadowVeinColor;
      ctx.lineWidth = 4.5 - idx * 0.35;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(256, ry + 3);
      ctx.quadraticCurveTo(256 + dir * (span * 0.55), ry - 26, 256 + dir * span, ry - 48);
      ctx.stroke();

      // Highlighted lateral vein
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 3.2 - idx * 0.25;
      ctx.beginPath();
      ctx.moveTo(256, ry);
      ctx.quadraticCurveTo(256 + dir * (span * 0.55), ry - 28, 256 + dir * span, ry - 50);
      ctx.stroke();
    });
  });

  // Prominent central midrib tapering from petiole base (256, 435) to apex (256, 22)
  const midribGrad = ctx.createLinearGradient(256, 435, 256, 22);
  midribGrad.addColorStop(0, variant === 'fresh' ? '#84CC16' : '#65A30D');
  midribGrad.addColorStop(1, '#4D7C0F');
  ctx.strokeStyle = midribGrad;
  ctx.lineCap = 'round';
  for (let s = 0; s < 20; s++) {
    const t0 = s / 20;
    const t1 = (s + 1) / 20;
    const y0 = 432 - t0 * 408;
    const y1 = 432 - t1 * 408;
    ctx.lineWidth = 10 * (1 - t0 * 0.78);
    ctx.beginPath();
    ctx.moveTo(256, y0);
    ctx.lineTo(256, y1);
    ctx.stroke();
  }

  ctx.restore();

  // Carve authentic Monstera Deliciosa lateral fenestrations (deep splits) & oval perforations
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000000';

  const slits = [
    // [innerY, outerY, innerDistFromCenter, slitThickness]
    { innerY: 362, outerY: 328, innerX: 54, thick: 17 },
    { innerY: 306, outerY: 268, innerX: 48, thick: 20 },
    { innerY: 248, outerY: 206, innerX: 44, thick: 21 },
    { innerY: 190, outerY: 146, innerX: 40, thick: 19 },
    { innerY: 134, outerY: 92, innerX: 35, thick: 15 },
  ];

  slits.forEach(({ innerY, outerY, innerX, thick }) => {
    [-1, 1].forEach((dir) => {
      const ix = 256 + dir * innerX;
      const ox = 256 + dir * 245;
      const ctrlX = 256 + dir * 135;
      const ctrlY = (innerY + outerY) * 0.5 - 10;

      ctx.beginPath();
      ctx.arc(ix, innerY, thick * 0.46, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ix, innerY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, ox, outerY);
      ctx.stroke();
    });
  });

  // Characteristic oval secondary fenestration holes near the midrib
  const holes = [
    { x: 256 - 30, y: 278, rx: 6, ry: 10, rot: -0.35 },
    { x: 256 + 32, y: 222, rx: 6.5, ry: 11, rot: 0.35 },
    { x: 256 - 28, y: 164, rx: 5.5, ry: 9, rot: -0.3 },
    { x: 256 + 26, y: 334, rx: 5.5, ry: 8.5, rot: 0.3 },
  ];
  holes.forEach(({ x, y, rx, ry, rot }) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}



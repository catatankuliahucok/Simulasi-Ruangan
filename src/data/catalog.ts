import * as THREE from 'three';
import type { CatalogItem, DeviceState } from '../types';
import {
  createRoundedBox,
  createContactShadow,
  getWoodTexture,
  getFabricTexture,
  getServerMeshTexture,
  getAcDisplayTexture,
  getAqiDisplayTexture,
  getMonitorScreenTexture,
  getKeypadTexture,
  getRugTexture,
  getSoilMulchTexture,
  getMonsteraLeafTexture,
} from '../utils/proceduralMaterials';

export function parseColor(color: string | number): THREE.Color {
  return new THREE.Color(color);
}

// 1. SMART AC / HVAC UNIT (Wall-mounted split inverter with motorized louvers & OLED matrix)
function makeSmartAcUnit(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOn = state ? state.power : true;
  const temp = state?.targetTemp ?? 22;
  const fanSpeed = state?.fanSpeed ?? 'auto';

  // Rear mounting chassis plate
  const wallPlate = new THREE.Mesh(
    createRoundedBox(1.18, 0.32, 0.04, 0.01, 2),
    new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6, metalness: 0.2 })
  );
  wallPlate.position.set(0, 2.7, -0.12);
  g.add(wallPlate);

  // Main contoured split-unit casing
  const body = new THREE.Mesh(
    createRoundedBox(1.22, 0.34, 0.28, 0.045, 5),
    new THREE.MeshPhysicalMaterial({
      color: 0xF8FAFC,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    })
  );
  body.position.set(0, 2.7, 0.02);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Curved front glossy face panel
  const frontPanel = new THREE.Mesh(
    createRoundedBox(1.19, 0.26, 0.04, 0.02, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    })
  );
  frontPanel.position.set(0, 2.73, 0.155);
  g.add(frontPanel);

  // Accent brand trim strip along front edge
  const accentStrip = new THREE.Mesh(
    createRoundedBox(1.16, 0.012, 0.01, 0.003, 2),
    new THREE.MeshStandardMaterial({
      color: parseColor(brandColor),
      roughness: 0.25,
      metalness: 0.6,
    })
  );
  accentStrip.position.set(0, 2.61, 0.172);
  g.add(accentStrip);

  // Top intake ventilation grill slats
  const slatMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.5, metalness: 0.3 });
  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.006, 0.015), slatMat);
    slat.position.set(0, 2.875, -0.04 + i * 0.032);
    g.add(slat);
  }

  // Deep dark air discharge cavity
  const dischargeCavity = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 0.055, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.9 })
  );
  dischargeCavity.position.set(0, 2.555, 0.09);
  g.add(dischargeCavity);

  // Internal vertical directional vanes inside discharge cavity
  const vaneMat = new THREE.MeshStandardMaterial({ color: 0x27272A, roughness: 0.5 });
  for (let i = -5; i <= 5; i++) {
    const vane = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.045, 0.07), vaneMat);
    vane.position.set(i * 0.09, 2.555, 0.1);
    vane.rotation.y = isOn ? 0.2 : 0;
    g.add(vane);
  }

  // Motorized Primary & Secondary Horizontal Louver Blades
  const louverGroup = new THREE.Group();
  louverGroup.name = 'ac-louver-pivot';
  louverGroup.position.set(0, 2.555, 0.155);
  louverGroup.rotation.x = isOn ? 0.58 : -0.15;

  const primaryBlade = new THREE.Mesh(
    createRoundedBox(1.12, 0.014, 0.065, 0.004, 3),
    new THREE.MeshPhysicalMaterial({ color: 0xF1F5F9, roughness: 0.2, clearcoat: 0.4 })
  );
  louverGroup.add(primaryBlade);

  const secondaryBlade = new THREE.Mesh(
    createRoundedBox(1.08, 0.01, 0.04, 0.003, 2),
    new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.3 })
  );
  secondaryBlade.position.set(0, -0.02, -0.015);
  louverGroup.add(secondaryBlade);
  g.add(louverGroup);

  // Recessed OLED Temperature & Mode Display
  const oledScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.09),
    new THREE.MeshBasicMaterial({
      map: getAcDisplayTexture(isOn, temp, fanSpeed),
    })
  );
  oledScreen.position.set(0.38, 2.73, 0.177);
  g.add(oledScreen);

  // Glowing Status LED Ring
  const powerLed = new THREE.Mesh(
    new THREE.RingGeometry(0.01, 0.016, 24),
    new THREE.MeshBasicMaterial({
      color: isOn ? (temp <= 22 ? 0x38BDF8 : 0x10B981) : 0xEF4444,
      side: THREE.DoubleSide,
    })
  );
  powerLed.position.set(0.53, 2.73, 0.178);
  g.add(powerLed);

  return g;
}

// 2. PIR MOTION & OCCUPANCY SENSOR (Ceiling-mounted multi-segment Fresnel dome & recessed housing)
function makePirSensor(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isDetected = Boolean(state?.motionDetected);

  // Ceiling flush mounting flange
  const flange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.155, 0.015, 32),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.35, metalness: 0.15 })
  );
  flange.position.y = 3.392;
  g.add(flange);

  // Stepped cylindrical sensor body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.115, 0.045, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xF8FAFC,
      roughness: 0.22,
      clearcoat: 0.4,
    })
  );
  body.position.y = 3.365;
  g.add(body);

  // Metallic bezel trim ring around lens
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.088, 0.008, 12, 32),
    new THREE.MeshStandardMaterial({
      color: parseColor(brandColor),
      roughness: 0.25,
      metalness: 0.75,
    })
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 3.342;
  g.add(bezel);

  // Internal pyroelectric infrared element (visible through dome)
  const irCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.02, 0.035),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.2 })
  );
  irCore.position.y = 3.335;
  g.add(irCore);

  // Polycarbonate Faceted Fresnel Dome Lens (flatShading for authentic optical facets)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.082, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.12,
      metalness: 0.0,
      transmission: 0.72,
      transparent: true,
      opacity: 0.88,
      ior: 1.49,
      flatShading: true,
    })
  );
  dome.rotation.x = Math.PI;
  dome.position.y = 3.342;
  g.add(dome);

  // Dual Status & Ambient Lux Sensor LEDs
  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.011, 16, 16),
    new THREE.MeshBasicMaterial({ color: isDetected ? 0xEF4444 : 0x10B981 })
  );
  statusLed.position.set(0.098, 3.34, 0);
  g.add(statusLed);

  const luxPhotoCell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1, metalness: 0.9 })
  );
  luxPhotoCell.position.set(-0.098, 3.342, 0);
  g.add(luxPhotoCell);

  return g;
}

// 3. AIR QUALITY & TEMPERATURE/HUMIDITY STATION (Wall-mounted smart OLED panel + intake vents)
function makeAirQualitySensor(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const co2 = state?.co2 ?? 550;
  const pm25 = state?.pm25 ?? 12;
  const temp = state?.temperature ?? 23.4;
  const humidity = state?.humidity ?? 52;
  const isPoor = co2 > 1000;

  // Brushed aluminum backplate
  const backplate = new THREE.Mesh(
    createRoundedBox(0.25, 0.33, 0.018, 0.015, 3),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 })
  );
  backplate.position.set(0, 1.5, 0.01);
  g.add(backplate);

  // Main anodized dark enclosure
  const body = new THREE.Mesh(
    createRoundedBox(0.235, 0.315, 0.048, 0.02, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0x18181B,
      roughness: 0.25,
      metalness: 0.45,
      clearcoat: 0.3,
    })
  );
  body.position.set(0, 1.5, 0.036);
  body.castShadow = true;
  g.add(body);

  // Side laser-particle intake louvres
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.8 });
  for (let i = 0; i < 6; i++) {
    const lVent = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.028), ventMat);
    lVent.position.set(-0.116, 1.43 + i * 0.025, 0.036);
    g.add(lVent);

    const rVent = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.028), ventMat);
    rVent.position.set(0.116, 1.43 + i * 0.025, 0.036);
    g.add(rVent);
  }

  // Tempered glass front bezel
  const glassPanel = new THREE.Mesh(
    createRoundedBox(0.205, 0.245, 0.008, 0.01, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0x09090B,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    })
  );
  glassPanel.position.set(0, 1.515, 0.06);
  g.add(glassPanel);

  // High-resolution OLED Telemetry Canvas Screen
  const oledReadout = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 0.215),
    new THREE.MeshBasicMaterial({
      map: getAqiDisplayTexture(co2, pm25, temp, humidity),
    })
  );
  oledReadout.position.set(0, 1.515, 0.066);
  g.add(oledReadout);

  // Bottom diffused ambient AQI status lightbar
  const aqiColor = isPoor ? 0xEF4444 : co2 > 800 ? 0xF59E0B : 0x10B981;
  const lightBar = new THREE.Mesh(
    createRoundedBox(0.17, 0.014, 0.012, 0.005, 2),
    new THREE.MeshBasicMaterial({ color: aqiColor })
  );
  lightBar.position.set(0, 1.365, 0.058);
  g.add(lightBar);

  return g;
}

// 4. SMART CCTV / AI SECURITY CAMERA (360 PTZ Dome with dual-axis yoke, optical lens & IR array)
function makeSmartCctv(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOnline = state ? state.online : true;

  // Heavy-duty ceiling base plate
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.155, 0.025, 32),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.35, metalness: 0.65 })
  );
  basePlate.position.y = 3.388;
  g.add(basePlate);

  // Upper junction collar with brand ring
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.04, 32),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25, metalness: 0.2 })
  );
  collar.position.y = 3.355;
  g.add(collar);

  const brandRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.005, 12, 32),
    new THREE.MeshStandardMaterial({ color: parseColor(brandColor), metalness: 0.7, roughness: 0.2 })
  );
  brandRing.rotation.x = Math.PI / 2;
  brandRing.position.y = 3.34;
  g.add(brandRing);

  // Pan-Tilt Gimbal Yoke Assembly (named for smooth rotation in CanvasViewport)
  const gimbalGroup = new THREE.Group();
  gimbalGroup.name = 'cctv-gimbal';
  gimbalGroup.position.y = 3.25;

  // Yoke side arms
  const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.6 });
  [-0.088, 0.088].forEach((x) => {
    const arm = new THREE.Mesh(createRoundedBox(0.022, 0.14, 0.05, 0.006, 2), armMat);
    arm.position.set(x, 0.03, 0);
    gimbalGroup.add(arm);
  });

  // Spherical camera turret housing
  const turret = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xF8FAFC,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.5,
    })
  );
  turret.castShadow = true;
  gimbalGroup.add(turret);

  // Tilted Optical Lens Barrel Assembly
  const lensGroup = new THREE.Group();
  lensGroup.rotation.x = 0.42; // Pitched downward toward room center

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.052, 0.05, 24),
    new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.2, metalness: 0.85 })
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.068;
  lensGroup.add(barrel);

  // Multi-coated glass objective lens element
  const opticGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new THREE.MeshPhysicalMaterial({
      color: 0x0284C7,
      roughness: 0.02,
      metalness: 0.2,
      clearcoat: 1.0,
      iridescence: 0.8,
    })
  );
  opticGlass.rotation.x = Math.PI / 2;
  opticGlass.position.z = 0.082;
  lensGroup.add(opticGlass);

  // Ring of 8 Infrared Night-Vision LEDs around lens
  const irLedMat = new THREE.MeshBasicMaterial({
    color: isOnline ? 0xEF4444 : 0x3F3F46,
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const irLed = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), irLedMat);
    irLed.position.set(Math.cos(angle) * 0.042, Math.sin(angle) * 0.042, 0.092);
    lensGroup.add(irLed);
  }

  // Active status tally LED
  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.007, 12, 12),
    new THREE.MeshBasicMaterial({ color: isOnline ? 0x10B981 : 0x52525B })
  );
  statusLed.position.set(0, 0.058, 0.072);
  lensGroup.add(statusLed);

  gimbalGroup.add(lensGroup);
  g.add(gimbalGroup);

  // Outer Smoked Polycarbonate Protective Dome
  const outerDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.118, 32, 20, 0, Math.PI * 2, 0, Math.PI / 1.85),
    new THREE.MeshPhysicalMaterial({
      color: 0x0F172A,
      roughness: 0.06,
      metalness: 0.0,
      transparent: true,
      opacity: 0.26,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );
  outerDome.rotation.x = Math.PI;
  outerDome.position.y = 3.335;
  outerDome.renderOrder = 2;
  g.add(outerDome);

  return g;
}

// 5. SMOKE & GAS SENSOR (Ceiling photoelectric labyrinth chamber + 360 strobe ring)
function makeSmokeDetector(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isAlarm = Boolean(state?.smokeDetected || state?.alarmActive);

  // Twist-lock ceiling mounting base
  const mountBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.165, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: 0xE4E4E7, roughness: 0.4 })
  );
  mountBase.position.y = 3.39;
  g.add(mountBase);

  // Main contoured detector body
  const mainHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.125, 0.038, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xFAFAFA,
      roughness: 0.25,
      clearcoat: 0.35,
    })
  );
  mainHousing.position.y = 3.362;
  g.add(mainHousing);

  // Photoelectric labyrinth intake mesh chamber + radial fins
  const chamberCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.098, 0.092, 0.024, 24),
    new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.7, metalness: 0.4 })
  );
  chamberCore.position.y = 3.332;
  g.add(chamberCore);

  const finMat = new THREE.MeshStandardMaterial({ color: 0xD4D4D8, roughness: 0.35 });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.026, 0.032), finMat);
    fin.position.set(Math.cos(angle) * 0.095, 3.332, Math.sin(angle) * 0.095);
    fin.rotation.y = -angle;
    g.add(fin);
  }

  // Bottom protective cap with test button & piezo buzzer grille
  const bottomCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.092, 0.075, 0.012, 32),
    new THREE.MeshStandardMaterial({ color: 0xF4F4F5, roughness: 0.3 })
  );
  bottomCap.position.y = 3.314;
  g.add(bottomCap);

  // 360-degree LED Strobe Ring
  const strobeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.052, 0.006, 12, 32),
    new THREE.MeshBasicMaterial({
      color: isAlarm ? 0xEF4444 : 0x10B981,
    })
  );
  strobeRing.rotation.x = Math.PI / 2;
  strobeRing.position.y = 3.307;
  g.add(strobeRing);

  return g;
}

// 6. SMART CEILING SPOTLIGHT / DOWNLIGHT (Architectural recessed gimbal COB downlight)
function makeSmartCeilingLight(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOn = state ? state.power : true;
  const brightness = (state?.brightness ?? 85) / 100;
  const rgbColor = state?.colorRgb ? parseColor(state.colorRgb) : new THREE.Color(0xFFEAA7);

  // Outer architectural aluminum trim ring
  const outerTrim = new THREE.Mesh(
    new THREE.RingGeometry(0.13, 0.185, 32),
    new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.25,
      metalness: 0.3,
      side: THREE.DoubleSide,
    })
  );
  outerTrim.rotation.x = Math.PI / 2;
  outerTrim.position.y = 3.394;
  g.add(outerTrim);

  // Deep anti-glare black baffle cone
  const baffle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.14, 0.035, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x18181B,
      roughness: 0.6,
      metalness: 0.5,
      side: THREE.DoubleSide,
    })
  );
  baffle.position.y = 3.382;
  g.add(baffle);

  // Luminous COB Diffuser Lens
  const diffuser = new THREE.Mesh(
    new THREE.CircleGeometry(0.115, 32),
    new THREE.MeshStandardMaterial({
      color: isOn ? rgbColor : new THREE.Color(0x52525B),
      emissive: isOn ? rgbColor : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.6 + brightness * 0.9 : 0,
      roughness: 0.15,
      side: THREE.DoubleSide,
    })
  );
  diffuser.rotation.x = Math.PI / 2;
  diffuser.position.y = 3.385;
  g.add(diffuser);

  return g;
}

// 7. SMART PENDANT LIGHT (Designer spun-metal & brass luminaire via LatheGeometry)
function makeSmartPendant(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOn = state ? state.power : true;
  const brightness = (state?.brightness ?? 100) / 100;
  const lampColor = state?.colorRgb ? parseColor(state.colorRgb) : parseColor(brandColor);

  // Ceiling canopy rose
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.055, 0.035, 24),
    new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.3, metalness: 0.7 })
  );
  canopy.position.y = 3.382;
  g.add(canopy);

  // Braided suspension cord
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 1.15, 12),
    new THREE.MeshStandardMaterial({ color: 0x27272A, roughness: 0.85 })
  );
  cord.position.y = 2.82;
  g.add(cord);

  // Brushed brass neck stem above shade
  const brassStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, 0.09, 24),
    new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.22, metalness: 0.9 })
  );
  brassStem.position.y = 2.28;
  g.add(brassStem);

  // LatheGeometry contoured designer dome shade
  const shadePoints = [
    new THREE.Vector2(0.025, 0.22),
    new THREE.Vector2(0.08, 0.2),
    new THREE.Vector2(0.18, 0.14),
    new THREE.Vector2(0.26, 0.05),
    new THREE.Vector2(0.28, 0.0),
  ];
  const shadeGeom = new THREE.LatheGeometry(shadePoints, 36);

  const outerShade = new THREE.Mesh(
    shadeGeom,
    new THREE.MeshPhysicalMaterial({
      color: 0x18181B,
      roughness: 0.28,
      metalness: 0.65,
      clearcoat: 0.35,
      side: THREE.FrontSide,
    })
  );
  outerShade.position.y = 2.04;
  outerShade.castShadow = true;
  g.add(outerShade);

  // Warm gold reflective inner lining of shade
  const innerShade = new THREE.Mesh(
    shadeGeom,
    new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.25,
      metalness: 0.8,
      emissive: isOn ? lampColor : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.25 * brightness : 0,
      side: THREE.BackSide,
    })
  );
  innerShade.position.y = 2.038;
  g.add(innerShade);

  // Opal glass globe diffuser bulb
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 24, 24),
    new THREE.MeshPhysicalMaterial({
      color: isOn ? lampColor : new THREE.Color(0x94A3B8),
      emissive: isOn ? lampColor : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.9 + brightness * 0.6 : 0,
      roughness: 0.1,
      clearcoat: 0.8,
    })
  );
  bulb.position.y = 2.08;
  g.add(bulb);

  return g;
}

// 8. SMART SERVER RACK / IOT EDGE GATEWAY HUB (42U Data Center Rack with glass door, 6 blades & patch cables)
function makeSmartServerRack(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOnline = state ? state.online && state.power : true;

  // Ground contact shadow
  g.add(createContactShadow(0.86, 0.86, 0.65));

  // Heavy-duty leveling feet / casters
  const footMat = new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.5, metalness: 0.7 });
  [
    [-0.34, -0.34],
    [0.34, -0.34],
    [-0.34, 0.34],
    [0.34, 0.34],
  ].forEach(([x, z]) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16), footMat);
    foot.position.set(x, 0.025, z);
    g.add(foot);
  });

  // Main outer steel cabinet frame (open front cavity simulated by dark interior)
  const cabinet = new THREE.Mesh(
    createRoundedBox(0.82, 1.88, 0.82, 0.02, 3),
    new THREE.MeshStandardMaterial({
      color: 0x18181B,
      roughness: 0.38,
      metalness: 0.75,
    })
  );
  cabinet.position.y = 0.98;
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  g.add(cabinet);

  // Dark internal rack bay recess
  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 1.78, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.9 })
  );
  recess.position.set(0, 0.98, 0.395);
  g.add(recess);

  // Top Dual Exhaust Fan Housings
  [-0.2, 0.2].forEach((x) => {
    const fanRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0x27272A, metalness: 0.8, roughness: 0.3 })
    );
    fanRing.position.set(x, 1.925, 0);
    g.add(fanRing);
  });

  // Vertical 19-inch mounting rails
  const railMat = new THREE.MeshStandardMaterial({ color: 0x52525B, metalness: 0.85, roughness: 0.25 });
  [-0.33, 0.33].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.74, 0.02), railMat);
    rail.position.set(x, 0.98, 0.405);
    g.add(rail);
  });

  // 6 Enterprise Blade Servers / Network Switches
  const meshGrilleMat = new THREE.MeshStandardMaterial({
    map: getServerMeshTexture(),
    roughness: 0.45,
    metalness: 0.65,
  });

  for (let i = 0; i < 6; i++) {
    const yPos = 0.28 + i * 0.27;

    // Blade bezel
    const blade = new THREE.Mesh(
      createRoundedBox(0.64, 0.2, 0.05, 0.008, 2),
      meshGrilleMat
    );
    blade.position.set(0, yPos, 0.41);
    g.add(blade);

    // Hot-swap drive bay caddies on left half
    for (let b = 0; b < 4; b++) {
      const caddy = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.14, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x27272A, metalness: 0.7, roughness: 0.3 })
      );
      caddy.position.set(-0.22 + b * 0.078, yPos, 0.432);
      g.add(caddy);
    }

    // Status OLED & RJ45/SFP activity LED strip on right side
    const ledColor = isOnline ? (i === 5 ? parseColor(brandColor) : i % 2 === 0 ? 0x10B981 : 0x38BDF8) : 0x3F3F46;
    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.016, 0.01),
      new THREE.MeshBasicMaterial({ color: ledColor })
    );
    ledStrip.position.set(0.18, yPos + 0.04, 0.436);
    g.add(ledStrip);

    // Port bank block
    const portBank = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.045, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x09090B, metalness: 0.9, roughness: 0.2 })
    );
    portBank.position.set(0.18, yPos - 0.03, 0.434);
    g.add(portBank);
  }

  // Tempered Smoked Glass Front Door with Anodized Frame & Swing Handle
  const glassDoor = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 1.8, 0.014),
    new THREE.MeshPhysicalMaterial({
      color: 0x0F172A,
      roughness: 0.06,
      metalness: 0.1,
      transparent: true,
      opacity: 0.34,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );
  glassDoor.position.set(0, 0.98, 0.448);
  glassDoor.renderOrder = 2;
  g.add(glassDoor);

  const doorHandle = new THREE.Mesh(
    createRoundedBox(0.025, 0.22, 0.03, 0.006, 2),
    new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.9, roughness: 0.2 })
  );
  doorHandle.position.set(0.32, 0.98, 0.465);
  g.add(doorHandle);

  return g;
}

// 9. SMART DOOR LOCK & ACCESS CONTROL KEYPAD (Mortise Escutcheon + Touch Keypad + Biometric Lever)
function makeSmartDoorLock(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isLocked = state?.locked ?? true;

  // Brushed gunmetal mortise escutcheon body
  const escutcheon = new THREE.Mesh(
    createRoundedBox(0.11, 0.38, 0.036, 0.018, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0x18181B,
      roughness: 0.22,
      metalness: 0.85,
      clearcoat: 0.4,
    })
  );
  escutcheon.position.set(0, 1.08, 0.02);
  escutcheon.castShadow = true;
  g.add(escutcheon);

  // Chrome outer bevel accent plate
  const trimPlate = new THREE.Mesh(
    createRoundedBox(0.118, 0.39, 0.008, 0.02, 3),
    new THREE.MeshStandardMaterial({ color: 0x71717A, metalness: 0.9, roughness: 0.2 })
  );
  trimPlate.position.set(0, 1.08, 0.005);
  g.add(trimPlate);

  // Backlit capacitive touch keypad screen
  const keypadScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.086, 0.18),
    new THREE.MeshBasicMaterial({
      map: getKeypadTexture(isLocked),
    })
  );
  keypadScreen.position.set(0, 1.155, 0.039);
  g.add(keypadScreen);

  // Glowing Biometric / Lock Status Halo Ring
  const haloRing = new THREE.Mesh(
    new THREE.RingGeometry(0.022, 0.028, 32),
    new THREE.MeshBasicMaterial({
      color: isLocked ? 0xEF4444 : 0x10B981,
      side: THREE.DoubleSide,
    })
  );
  haloRing.position.set(0, 0.96, 0.04);
  g.add(haloRing);

  // Ergonomic Lever Handle Hub & Contoured Grip
  const handleSpindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.045, 24),
    new THREE.MeshStandardMaterial({ color: 0xA1A1AA, metalness: 0.92, roughness: 0.18 })
  );
  handleSpindle.rotation.x = Math.PI / 2;
  handleSpindle.position.set(0, 0.96, 0.048);
  g.add(handleSpindle);

  const leverGrip = new THREE.Mesh(
    createRoundedBox(0.145, 0.026, 0.022, 0.008, 3),
    new THREE.MeshStandardMaterial({ color: 0xD4D4D8, metalness: 0.92, roughness: 0.16 })
  );
  leverGrip.position.set(-0.055, 0.96, 0.068);
  leverGrip.castShadow = true;
  g.add(leverGrip);

  return g;
}

// 10. SMART POWER PLUG / ENERGY METER (Schuko/Universal wall socket adapter with brass ground & wattage ring)
function makeSmartPlug(brandColor: string, state?: DeviceState): THREE.Group {
  const g = new THREE.Group();
  const isOn = state ? state.power : true;

  // Wall outlet wallplate
  const wallPlate = new THREE.Mesh(
    createRoundedBox(0.12, 0.12, 0.012, 0.01, 3),
    new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.35 })
  );
  wallPlate.position.set(0, 0.35, 0.006);
  g.add(wallPlate);

  // Rounded polycarbonate smart plug body
  const plugBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.052, 0.058, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.16,
      clearcoat: 0.6,
    })
  );
  plugBody.rotation.x = Math.PI / 2;
  plugBody.position.set(0, 0.35, 0.04);
  plugBody.castShadow = true;
  g.add(plugBody);

  // Illuminated Energy Telemetry Ring
  const energyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.044, 0.004, 12, 32),
    new THREE.MeshBasicMaterial({
      color: isOn ? 0x10B981 : 0x64748B,
    })
  );
  energyRing.position.set(0, 0.35, 0.068);
  g.add(energyRing);

  // Recessed socket well & dual pin holes
  const socketWell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.008, 24),
    new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.4 })
  );
  socketWell.rotation.x = Math.PI / 2;
  socketWell.position.set(0, 0.35, 0.067);
  g.add(socketWell);

  const pinMat = new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.8 });
  [-0.012, 0.012].forEach((x) => {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.01, 12), pinMat);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(x, 0.35, 0.069);
    g.add(hole);
  });

  // Brass ground contacts
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.2 });
  [-0.028, 0.028].forEach((y) => {
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.01), brassMat);
    clip.position.set(0, 0.35 + y, 0.069);
    g.add(clip);
  });

  return g;
}

// 11. WORKSTATION DESK WITH DUAL SMART MONITORS (Oak wood top, steel frame, dual monitors, keyboard, mouse, lamp)
function makeWorkstationDesk(brandColor: string): THREE.Group {
  const g = new THREE.Group();

  g.add(createContactShadow(1.65, 0.9, 0.55));

  // Beveled natural oak desktop slab
  const woodTex = getWoodTexture('oak');
  const desktop = new THREE.Mesh(
    createRoundedBox(1.62, 0.038, 0.84, 0.012, 3),
    new THREE.MeshPhysicalMaterial({
      map: woodTex,
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.25,
    })
  );
  desktop.position.y = 0.74;
  desktop.castShadow = true;
  desktop.receiveShadow = true;
  g.add(desktop);

  // Under-desk modesty panel / cable tray
  const modestyPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.22, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.5, metalness: 0.4 })
  );
  modestyPanel.position.set(0, 0.6, -0.32);
  g.add(modestyPanel);

  // Powder-coated A-frame steel legs + chrome leveling glides
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.35, metalness: 0.75 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.15, metalness: 0.9 });

  [
    [-0.74, -0.35],
    [0.74, -0.35],
    [-0.74, 0.35],
    [0.74, 0.35],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(createRoundedBox(0.048, 0.71, 0.048, 0.008, 2), frameMat);
    leg.position.set(x, 0.365, z);
    leg.castShadow = true;
    g.add(leg);

    const glide = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.015, 16), chromeMat);
    glide.position.set(x, 0.008, z);
    g.add(glide);
  });

  // Side leg stretcher bars
  [-0.74, 0.74].forEach((x) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.68), frameMat);
    bar.position.set(x, 0.12, 0);
    g.add(bar);
  });

  // Felt dark desk mat
  const deskMat = new THREE.Mesh(
    createRoundedBox(0.88, 0.006, 0.38, 0.002, 2),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.85 })
  );
  deskMat.position.set(0, 0.761, 0.14);
  g.add(deskMat);

  // Mechanical Keyboard + Wrist Rest + Wireless Mouse
  const keyboard = new THREE.Mesh(
    createRoundedBox(0.36, 0.016, 0.13, 0.004, 2),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.2 })
  );
  keyboard.position.set(-0.06, 0.768, 0.15);
  keyboard.rotation.x = 0.06;
  g.add(keyboard);

  const mouse = new THREE.Mesh(
    createRoundedBox(0.062, 0.024, 0.105, 0.01, 3),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.25, metalness: 0.3 })
  );
  mouse.position.set(0.24, 0.768, 0.15);
  g.add(mouse);

  // Dual Articulated Monitor Arm Post
  const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.34, 20), frameMat);
  armPost.position.set(0, 0.92, -0.32);
  g.add(armPost);

  // Dual Ultra-Thin Bezel 27" Monitors angled ergonomically toward user
  [
    { x: -0.31, rotY: 0.14, side: 'left' as const },
    { x: 0.31, rotY: -0.14, side: 'right' as const },
  ].forEach(({ x, rotY, side }) => {
    const monGroup = new THREE.Group();
    monGroup.position.set(x, 1.05, -0.22);
    monGroup.rotation.y = rotY;

    // Articulated arm link
    const armLink = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.022, 0.025), frameMat);
    armLink.position.set(x > 0 ? -0.14 : 0.14, -0.02, -0.06);
    monGroup.add(armLink);

    // Monitor slim chassis
    const housing = new THREE.Mesh(
      createRoundedBox(0.58, 0.34, 0.022, 0.008, 3),
      new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.25, metalness: 0.6 })
    );
    housing.castShadow = true;
    monGroup.add(housing);

    // Active IPS Display Panel with UI texture
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(0.555, 0.315),
      new THREE.MeshBasicMaterial({
        map: getMonitorScreenTexture(side),
      })
    );
    display.position.z = 0.012;
    monGroup.add(display);

    // Brand chin indicator LED
    const led = new THREE.Mesh(
      new THREE.CircleGeometry(0.004, 12),
      new THREE.MeshBasicMaterial({ color: parseColor(brandColor) })
    );
    led.position.set(0, -0.162, 0.012);
    monGroup.add(led);

    g.add(monGroup);
  });

  // Ceramic coffee mug on coaster
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.038, 0.095, 20),
    new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.15, clearcoat: 0.8 })
  );
  mug.position.set(0.56, 0.805, 0.12);
  mug.castShadow = true;
  g.add(mug);

  // Under-desk executive 3-drawer storage pedestal on right side
  const pedestal = new THREE.Mesh(
    createRoundedBox(0.38, 0.62, 0.56, 0.012, 3),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.38, metalness: 0.45 })
  );
  pedestal.position.set(0.5, 0.34, 0.02);
  pedestal.castShadow = true;
  g.add(pedestal);

  const brassPullMat = new THREE.MeshStandardMaterial({ color: 0xC5A059, metalness: 0.9, roughness: 0.2 });
  [0.18, 0.36, 0.54].forEach((py) => {
    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.018), brassPullMat);
    pull.position.set(0.5, py, 0.305);
    g.add(pull);
  });

  // Nordic Wood & Matte Black Articulated Study Desk Lamp on left side of desk
  const deskLamp = createNordicStudyDeskLamp(0.82, true);
  deskLamp.position.set(-0.62, 0.756, -0.14);
  deskLamp.rotation.y = -0.48;
  g.add(deskLamp);

  return g;
}

// Helper: Nordic Light Wood & Matte Black Articulated Study Desk Lamp (matching reference image)
function createNordicStudyDeskLamp(
  scale = 1,
  isOn = true,
  colorHex = '#FFFBEB'
): THREE.Group {
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const woodTex = getWoodTexture('oak');
  const lightWoodMat = new THREE.MeshPhysicalMaterial({
    map: woodTex,
    color: 0xF5DEB3,
    roughness: 0.36,
    metalness: 0.02,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
  });

  const matteBlackMat = new THREE.MeshPhysicalMaterial({
    color: 0x1E1E22,
    roughness: 0.34,
    metalness: 0.55,
    clearcoat: 0.18,
    clearcoatRoughness: 0.35,
  });

  const darkHardwareMat = new THREE.MeshStandardMaterial({
    color: 0x111113,
    roughness: 0.28,
    metalness: 0.82,
  });

  const emitColor = parseColor(colorHex);

  // 1. Thick Circular Light Wood Base with softly beveled top edge
  const baseProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.088, 0.0),
    new THREE.Vector2(0.09, 0.003),
    new THREE.Vector2(0.09, 0.025),
    new THREE.Vector2(0.085, 0.029),
    new THREE.Vector2(0.0, 0.029),
  ];
  const woodBase = new THREE.Mesh(new THREE.LatheGeometry(baseProfile, 36), lightWoodMat);
  woodBase.castShadow = true;
  woodBase.receiveShadow = true;
  root.add(woodBase);

  // 2. Vertical Lower Wooden Arm (mounted off-center near the left-rear edge of the circular base)
  const postX = -0.046;
  const lowerPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0115, 0.012, 0.23, 24),
    lightWoodMat
  );
  lowerPost.position.set(postX, 0.142, 0);
  lowerPost.castShadow = true;
  lowerPost.receiveShadow = true;
  root.add(lowerPost);

  // 3. Matte Black Mechanical Elbow Hinge Joint + Wing-Nut Tension Knob
  const elbowY = 0.272;

  // Lower black metal ferrule collar gripping the top of the vertical wood post
  const lowerCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.0145, 0.026, 24),
    darkHardwareMat
  );
  lowerCollar.position.set(postX, 0.252, 0);
  root.add(lowerCollar);

  // Circular pivot hinge drum
  const hingeDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.019, 0.024, 24),
    darkHardwareMat
  );
  hingeDrum.rotation.x = Math.PI / 2;
  hingeDrum.position.set(postX, elbowY, 0);
  hingeDrum.castShadow = true;
  root.add(hingeDrum);

  // Metallic accent ring & winged thumb-screw tension knob on front of hinge
  const hingeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.014, 0.002, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0x52525B, metalness: 0.85, roughness: 0.25 })
  );
  hingeRing.position.set(postX, elbowY, 0.0125);
  root.add(hingeRing);

  const thumbScrewStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 0.012, 12),
    darkHardwareMat
  );
  thumbScrewStem.rotation.x = Math.PI / 2;
  thumbScrewStem.position.set(postX, elbowY, 0.016);
  root.add(thumbScrewStem);

  const thumbWing = new THREE.Mesh(
    createRoundedBox(0.028, 0.007, 0.005, 0.002, 2),
    darkHardwareMat
  );
  thumbWing.position.set(postX, elbowY, 0.021);
  thumbWing.rotation.z = -0.45;
  root.add(thumbWing);

  // 4. Angled Upper Wooden Arm (from elbow joint (-0.046, 0.272) to lamp neck joint (0.022, 0.388))
  const upperArmAngle = -0.53; // ~30.4 degrees forward tilt
  const upperArmGroup = new THREE.Group();
  upperArmGroup.position.set(postX, elbowY, 0);
  upperArmGroup.rotation.z = upperArmAngle;

  // Upper black metal ferrule collar at base of upper wood arm
  const upperCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0135, 0.014, 0.024, 24),
    darkHardwareMat
  );
  upperCollar.position.set(0, 0.018, 0);
  upperArmGroup.add(upperCollar);

  // Smooth natural wood upper arm rod
  const upperWoodArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0112, 0.0115, 0.125, 24),
    lightWoodMat
  );
  upperWoodArm.position.set(0, 0.076, 0);
  upperWoodArm.castShadow = true;
  upperWoodArm.receiveShadow = true;
  upperArmGroup.add(upperWoodArm);

  root.add(upperArmGroup);

  // 5. Lamp Head Assembly (Matte Black Cylindrical Neck + Light Wood Top Cap + Contoured Bell Shade)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.022, 0.388, 0);
  headGroup.rotation.z = 0.94; // Tilts shade downward at ~54 degrees toward the desk

  // Light wood top end-cap disc at rear of black cylindrical neck
  const woodCapProfile = [
    new THREE.Vector2(0.0, 0.036),
    new THREE.Vector2(0.031, 0.036),
    new THREE.Vector2(0.031, 0.048),
    new THREE.Vector2(0.027, 0.052),
    new THREE.Vector2(0.0, 0.052),
  ];
  const woodTopCap = new THREE.Mesh(new THREE.LatheGeometry(woodCapProfile, 32), lightWoodMat);
  woodTopCap.castShadow = true;
  headGroup.add(woodTopCap);

  // Matte black cylindrical lamp socket neck
  const blackNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0325, 0.0325, 0.064, 32),
    matteBlackMat
  );
  blackNeck.position.y = 0.005;
  blackNeck.castShadow = true;
  headGroup.add(blackNeck);

  // Contoured Matte Black Bell / Dome Shade via LatheGeometry
  const shadeProfile = [
    new THREE.Vector2(0.0325, -0.026),
    new THREE.Vector2(0.048, -0.038),
    new THREE.Vector2(0.068, -0.062),
    new THREE.Vector2(0.082, -0.092),
    new THREE.Vector2(0.09, -0.122),
    new THREE.Vector2(0.092, -0.136),
  ];
  const shadeGeom = new THREE.LatheGeometry(shadeProfile, 36);

  const outerShade = new THREE.Mesh(shadeGeom, matteBlackMat);
  outerShade.castShadow = true;
  outerShade.receiveShadow = true;
  headGroup.add(outerShade);

  // Bright warm-white inner reflector lining inside the bell shade
  const innerReflector = new THREE.Mesh(
    shadeGeom,
    new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.2,
      emissive: isOn ? emitColor : new THREE.Color(0x000000),
      emissiveIntensity: isOn ? 0.95 : 0,
      side: THREE.BackSide,
    })
  );
  innerReflector.scale.set(0.985, 1, 0.985);
  headGroup.add(innerReflector);

  // Glowing warm-white diffuser aperture & bulb inside the shade mouth
  const diffuserDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.088, 32),
    new THREE.MeshBasicMaterial({
      color: isOn ? 0xFFFDF7 : 0x94A3B8,
      side: THREE.DoubleSide,
    })
  );
  diffuserDisc.rotation.x = Math.PI / 2;
  diffuserDisc.position.y = -0.128;
  headGroup.add(diffuserDisc);

  const innerBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 24, 24),
    new THREE.MeshBasicMaterial({
      color: isOn ? 0xFFFFFF : 0xCBD5E1,
    })
  );
  innerBulb.position.y = -0.085;
  headGroup.add(innerBulb);

  root.add(headGroup);

  return root;
}

// 12. SMART CONFERENCE / BOARDROOM TABLE (3.2m Walnut Boat-Shaped Table + AV Touch Console + Power Bay)
function makeBoardroomTable(brandColor: string): THREE.Group {
  const g = new THREE.Group();

  g.add(createContactShadow(3.25, 1.45, 0.6));

  // Grand Woven Boucle Executive Area Rug underneath conference zone
  const areaRug = new THREE.Mesh(
    createRoundedBox(3.85, 0.012, 2.25, 0.005, 2),
    new THREE.MeshStandardMaterial({
      map: getRugTexture(),
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  areaRug.position.y = 0.009;
  areaRug.receiveShadow = true;
  g.add(areaRug);

  // Rich American Walnut Tabletop with chamfered edges
  const walnutTex = getWoodTexture('walnut');
  const tabletop = new THREE.Mesh(
    createRoundedBox(3.2, 0.055, 1.4, 0.02, 4),
    new THREE.MeshPhysicalMaterial({
      map: walnutTex,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    })
  );
  tabletop.position.y = 0.75;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  g.add(tabletop);

  // Recessed Brushed Aluminum Connectivity & Power Hatch in table center
  const avBay = new THREE.Mesh(
    createRoundedBox(1.35, 0.016, 0.24, 0.006, 2),
    new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.25, metalness: 0.85 })
  );
  avBay.position.set(0, 0.78, 0);
  g.add(avBay);

  // Glowing IoT Conference Status Light Strip
  const statusStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.22, 0.006, 0.018),
    new THREE.MeshBasicMaterial({ color: parseColor(brandColor) })
  );
  statusStrip.position.set(0, 0.79, 0);
  g.add(statusStrip);

  // Dual Omnidirectional Tabletop Boundary Microphones + Central Touch Controller
  [-0.45, 0.45].forEach((x) => {
    const micPod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, 0.018, 24),
      new THREE.MeshStandardMaterial({ color: 0x27272A, metalness: 0.7, roughness: 0.3 })
    );
    micPod.position.set(x, 0.795, 0);
    g.add(micPod);

    const micRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.042, 0.003, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x10B981 })
    );
    micRing.rotation.x = Math.PI / 2;
    micRing.position.set(x, 0.805, 0);
    g.add(micRing);
  });

  // Angled Smart Room Touch Console in middle
  const touchConsole = new THREE.Mesh(
    createRoundedBox(0.22, 0.09, 0.14, 0.01, 2),
    new THREE.MeshPhysicalMaterial({ color: 0x09090B, roughness: 0.1, clearcoat: 0.9 })
  );
  touchConsole.position.set(0, 0.81, 0.02);
  touchConsole.rotation.x = 0.35;
  g.add(touchConsole);

  // Sculptural Architectural Pedestal Columns with metallic base plates
  [-0.95, 0.95].forEach((x) => {
    const basePlate = new THREE.Mesh(
      createRoundedBox(0.42, 0.022, 0.86, 0.008, 2),
      new THREE.MeshStandardMaterial({ color: 0x3F3F46, metalness: 0.85, roughness: 0.25 })
    );
    basePlate.position.set(x, 0.012, 0);
    g.add(basePlate);

    const pillar = new THREE.Mesh(
      createRoundedBox(0.28, 0.71, 0.72, 0.03, 4),
      new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.4, metalness: 0.5 })
    );
    pillar.position.set(x, 0.37, 0);
    pillar.castShadow = true;
    g.add(pillar);
  });

  return g;
}

// 13. ERGONOMIC OFFICE CHAIR (Contoured cushion, breathable mesh back, lumbar support, 3D armrests, 5-star caster base)
function makeErgoChair(brandColor: string): THREE.Group {
  const g = new THREE.Group();

  g.add(createContactShadow(0.62, 0.62, 0.5));

  const fabricTex = getFabricTexture('#27272A');
  const cushionMat = new THREE.MeshStandardMaterial({
    map: fabricTex,
    roughness: 0.78,
    metalness: 0.05,
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.35, metalness: 0.5 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xD4D4D8, roughness: 0.15, metalness: 0.92 });

  // Contoured Waterfall Seat Cushion
  const seat = new THREE.Mesh(createRoundedBox(0.5, 0.075, 0.48, 0.028, 4), cushionMat);
  seat.position.set(0, 0.47, 0.02);
  seat.castShadow = true;
  seat.receiveShadow = true;
  g.add(seat);

  // Under-seat synchronized tilt mechanism box
  const tiltMech = new THREE.Mesh(createRoundedBox(0.22, 0.06, 0.24, 0.01, 2), frameMat);
  tiltMech.position.set(0, 0.41, 0);
  g.add(tiltMech);

  // Breathable Mesh Backrest with outer perimeter frame + lumbar pad + headrest
  const backSpine = new THREE.Mesh(createRoundedBox(0.055, 0.52, 0.04, 0.01, 2), frameMat);
  backSpine.position.set(0, 0.68, -0.23);
  backSpine.rotation.x = -0.08;
  g.add(backSpine);

  const backrest = new THREE.Mesh(
    createRoundedBox(0.46, 0.54, 0.045, 0.022, 4),
    new THREE.MeshStandardMaterial({
      map: fabricTex,
      color: 0x3F3F46,
      roughness: 0.65,
    })
  );
  backrest.position.set(0, 0.77, -0.21);
  backrest.rotation.x = -0.08;
  backrest.castShadow = true;
  g.add(backrest);

  // Brand accent lumbar support bar
  const lumbar = new THREE.Mesh(
    createRoundedBox(0.42, 0.07, 0.03, 0.01, 2),
    new THREE.MeshStandardMaterial({ color: parseColor(brandColor), roughness: 0.4, metalness: 0.3 })
  );
  lumbar.position.set(0, 0.64, -0.22);
  g.add(lumbar);

  // Contoured headrest
  const headrest = new THREE.Mesh(createRoundedBox(0.26, 0.11, 0.05, 0.02, 3), cushionMat);
  headrest.position.set(0, 1.09, -0.22);
  headrest.rotation.x = 0.12;
  g.add(headrest);

  // 3D Adjustable Armrests (L-brackets + soft PU pads)
  [-0.27, 0.27].forEach((x) => {
    const post = new THREE.Mesh(createRoundedBox(0.03, 0.22, 0.04, 0.008, 2), frameMat);
    post.position.set(x, 0.56, -0.02);
    g.add(post);

    const pad = new THREE.Mesh(createRoundedBox(0.075, 0.025, 0.24, 0.008, 3), frameMat);
    pad.position.set(x, 0.67, 0.02);
    pad.castShadow = true;
    g.add(pad);
  });

  // Pneumatic Gas Lift Cylinder
  const gasLift = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.34, 20), chromeMat);
  gasLift.position.y = 0.23;
  g.add(gasLift);

  // 5-Star Spider Base + 5 Dual-Wheel Casters
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const armGroup = new THREE.Group();
    armGroup.rotation.y = angle;

    const legArm = new THREE.Mesh(createRoundedBox(0.038, 0.032, 0.31, 0.008, 2), chromeMat);
    legArm.position.set(0, 0.065, 0.14);
    legArm.rotation.x = 0.12;
    armGroup.add(legArm);

    const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.028, 16), frameMat);
    caster.rotation.z = Math.PI / 2;
    caster.position.set(0, 0.026, 0.28);
    armGroup.add(caster);

    g.add(armGroup);
  }

  return g;
}

// 14. MODERN SOFA / LOUNGE (3-seater modular executive sofa with plush cushions, throw pillows & oak plinth)
function makeSmartSofa(brandColor: string): THREE.Group {
  const g = new THREE.Group();

  g.add(createContactShadow(1.9, 0.92, 0.6));

  const sofaFabric = getFabricTexture('#334155');
  const upholsteryMat = new THREE.MeshStandardMaterial({
    map: sofaFabric,
    roughness: 0.82,
    metalness: 0.02,
  });

  // Solid oak base plinth + tapered metal legs
  const plinth = new THREE.Mesh(
    createRoundedBox(1.86, 0.06, 0.84, 0.015, 3),
    new THREE.MeshStandardMaterial({ map: getWoodTexture('walnut'), roughness: 0.4 })
  );
  plinth.position.y = 0.14;
  plinth.castShadow = true;
  g.add(plinth);

  const legMat = new THREE.MeshStandardMaterial({ color: 0x18181B, metalness: 0.8, roughness: 0.25 });
  [
    [-0.84, -0.35],
    [0.84, -0.35],
    [-0.84, 0.35],
    [0.84, 0.35],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.016, 0.12, 16), legMat);
    leg.position.set(x, 0.06, z);
    g.add(leg);
  });

  // 3 Individual Plush Beveled Seat Cushions + Backrest Cushions
  [-0.54, 0, 0.54].forEach((x) => {
    const seatCushion = new THREE.Mesh(
      createRoundedBox(0.52, 0.18, 0.72, 0.045, 4),
      upholsteryMat
    );
    seatCushion.position.set(x, 0.26, 0.04);
    seatCushion.castShadow = true;
    seatCushion.receiveShadow = true;
    g.add(seatCushion);

    const backCushion = new THREE.Mesh(
      createRoundedBox(0.51, 0.42, 0.2, 0.05, 4),
      upholsteryMat
    );
    backCushion.position.set(x, 0.54, -0.26);
    backCushion.rotation.x = -0.1;
    backCushion.castShadow = true;
    g.add(backCushion);
  });

  // Outer Upholstered Back Shell & Wide Track Armrests
  const backShell = new THREE.Mesh(
    createRoundedBox(1.88, 0.56, 0.14, 0.035, 4),
    upholsteryMat
  );
  backShell.position.set(0, 0.45, -0.37);
  backShell.castShadow = true;
  g.add(backShell);

  [-0.89, 0.89].forEach((x) => {
    const armrest = new THREE.Mesh(
      createRoundedBox(0.18, 0.44, 0.86, 0.045, 4),
      upholsteryMat
    );
    armrest.position.set(x, 0.39, 0);
    armrest.castShadow = true;
    g.add(armrest);
  });

  // Accent Throw Pillows in Brand Color
  const pillowMat = new THREE.MeshStandardMaterial({
    color: parseColor(brandColor),
    roughness: 0.75,
  });
  [
    { x: -0.68, rotZ: -0.25 },
    { x: 0.68, rotZ: 0.25 },
  ].forEach(({ x, rotZ }) => {
    const pillow = new THREE.Mesh(createRoundedBox(0.28, 0.28, 0.11, 0.045, 4), pillowMat);
    pillow.position.set(x, 0.46, -0.08);
    pillow.rotation.z = rotZ;
    pillow.rotation.y = x < 0 ? 0.3 : -0.3;
    pillow.castShadow = true;
    g.add(pillow);
  });

  // Woven Boucle Lounge Area Rug beneath sofa & coffee table
  const loungeRug = new THREE.Mesh(
    createRoundedBox(2.35, 0.012, 1.75, 0.005, 2),
    new THREE.MeshStandardMaterial({
      map: getRugTexture(),
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  loungeRug.position.set(0, 0.009, 0.35);
  loungeRug.receiveShadow = true;
  g.add(loungeRug);

  // Designer Low Coffee Table in front of sofa (Walnut base + Honed Travertine top + Art Book)
  const coffeeTop = new THREE.Mesh(
    createRoundedBox(1.05, 0.032, 0.52, 0.014, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0xF5F2EB,
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 0.65,
    })
  );
  coffeeTop.position.set(0, 0.34, 0.78);
  coffeeTop.castShadow = true;
  coffeeTop.receiveShadow = true;
  g.add(coffeeTop);

  const coffeeBase = new THREE.Mesh(
    createRoundedBox(0.78, 0.31, 0.36, 0.02, 3),
    new THREE.MeshStandardMaterial({ map: getWoodTexture('walnut'), roughness: 0.38 })
  );
  coffeeBase.position.set(0, 0.165, 0.78);
  coffeeBase.castShadow = true;
  g.add(coffeeBase);

  const artBook = new THREE.Mesh(
    createRoundedBox(0.26, 0.028, 0.19, 0.004, 2),
    new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4 })
  );
  artBook.position.set(-0.18, 0.37, 0.78);
  artBook.rotation.y = 0.15;
  g.add(artBook);

  const brassBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.045, 0.045, 24),
    new THREE.MeshStandardMaterial({ color: 0xC5A059, metalness: 0.88, roughness: 0.22 })
  );
  brassBowl.position.set(0.22, 0.378, 0.78);
  g.add(brassBowl);

  return g;
}

// 15. INDOOR AIR PURIFYING PLANT (Realistic Monstera Deliciosa in minimalist tapered white ceramic pot with bark mulch soil)
function createCurvedMonsteraLeafGeometry(width: number, length: number, archAmount: number): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(width, length, 14, 18);
  const pos = geom.attributes.position;

  // Shift plane so the petiole attachment point (near the bottom basal sinus) is at local origin (0, 0, 0)
  // and the leaf extends along +Y (length) and arches toward +Z
  const pivotOffsetY = length * 0.34;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const rawY = pos.getY(i) + pivotOffsetY;

    // Normalized longitudinal progress t from basal lobes (-0.16) through petiole (0) to apex (0.84)
    const t = rawY / length;
    // Normalized lateral distance from central midrib (0 at center, 1 at outer edge)
    const nx = Math.min(1, Math.abs(x) / (width * 0.5));

    // Natural parabolic arch along the midrib + gentle tip droop
    const midribArchZ = Math.sin(Math.max(0, t) * Math.PI * 0.85) * archAmount - Math.pow(Math.max(0, t), 2.3) * (archAmount * 1.15);

    // Subtle V-channel along midrib with arched lateral lobes
    const lateralCamberZ = Math.sin(nx * Math.PI * 0.75) * (width * 0.085) - nx * (width * 0.04);

    // Slight organic ripple along the fenestrated margins
    const rippleZ = Math.sin(t * Math.PI * 5) * nx * 0.008;

    pos.setXYZ(i, x, rawY, midribArchZ + lateralCamberZ + rippleZ);
  }

  geom.computeVertexNormals();
  return geom;
}

function makeIndoorPlant(): THREE.Group {
  const g = new THREE.Group();

  g.add(createContactShadow(0.52, 0.52, 0.52));

  // 1. Minimalist Tapered Matte-Satin White Ceramic Planter (matching reference photo)
  const potProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.136, 0.0),
    new THREE.Vector2(0.14, 0.012),
    new THREE.Vector2(0.168, 0.18),
    new THREE.Vector2(0.195, 0.355),
    new THREE.Vector2(0.192, 0.362),
    new THREE.Vector2(0.178, 0.362),
    new THREE.Vector2(0.175, 0.355),
    new THREE.Vector2(0.171, 0.312),
    new THREE.Vector2(0.0, 0.312),
  ];
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry(potProfile, 40),
    new THREE.MeshPhysicalMaterial({
      color: 0xFAFAFA,
      roughness: 0.32,
      metalness: 0.02,
      clearcoat: 0.18,
      clearcoatRoughness: 0.35,
    })
  );
  pot.castShadow = true;
  pot.receiveShadow = true;
  g.add(pot);

  // 2. Organic Bark Chip Mulch & Potting Soil Bed inside the white rim
  const soilMat = new THREE.MeshStandardMaterial({
    map: getSoilMulchTexture(),
    roughness: 0.92,
    metalness: 0.02,
  });
  const soilBed = new THREE.Mesh(new THREE.CylinderGeometry(0.172, 0.17, 0.018, 32), soilMat);
  soilBed.position.y = 0.312;
  soilBed.receiveShadow = true;
  g.add(soilBed);

  // 3D bark mulch chips scattered on top of the soil surface
  const chipMatDark = new THREE.MeshStandardMaterial({ color: 0x3B261A, roughness: 0.92 });
  const chipMatWarm = new THREE.MeshStandardMaterial({ color: 0x5C402E, roughness: 0.88 });
  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.2;
    const rad = 0.045 + ((i * 37) % 110) / 1000;
    const chip = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.006, 0.012),
      i % 2 === 0 ? chipMatDark : chipMatWarm
    );
    chip.position.set(Math.cos(angle) * rad, 0.321, Math.sin(angle) * rad);
    chip.rotation.set((i % 3) * 0.12, angle * 1.7, (i % 2) * 0.15);
    g.add(chip);
  }

  // 3. Monstera Deliciosa Stems (Petioles) & Fenestrated Leaves
  const stemBaseMat = new THREE.MeshPhysicalMaterial({
    color: 0x2F5E1E,
    roughness: 0.38,
    clearcoat: 0.3,
  });
  const stemFreshMat = new THREE.MeshPhysicalMaterial({
    color: 0x447A24,
    roughness: 0.35,
    clearcoat: 0.35,
  });

  const leafMaterials: Record<'fresh' | 'deep' | 'gloss', THREE.MeshPhysicalMaterial> = {
    fresh: new THREE.MeshPhysicalMaterial({
      map: getMonsteraLeafTexture('fresh'),
      alphaTest: 0.42,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.26,
      metalness: 0.02,
      clearcoat: 0.52,
      clearcoatRoughness: 0.24,
    }),
    deep: new THREE.MeshPhysicalMaterial({
      map: getMonsteraLeafTexture('deep'),
      alphaTest: 0.42,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.24,
      metalness: 0.03,
      clearcoat: 0.62,
      clearcoatRoughness: 0.2,
    }),
    gloss: new THREE.MeshPhysicalMaterial({
      map: getMonsteraLeafTexture('gloss'),
      alphaTest: 0.42,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.04,
      clearcoat: 0.72,
      clearcoatRoughness: 0.16,
    }),
  };

  // 9 curated Monstera stems & leaves arranged in a lush 3D architectural bouquet matching the reference image
  const foliageSpecs: Array<{
    baseX: number;
    baseZ: number;
    midX: number;
    midY: number;
    midZ: number;
    tipX: number;
    tipY: number;
    tipZ: number;
    leafW: number;
    leafL: number;
    arch: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    variant: 'fresh' | 'deep' | 'gloss';
  }> = [
    // Tall upper-right hero leaf (vibrant sunlit green, arching right & forward)
    {
      baseX: 0.015,
      baseZ: -0.005,
      midX: 0.09,
      midY: 0.58,
      midZ: 0.01,
      tipX: 0.17,
      tipY: 0.84,
      tipZ: 0.02,
      leafW: 0.31,
      leafL: 0.36,
      arch: 0.075,
      rotX: 0.58,
      rotY: -0.52,
      rotZ: -0.32,
      variant: 'fresh',
    },
    // Tall upper-center glossy leaf (catching studio light sheen)
    {
      baseX: -0.008,
      baseZ: -0.018,
      midX: -0.03,
      midY: 0.6,
      midZ: -0.05,
      tipX: -0.05,
      tipY: 0.86,
      tipZ: -0.08,
      leafW: 0.3,
      leafL: 0.35,
      arch: 0.07,
      rotX: 0.52,
      rotY: 0.18,
      rotZ: 0.14,
      variant: 'gloss',
    },
    // Upper-left sweeping leaf (bright lime-green, arching out to the left)
    {
      baseX: -0.02,
      baseZ: 0.005,
      midX: -0.11,
      midY: 0.56,
      midZ: 0.03,
      tipX: -0.22,
      tipY: 0.78,
      tipZ: 0.06,
      leafW: 0.29,
      leafL: 0.34,
      arch: 0.08,
      rotX: 0.68,
      rotY: 0.72,
      rotZ: 0.38,
      variant: 'fresh',
    },
    // Mid-right layered leaf (deep emerald, facing forward-right)
    {
      baseX: 0.022,
      baseZ: 0.012,
      midX: 0.08,
      midY: 0.5,
      midZ: 0.06,
      tipX: 0.15,
      tipY: 0.68,
      tipZ: 0.11,
      leafW: 0.28,
      leafL: 0.32,
      arch: 0.07,
      rotX: 0.78,
      rotY: -0.35,
      rotZ: -0.18,
      variant: 'deep',
    },
    // Center-front prominent horizontal leaf
    {
      baseX: -0.005,
      baseZ: 0.022,
      midX: -0.02,
      midY: 0.46,
      midZ: 0.09,
      tipX: -0.04,
      tipY: 0.58,
      tipZ: 0.16,
      leafW: 0.27,
      leafL: 0.31,
      arch: 0.065,
      rotX: 0.95,
      rotY: 0.12,
      rotZ: 0.08,
      variant: 'fresh',
    },
    // Mid-left glossy leaf (angled left & slightly back)
    {
      baseX: -0.022,
      baseZ: -0.01,
      midX: -0.1,
      midY: 0.47,
      midZ: -0.04,
      tipX: -0.18,
      tipY: 0.61,
      tipZ: -0.07,
      leafW: 0.26,
      leafL: 0.3,
      arch: 0.065,
      rotX: 0.82,
      rotY: 1.15,
      rotZ: 0.22,
      variant: 'gloss',
    },
    // Mid-back leaf (giving 360-degree fullness when orbiting the room)
    {
      baseX: 0.008,
      baseZ: -0.022,
      midX: 0.03,
      midY: 0.52,
      midZ: -0.09,
      tipX: 0.05,
      tipY: 0.71,
      tipZ: -0.16,
      leafW: 0.28,
      leafL: 0.32,
      arch: 0.07,
      rotX: 0.75,
      rotY: Math.PI - 0.25,
      rotZ: -0.1,
      variant: 'deep',
    },
    // Lower-right graceful arching leaf
    {
      baseX: 0.024,
      baseZ: -0.004,
      midX: 0.12,
      midY: 0.44,
      midZ: -0.02,
      tipX: 0.23,
      tipY: 0.56,
      tipZ: -0.03,
      leafW: 0.23,
      leafL: 0.27,
      arch: 0.06,
      rotX: 0.92,
      rotY: -1.1,
      rotZ: -0.25,
      variant: 'fresh',
    },
    // Lower-front compact juvenile leaf near the crown
    {
      baseX: 0.01,
      baseZ: 0.02,
      midX: 0.04,
      midY: 0.4,
      midZ: 0.07,
      tipX: 0.06,
      tipY: 0.48,
      tipZ: 0.12,
      leafW: 0.2,
      leafL: 0.23,
      arch: 0.045,
      rotX: 0.88,
      rotY: -0.22,
      rotZ: -0.12,
      variant: 'deep',
    },
  ];

  foliageSpecs.forEach((spec, idx) => {
    // Smooth curved petiole stem from central crown in soil to leaf base
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(spec.baseX, 0.305, spec.baseZ),
      new THREE.Vector3(spec.midX, spec.midY, spec.midZ),
      new THREE.Vector3(spec.tipX, spec.tipY, spec.tipZ),
    ]);

    const stemGeom = new THREE.TubeGeometry(curve, 16, 0.0085 - idx * 0.0003, 10, false);
    const stemMesh = new THREE.Mesh(
      stemGeom,
      spec.variant === 'fresh' ? stemFreshMat : stemBaseMat
    );
    stemMesh.castShadow = true;
    stemMesh.receiveShadow = true;
    g.add(stemMesh);

    // Petiole basal sheath collar at soil emergence
    const sheath = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.013, 0.09, 10),
      stemBaseMat
    );
    sheath.position.set(
      (spec.baseX + spec.midX * 0.35),
      0.345,
      (spec.baseZ + spec.midZ * 0.35)
    );
    sheath.lookAt(spec.midX, spec.midY, spec.midZ);
    sheath.rotateX(Math.PI / 2);
    g.add(sheath);

    // Sculpted 3D fenestrated Monstera leaf blade attached at the petiole tip
    const leafGroup = new THREE.Group();
    leafGroup.position.set(spec.tipX, spec.tipY, spec.tipZ);
    leafGroup.rotation.order = 'YXZ';
    leafGroup.rotation.set(spec.rotX, spec.rotY, spec.rotZ);

    const bladeGeom = createCurvedMonsteraLeafGeometry(spec.leafW, spec.leafL, spec.arch);
    const bladeMesh = new THREE.Mesh(bladeGeom, leafMaterials[spec.variant]);
    bladeMesh.castShadow = true;
    bladeMesh.receiveShadow = true;
    leafGroup.add(bladeMesh);

    g.add(leafGroup);
  });

  return g;
}

export const CATALOG: Record<string, CatalogItem> = {
  // === SENSORS ===
  air_quality_sensor: {
    id: 'air_quality_sensor',
    name: 'Sensor Kualitas Udara (AQI/CO2)',
    category: 'sensor',
    iconName: 'Wind',
    price: 650000,
    seats: 0,
    baseWatts: 3,
    dim: [0.24, 0.2],
    height: 0.32,
    isIoT: true,
    coverageRadius: 5,
    defaultState: {
      online: true,
      power: true,
      battery: 95,
      rssi: -52,
      wattage: 3.2,
      co2: 580,
      pm25: 12,
      temperature: 23.4,
      humidity: 52,
    },
    factory: (color, state) => makeAirQualitySensor(color, state),
  },
  pir_motion_sensor: {
    id: 'pir_motion_sensor',
    name: 'Sensor Gerak & Okupansi PIR',
    category: 'sensor',
    iconName: 'Radar',
    price: 320000,
    seats: 0,
    baseWatts: 1.5,
    dim: [0.2, 0.2],
    height: 0.1,
    isIoT: true,
    coverageRadius: 6,
    defaultState: {
      online: true,
      power: true,
      battery: 88,
      rssi: -60,
      wattage: 1.2,
      motionDetected: true,
      lightLux: 420,
    },
    factory: (color, state) => makePirSensor(color, state),
  },
  smoke_detector: {
    id: 'smoke_detector',
    name: 'Detektor Asap & Panas IoT',
    category: 'sensor',
    iconName: 'Flame',
    price: 450000,
    seats: 0,
    baseWatts: 2,
    dim: [0.3, 0.3],
    height: 0.1,
    isIoT: true,
    coverageRadius: 8,
    defaultState: {
      online: true,
      power: true,
      battery: 98,
      rssi: -48,
      wattage: 1.5,
      smokeDetected: false,
      temperature: 24.1,
    },
    factory: (color, state) => makeSmokeDetector(color, state),
  },

  // === CLIMATE & HVAC ===
  smart_ac_unit: {
    id: 'smart_ac_unit',
    name: 'Smart Inverter AC / HVAC',
    category: 'climate',
    iconName: 'Snowflake',
    price: 4800000,
    seats: 0,
    baseWatts: 850,
    dim: [1.2, 0.35],
    height: 0.35,
    isIoT: true,
    coverageRadius: 7,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -45,
      wattage: 720,
      targetTemp: 22,
      temperature: 22.8,
      fanSpeed: 'auto',
    },
    factory: (color, state) => makeSmartAcUnit(color, state),
  },

  // === LIGHTING ===
  smart_ceiling_light: {
    id: 'smart_ceiling_light',
    name: 'Smart Downlight CCT/RGB',
    category: 'lighting',
    iconName: 'Sun',
    price: 240000,
    seats: 0,
    baseWatts: 18,
    dim: [0.35, 0.35],
    height: 0.1,
    isIoT: true,
    coverageRadius: 4,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -55,
      wattage: 18,
      brightness: 85,
      colorRgb: '#FFEAA7',
    },
    factory: (color, state) => makeSmartCeilingLight(color, state),
  },
  smart_pendant: {
    id: 'smart_pendant',
    name: 'Lampu Gantung Cerdas IoT',
    category: 'lighting',
    iconName: 'LampFloor',
    price: 520000,
    seats: 0,
    baseWatts: 24,
    dim: [0.55, 0.55],
    height: 1.2,
    isIoT: true,
    coverageRadius: 3.5,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -50,
      wattage: 24,
      brightness: 100,
      colorRgb: '#D4AF37',
    },
    factory: (color, state) => makeSmartPendant(color, state),
  },
  smart_desk_lamp: {
    id: 'smart_desk_lamp',
    name: 'Lampu Meja Belajar Kayu & Hitam',
    category: 'lighting',
    iconName: 'LampFloor',
    price: 285000,
    seats: 0,
    baseWatts: 9,
    dim: [0.22, 0.22],
    height: 0.45,
    isIoT: true,
    coverageRadius: 2.5,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -48,
      wattage: 9,
      brightness: 95,
      colorRgb: '#FFFBEB',
    },
    factory: (_color, state) => {
      const g = new THREE.Group();
      const isOn = state ? state.power && state.online : true;
      const lamp = createNordicStudyDeskLamp(1.0, isOn, state?.colorRgb || '#FFFBEB');
      lamp.position.y = 0.756;
      g.add(lamp);
      return g;
    },
  },

  // === SECURITY & ACCESS ===
  smart_cctv: {
    id: 'smart_cctv',
    name: 'Kamera AI CCTV 360° PTZ',
    category: 'security',
    iconName: 'Camera',
    price: 1250000,
    seats: 0,
    baseWatts: 12,
    dim: [0.25, 0.25],
    height: 0.3,
    isIoT: true,
    coverageRadius: 9,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -42,
      wattage: 11.5,
      motionDetected: false,
    },
    factory: (color, state) => makeSmartCctv(color, state),
  },
  smart_door_lock: {
    id: 'smart_door_lock',
    name: 'Kunci Pintu Pintar RFID/PIN',
    category: 'security',
    iconName: 'Lock',
    price: 1850000,
    seats: 0,
    baseWatts: 4,
    dim: [0.15, 0.35],
    height: 0.35,
    isIoT: true,
    defaultState: {
      online: true,
      power: true,
      battery: 92,
      rssi: -58,
      wattage: 3.5,
      locked: true,
    },
    factory: (color, state) => makeSmartDoorLock(color, state),
  },

  // === POWER & INFRASTRUCTURE ===
  smart_server_rack: {
    id: 'smart_server_rack',
    name: 'Server Rack & IoT Gateway Hub',
    category: 'power',
    iconName: 'Server',
    price: 18500000,
    seats: 0,
    baseWatts: 1200,
    dim: [0.8, 0.8],
    height: 1.9,
    isIoT: true,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -25,
      wattage: 1150,
      temperature: 21.2,
    },
    factory: (color, state) => makeSmartServerRack(color, state),
  },
  smart_plug: {
    id: 'smart_plug',
    name: 'Smart Socket & Energy Meter',
    category: 'power',
    iconName: 'Zap',
    price: 180000,
    seats: 0,
    baseWatts: 1.2,
    dim: [0.1, 0.1],
    height: 0.1,
    isIoT: true,
    defaultState: {
      online: true,
      power: true,
      battery: 100,
      rssi: -52,
      wattage: 65,
    },
    factory: (color, state) => makeSmartPlug(color, state),
  },

  // === FURNITURE & SPATIAL ===
  workstation: {
    id: 'workstation',
    name: 'Workstation Meja Monitor Ganda',
    category: 'furniture',
    iconName: 'Laptop',
    price: 2600000,
    seats: 1,
    baseWatts: 0,
    dim: [1.6, 0.85],
    height: 1.2,
    isIoT: false,
    factory: (color) => makeWorkstationDesk(color),
  },
  boardroom_table: {
    id: 'boardroom_table',
    name: 'Meja Rapat Konferensi Cerdas',
    category: 'furniture',
    iconName: 'Grid',
    price: 7800000,
    seats: 8,
    baseWatts: 0,
    dim: [3.2, 1.4],
    height: 0.8,
    isIoT: false,
    factory: (color) => makeBoardroomTable(color),
  },
  ergo_chair: {
    id: 'ergo_chair',
    name: 'Kursi Kerja Ergonomis',
    category: 'furniture',
    iconName: 'Armchair',
    price: 1450000,
    seats: 1,
    baseWatts: 0,
    dim: [0.55, 0.55],
    height: 0.95,
    isIoT: false,
    factory: (color) => makeErgoChair(color),
  },
  smart_sofa: {
    id: 'smart_sofa',
    name: 'Sofa Santai Eksekutif',
    category: 'furniture',
    iconName: 'Sofa',
    price: 4200000,
    seats: 3,
    baseWatts: 0,
    dim: [1.8, 0.8],
    height: 0.8,
    isIoT: false,
    factory: (color) => makeSmartSofa(color),
  },
  plant: {
    id: 'plant',
    name: 'Pot Tanaman Hias Monstera',
    category: 'furniture',
    iconName: 'Flower2',
    price: 350000,
    seats: 0,
    baseWatts: 0,
    dim: [0.45, 0.45],
    height: 0.9,
    isIoT: false,
    factory: () => makeIndoorPlant(),
  },
};

/**
 * Computes the Y-axis rotation (in radians) for a chair at `chairPos` so that its front (+Z in local space)
 * faces toward the nearest desk (`workstation`) or conference table (`boardroom_table`).
 */
export function getChairFacingRotation(
  chairPos: { x: number; z: number },
  items: Array<{ type: string; position: { x: number; z: number }; rotation?: number }>,
  fallbackRotation: number = Math.PI
): number {
  const tables = items.filter(
    (item) => item.type === 'workstation' || item.type === 'boardroom_table'
  );
  if (tables.length === 0) return fallbackRotation;

  let nearestTable = tables[0];
  let minDistSq = Infinity;

  for (const t of tables) {
    const dx = t.position.x - chairPos.x;
    const dz = t.position.z - chairPos.z;
    const dSq = dx * dx + dz * dz;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      nearestTable = t;
    }
  }

  const tRot = nearestTable.rotation || 0;
  const relX = chairPos.x - nearestTable.position.x;
  const relZ = chairPos.z - nearestTable.position.z;

  // Transform chair offset into the table's local coordinate system
  const cosR = Math.cos(-tRot);
  const sinR = Math.sin(-tRot);
  const localX = relX * cosR - relZ * sinR;
  const localZ = relX * sinR + relZ * cosR;

  // Clamp along the table's primary X spine so side chairs face straight perpendicular into the table edge
  // while head-of-table chairs at the ends face inward along the X axis
  const spineHalf = nearestTable.type === 'boardroom_table' ? 1.25 : 0.55;
  const clampedLocalX = Math.max(-spineHalf, Math.min(spineHalf, localX));

  const dirLocalX = clampedLocalX - localX;
  const dirLocalZ = 0 - localZ;

  if (Math.abs(dirLocalX) < 1e-4 && Math.abs(dirLocalZ) < 1e-4) {
    return fallbackRotation;
  }

  const localAngle = Math.atan2(dirLocalX, dirLocalZ);
  // Snap to nearest 90-degree cardinal orientation relative to the table
  const snappedLocalAngle = Math.round(localAngle / (Math.PI / 2)) * (Math.PI / 2);
  return snappedLocalAngle + tRot;
}


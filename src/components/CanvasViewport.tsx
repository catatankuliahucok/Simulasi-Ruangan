import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Plus,
  Minus,
  Home,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { ViewMode, PlacedItem, LightingConfig, OverlayMode } from '../types';
import { CATALOG, getChairFacingRotation } from '../data/catalog';
import { LightingHUD } from './LightingHUD';
import {
  createRoundedBox,
  getFloorTileTexture,
  getWallAccentMuralTexture,
  getWallSidePastelTexture,
  getWallBumpTexture,
} from '../utils/proceduralMaterials';

interface CanvasViewportProps {
  viewMode: ViewMode;
  overlayMode: OverlayMode;
  brandColor: string;
  selectedItemKey: string | null;
  placedItems: PlacedItem[];
  selectedItem: PlacedItem | null;
  onSelectItem: (item: PlacedItem | null) => void;
  lightingConfig: LightingConfig;
  onUpdateLighting: (config: Partial<LightingConfig>) => void;
  onPlaceItem: (type: string, position: { x: number; z: number }, rotation?: number) => void;
  onRotateLastItem: (angle: number) => void;
  onClearAll: () => void;
  onDeselectItem: () => void;
}

function getDeviceVisualSignature(item: PlacedItem, brandColor: string): string {
  const s = item.state;
  return [
    item.type,
    brandColor,
    s.online,
    s.power,
    s.targetTemp ?? '',
    s.fanSpeed ?? '',
    Math.round((s.co2 ?? 0) / 25),
    Math.round(s.pm25 ?? 0),
    Math.round(s.temperature ?? 0),
    Boolean(s.motionDetected),
    Boolean(s.smokeDetected),
    Boolean(s.alarmActive),
    Boolean(s.locked),
    s.brightness ?? '',
    s.colorRgb ?? '',
  ].join('|');
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  viewMode,
  overlayMode,
  brandColor,
  selectedItemKey,
  placedItems,
  selectedItem,
  onSelectItem,
  lightingConfig,
  onUpdateLighting,
  onPlaceItem,
  onRotateLastItem,
  onClearAll,
  onDeselectItem,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ghostRef = useRef<THREE.Group | null>(null);
  const floorRef = useRef<THREE.Mesh | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const sensorConesGroupRef = useRef<THREE.Group | null>(null);
  const particleGroupRef = useRef<THREE.Group | null>(null);

  // Lighting References
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ceilingSpotsGroupRef = useRef<THREE.Group | null>(null);
  const wallSconcesGroupRef = useRef<THREE.Group | null>(null);
  const accentWallMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sideWallMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const ROOM_W = 12;
  const ROOM_D = 10;
  const ROOM_H = 3.4;

  const cameraViews = {
    perspective: {
      pos: new THREE.Vector3(9.5, 8.2, 11.2),
      target: new THREE.Vector3(0, 1.1, 0),
      fov: 40,
    },
    top: {
      pos: new THREE.Vector3(0, 16.5, 0.01),
      target: new THREE.Vector3(0, 0, 0),
      fov: 36,
    },
  };

  // 1. Initialize Scene, Studio Environment & Three.js Canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEEF2F6);
    scene.fog = new THREE.Fog(0xEEF2F6, 20, 44);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(9.5, 8.2, 11.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio RoomEnvironment for metallic & glass PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 2.5;
    controls.maxDistance = 28;
    controls.target.set(0, 1.1, 0);
    controlsRef.current = controls;

    // Sensor coverage group & AC air particles
    const sensorGroup = new THREE.Group();
    scene.add(sensorGroup);
    sensorConesGroupRef.current = sensorGroup;

    const particles = new THREE.Group();
    scene.add(particles);
    particleGroupRef.current = particles;

    // 2. Base Architectural Structure (Tiled Floor, Panoramic Windows, Smart Glass Doors, Sconces)
    buildRoomArchitecture(scene);

    // 3. Setup Studio 3-Point + Architectural Lights
    setupLighting(scene);

    // 4. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate AC cool airflow streamlines
      if (particleGroupRef.current) {
        particleGroupRef.current.children.forEach((p, idx) => {
          const originX = p.userData.originX ?? p.position.x;
          const originZ = p.userData.originZ ?? -4.5;
          p.position.z += 0.038;
          p.position.y -= 0.012;
          p.position.x = originX + Math.sin(elapsedTime * 2.5 + idx) * 0.06;

          const distZ = p.position.z - originZ;
          if (distZ > 3.8 || p.position.y < 0.35) {
            p.position.z = originZ + 0.2;
            p.position.y = 2.52;
          }
        });
      }

      // Smoothly pan active CCTV PTZ gimbals
      meshMapRef.current.forEach((group) => {
        if (group.userData?.type === 'smart_cctv' && group.userData?.online !== false) {
          const gimbal = group.getObjectByName('cctv-gimbal');
          if (gimbal) {
            gimbal.rotation.y = Math.sin(elapsedTime * 0.55) * 0.52;
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Architectural Room Geometry (Porcelain Tile Floor, Framed Windows, Double Glass Doors, Sconces)
  const buildRoomArchitecture = (scene: THREE.Scene) => {
    // Architectural Foundation Slab Plinth
    const slab = new THREE.Mesh(
      createRoundedBox(ROOM_W + 0.3, 0.14, ROOM_D + 0.3, 0.02, 2),
      new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.6, metalness: 0.1 })
    );
    slab.position.y = -0.072;
    slab.receiveShadow = true;
    scene.add(slab);

    // Tiled Porcelain Floor
    const floorGeom = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
    const floorMat = new THREE.MeshPhysicalMaterial({
      map: getFloorTileTexture(),
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.18,
      clearcoatRoughness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    floorRef.current = floor;

    // Subtle Precision Grid Overlay
    const grid = new THREE.GridHelper(ROOM_W, 12, 0x38BDF8, 0xCBD5E1);
    grid.position.y = 0.004;
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMats.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.35;
      m.depthWrite = false;
    });
    scene.add(grid);

    // Architectural Cheerful & Executive Wall Materials
    const initialTheme = lightingConfig.wallTheme || 'executive_travertine';
    const bumpTex = getWallBumpTexture();

    const accentWallMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: getWallAccentMuralTexture(initialTheme),
      bumpMap: bumpTex,
      bumpScale: 0.006,
      roughness: 0.56,
      metalness: 0.02,
    });
    accentWallMatRef.current = accentWallMat;

    const sideWallMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: getWallSidePastelTexture(initialTheme),
      bumpMap: bumpTex,
      bumpScale: 0.006,
      roughness: 0.58,
      metalness: 0.02,
    });
    sideWallMatRef.current = sideWallMat;

    const mapWallSegmentUVs = (
      geom: THREE.BufferGeometry,
      centerX: number,
      centerY: number,
      centerZ: number,
      axis: 'north' | 'west'
    ) => {
      const pos = geom.attributes.position;
      const uv = geom.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const wy = centerY + pos.getY(i);
        const v = Math.max(0.01, Math.min(0.99, wy / ROOM_H));
        if (axis === 'north') {
          const wx = centerX + pos.getX(i);
          const u = Math.max(0.01, Math.min(0.99, (wx + ROOM_W / 2) / ROOM_W));
          uv.setXY(i, u, v);
        } else {
          const wz = centerZ + pos.getZ(i);
          const u = Math.max(0.01, Math.min(0.99, (wz + ROOM_D / 2) / ROOM_D));
          uv.setXY(i, u, v);
        }
      }
      uv.needsUpdate = true;
    };

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.3,
      metalness: 0.75,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.35,
      metalness: 0.08,
    });

    // === NORTH WALL (Back Wall with Cheerful Geometric Pastel Mural & Dual Panoramic Windows) ===
    const northZ = -ROOM_D / 2;

    // Bottom sill wall across full width (0 to 0.95m high)
    const northBottomGeom = new THREE.BoxGeometry(ROOM_W, 0.95, 0.18);
    mapWallSegmentUVs(northBottomGeom, 0, 0.475, northZ, 'north');
    const northBottom = new THREE.Mesh(northBottomGeom, accentWallMat);
    northBottom.position.set(0, 0.475, northZ);
    northBottom.castShadow = true;
    northBottom.receiveShadow = true;
    scene.add(northBottom);

    // Top lintel header across full width (2.35m to 3.4m high — supports wall AC at y=2.7m)
    const northTopGeom = new THREE.BoxGeometry(ROOM_W, 1.05, 0.18);
    mapWallSegmentUVs(northTopGeom, 0, 2.875, northZ, 'north');
    const northTop = new THREE.Mesh(northTopGeom, accentWallMat);
    northTop.position.set(0, 2.875, northZ);
    northTop.castShadow = true;
    northTop.receiveShadow = true;
    scene.add(northTop);

    // Left, Center, and Right Structural Pillars between windows (y=0.95 to 2.35, h=1.4m)
    [
      { x: -5.2, w: 1.6 },
      { x: 0, w: 2.8 },
      { x: 5.2, w: 1.6 },
    ].forEach(({ x, w }) => {
      const pillarGeom = new THREE.BoxGeometry(w, 1.4, 0.18);
      mapWallSegmentUVs(pillarGeom, x, 1.65, northZ, 'north');
      const pillar = new THREE.Mesh(pillarGeom, accentWallMat);
      pillar.position.set(x, 1.65, northZ);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
    });

    // Dual Architectural Double-Glazed Windows at x = -3.0 and x = +3.0 (width 2.8m, height 1.4m)
    [-3.0, 3.0].forEach((winX) => {
      const winGroup = new THREE.Group();
      winGroup.position.set(winX, 1.65, northZ);

      // Outer Aluminum Window Frame (top, bottom, left, right, center vertical mullion)
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.05, 0.2), frameMat);
      topRail.position.y = 0.675;
      winGroup.add(topRail);

      const botSill = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.06, 0.24), frameMat);
      botSill.position.y = -0.68;
      winGroup.add(botSill);

      [-1.38, 0, 1.38].forEach((mx) => {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.38, 0.19), frameMat);
        mullion.position.x = mx;
        winGroup.add(mullion);
      });

      // Double-glazed architectural glass pane
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(2.74, 1.32, 0.025),
        new THREE.MeshPhysicalMaterial({
          color: 0xBAE6FD,
          roughness: 0.05,
          metalness: 0.1,
          transparent: true,
          opacity: 0.32,
          clearcoat: 1.0,
          depthWrite: false,
        })
      );
      glassPane.renderOrder = 1;
      winGroup.add(glassPane);

      // Subtle architectural micro-louvers / venetian blind slats at top of window
      for (let s = 0; s < 4; s++) {
        const blindSlat = new THREE.Mesh(
          new THREE.BoxGeometry(2.7, 0.008, 0.035),
          new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.4 })
        );
        blindSlat.position.set(0, 0.58 - s * 0.055, 0.04);
        blindSlat.rotation.x = 0.25;
        winGroup.add(blindSlat);
      }

      scene.add(winGroup);
    });

    // === WEST WALL (Left Companion Pastel Two-Tone Wall with Double Smart Glass Entry Doors) ===
    const westX = -ROOM_W / 2;

    const westNorthGeom = new THREE.BoxGeometry(0.18, ROOM_H, 3.9);
    mapWallSegmentUVs(westNorthGeom, westX, ROOM_H / 2, -3.05, 'west');
    const westWallNorth = new THREE.Mesh(westNorthGeom, sideWallMat);
    westWallNorth.position.set(westX, ROOM_H / 2, -3.05);
    westWallNorth.castShadow = true;
    westWallNorth.receiveShadow = true;
    scene.add(westWallNorth);

    const westSouthGeom = new THREE.BoxGeometry(0.18, ROOM_H, 3.9);
    mapWallSegmentUVs(westSouthGeom, westX, ROOM_H / 2, 3.05, 'west');
    const westWallSouth = new THREE.Mesh(westSouthGeom, sideWallMat);
    westWallSouth.position.set(westX, ROOM_H / 2, 3.05);
    westWallSouth.castShadow = true;
    westWallSouth.receiveShadow = true;
    scene.add(westWallSouth);

    // Doorway Lintel Header (above 2.4m high double doors, span 2.2m)
    const westHeaderGeom = new THREE.BoxGeometry(0.18, 1.0, 2.2);
    mapWallSegmentUVs(westHeaderGeom, westX, ROOM_H - 0.5, 0, 'west');
    const westDoorHeader = new THREE.Mesh(westHeaderGeom, sideWallMat);
    westDoorHeader.position.set(westX, ROOM_H - 0.5, 0);
    westDoorHeader.castShadow = true;
    westDoorHeader.receiveShadow = true;
    scene.add(westDoorHeader);

    // Anodized Aluminum Door Frame Surround
    const doorTopFrame = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.06, 2.22), frameMat);
    doorTopFrame.position.set(westX, 2.38, 0);
    scene.add(doorTopFrame);

    [-1.08, 1.08].forEach((dz) => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.21, 2.4, 0.06), frameMat);
      jamb.position.set(westX, 1.2, dz);
      scene.add(jamb);
    });

    // Double Tempered Smart Glass Doors + Frosted Privacy Band + Stainless Steel Pull Handles
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.15,
      metalness: 0.92,
    });

    [-0.52, 0.52].forEach((leafZ, idx) => {
      const doorLeaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 2.34, 1.01),
        new THREE.MeshPhysicalMaterial({
          color: 0x7DD3FC,
          roughness: 0.06,
          metalness: 0.1,
          transparent: true,
          opacity: 0.28,
          clearcoat: 1.0,
          depthWrite: false,
        })
      );
      doorLeaf.position.set(westX, 1.17, leafZ);
      doorLeaf.renderOrder = 1;
      scene.add(doorLeaf);

      // Frosted middle privacy band
      const frostedBand = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.32, 0.98),
        new THREE.MeshStandardMaterial({
          color: 0xF1F5F9,
          roughness: 0.6,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        })
      );
      frostedBand.position.set(westX, 1.15, leafZ);
      scene.add(frostedBand);

      // Vertical tubular stainless steel pull bar
      const handleZ = idx === 0 ? -0.09 : 0.09;
      const pullBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 16), handleMat);
      pullBar.position.set(westX + 0.045, 1.12, handleZ);
      scene.add(pullBar);
    });

    // === ARCHITECTURAL BASEBOARDS, LED COVE STRIPS & 3D WALNUT SLAT PANELS ===
    const bbNorth = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, 0.09, 0.025), trimMat);
    bbNorth.position.set(0, 0.045, northZ + 0.095);
    scene.add(bbNorth);

    const bbWestA = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.09, 3.85), trimMat);
    bbWestA.position.set(westX + 0.095, 0.045, -3.05);
    scene.add(bbWestA);

    const bbWestB = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.09, 3.85), trimMat);
    bbWestB.position.set(westX + 0.095, 0.045, 3.05);
    scene.add(bbWestB);

    // Top Crown Cornice Trim + Warm Architectural LED Cove Strip
    const crownNorth = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, 0.07, 0.22), trimMat);
    crownNorth.position.set(0, ROOM_H - 0.035, northZ + 0.02);
    scene.add(crownNorth);

    const crownWest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, ROOM_D), trimMat);
    crownWest.position.set(westX + 0.02, ROOM_H - 0.035, 0);
    scene.add(crownWest);

    const coveGlowMat = new THREE.MeshBasicMaterial({ color: 0xFDE68A });
    const coveNorth = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - 0.2, 0.014, 0.02), coveGlowMat);
    coveNorth.position.set(0, ROOM_H - 0.075, northZ + 0.12);
    scene.add(coveNorth);

    const coveWest = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, ROOM_D - 0.2), coveGlowMat);
    coveWest.position.set(westX + 0.12, ROOM_H - 0.075, 0);
    scene.add(coveWest);

    // 3D Physical Fluted Walnut Acoustic Slat Wall Panels on North Flanking Pillars
    const slatWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4E342E,
      roughness: 0.35,
      metalness: 0.08,
    });
    const feltBackMat = new THREE.MeshStandardMaterial({
      color: 0x18181B,
      roughness: 0.9,
    });
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xC5A059,
      roughness: 0.22,
      metalness: 0.88,
    });

    [-5.2, 5.2].forEach((px) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(px, 1.68, northZ + 0.095);

      const backing = new THREE.Mesh(new THREE.BoxGeometry(1.18, 3.1, 0.012), feltBackMat);
      panelGroup.add(backing);

      for (let i = -9; i <= 9; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.032, 3.06, 0.024), slatWoodMat);
        slat.position.set(i * 0.058, 0, 0.012);
        slat.castShadow = true;
        panelGroup.add(slat);
      }

      // Vertical brass edge trims
      [-0.6, 0.6].forEach((bx) => {
        const bTrim = new THREE.Mesh(new THREE.BoxGeometry(0.016, 3.12, 0.028), brassTrimMat);
        bTrim.position.set(bx, 0, 0.014);
        panelGroup.add(bTrim);
      });

      scene.add(panelGroup);
    });

    // Sheer Architectural Window Drapes flanking panoramic windows
    const drapeMat = new THREE.MeshStandardMaterial({
      color: 0xFAF8F5,
      roughness: 0.75,
      transparent: true,
      opacity: 0.82,
    });
    [-4.25, -1.75, 1.75, 4.25].forEach((dx) => {
      const drapeGroup = new THREE.Group();
      drapeGroup.position.set(dx, 1.65, northZ + 0.11);
      for (let f = -2; f <= 2; f++) {
        const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 1.42, 12), drapeMat);
        fold.position.set(f * 0.032, 0, (f % 2) * 0.012);
        fold.castShadow = true;
        drapeGroup.add(fold);
      }
      scene.add(drapeGroup);
    });
  };

  // Lighting Setup (3-Point Studio Rig + Ceiling Spots + Architectural Wall Sconces)
  const setupLighting = (scene: THREE.Scene) => {
    // Ambient Fill
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.65);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    // Primary Key Light (Sun / Main Directional)
    const sun = new THREE.DirectionalLight(0xFFFBEB, 1.35);
    sun.position.set(7.5, 12.5, 8.5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 32;
    sun.shadow.camera.left = -8.5;
    sun.shadow.camera.right = 8.5;
    sun.shadow.camera.top = 8.5;
    sun.shadow.camera.bottom = -8.5;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    sunLightRef.current = sun;

    // Back/Rim Light for 3D edge separation
    const rim = new THREE.DirectionalLight(0xE0F2FE, 0.45);
    rim.position.set(-8, 6, -7);
    scene.add(rim);
    rimLightRef.current = rim;

    // Sky/Ground Hemisphere Light
    const hemi = new THREE.HemisphereLight(0xF8FAFC, 0x94A3B8, 0.55);
    scene.add(hemi);
    hemiLightRef.current = hemi;

    // Ceiling Spots Group
    const spotsGroup = new THREE.Group();
    [-3.2, 3.2].forEach((x) => {
      [-2.2, 2.2].forEach((z) => {
        const pt = new THREE.PointLight(0xFFF7ED, 0.45, 9, 1.6);
        pt.position.set(x, 3.2, z);
        spotsGroup.add(pt);
      });
    });
    scene.add(spotsGroup);
    ceilingSpotsGroupRef.current = spotsGroup;

    // Architectural Wall Sconces Group (Mounted on North & West walls)
    const sconcesGroup = new THREE.Group();
    const sconceHousingMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.3,
      metalness: 0.8,
    });
    const sconceGlowMat = new THREE.MeshBasicMaterial({ color: 0xFDE68A });

    const sconceLocations = [
      { x: -5.2, y: 2.1, z: -ROOM_D / 2 + 0.11, rotY: 0 },
      { x: 5.2, y: 2.1, z: -ROOM_D / 2 + 0.11, rotY: 0 },
      { x: -ROOM_W / 2 + 0.11, y: 2.1, z: -2.8, rotY: Math.PI / 2 },
      { x: -ROOM_W / 2 + 0.11, y: 2.1, z: 2.8, rotY: Math.PI / 2 },
    ];

    sconceLocations.forEach(({ x, y, z, rotY }) => {
      const fixture = new THREE.Group();
      fixture.position.set(x, y, z);
      fixture.rotation.y = rotY;

      const body = new THREE.Mesh(createRoundedBox(0.09, 0.22, 0.06, 0.012, 2), sconceHousingMat);
      fixture.add(body);

      const topLens = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.04), sconceGlowMat);
      topLens.rotation.x = -Math.PI / 2;
      topLens.position.y = 0.112;
      fixture.add(topLens);

      const sconceLight = new THREE.PointLight(0xFDE68A, 0.38, 4.5, 1.8);
      sconceLight.position.set(0, 0.05, 0.15);
      fixture.add(sconceLight);

      sconcesGroup.add(fixture);
    });
    scene.add(sconcesGroup);
    wallSconcesGroupRef.current = sconcesGroup;
  };

  // Synchronize LightingHUD Config with 3D Scene Lights & Atmosphere
  useEffect(() => {
    const scene = sceneRef.current;
    const ambient = ambientLightRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    const spots = ceilingSpotsGroupRef.current;
    const sconces = wallSconcesGroupRef.current;
    if (!scene || !ambient || !sun || !hemi) return;

    const presetThemes: Record<
      LightingConfig['preset'],
      { bg: number; sunColor: number; sunInt: number; ambInt: number; hemiSky: number }
    > = {
      daylight: { bg: 0xEEF2F6, sunColor: 0xFFFBEB, sunInt: 1.35, ambInt: 0.65, hemiSky: 0xF8FAFC },
      golden_hour: { bg: 0xF5EBE6, sunColor: 0xFDBA74, sunInt: 1.45, ambInt: 0.5, hemiSky: 0xFED7AA },
      evening: { bg: 0x1E293B, sunColor: 0x60A5FA, sunInt: 0.45, ambInt: 0.35, hemiSky: 0x334155 },
      studio: { bg: 0xF1F5F9, sunColor: 0xFFFFFF, sunInt: 1.55, ambInt: 0.75, hemiSky: 0xFFFFFF },
      lounge: { bg: 0x27272A, sunColor: 0xFBBF24, sunInt: 0.65, ambInt: 0.4, hemiSky: 0x52525B },
      night_eco: { bg: 0x0F172A, sunColor: 0x38BDF8, sunInt: 0.28, ambInt: 0.25, hemiSky: 0x1E293B },
    };

    const tempColors: Record<LightingConfig['colorTemp'], number> = {
      warm: 0xFDE68A,
      neutral: 0xFFFBEB,
      cool: 0xE0F2FE,
      gold: 0xFBBF24,
    };

    const p = presetThemes[lightingConfig.preset] || presetThemes.daylight;
    const mult = lightingConfig.intensity;

    scene.background = new THREE.Color(p.bg);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.setHex(p.bg);
    }

    sun.color.setHex(tempColors[lightingConfig.colorTemp] || p.sunColor);
    sun.intensity = p.sunInt * mult;
    sun.castShadow = lightingConfig.shadows;

    ambient.intensity = p.ambInt * mult;
    hemi.color.setHex(p.hemiSky);
    hemi.intensity = 0.5 * mult;

    if (spots) {
      spots.visible = lightingConfig.ceilingSpots;
      spots.children.forEach((c) => {
        if (c instanceof THREE.PointLight) {
          c.color.setHex(tempColors[lightingConfig.colorTemp]);
          c.intensity = 0.45 * mult;
        }
      });
    }

    if (sconces) {
      sconces.visible = lightingConfig.wallSconces;
    }

    // Update Wall Paint Textures when wallTheme changes
    const activeWallTheme = lightingConfig.wallTheme || 'executive_travertine';
    if (accentWallMatRef.current) {
      accentWallMatRef.current.map = getWallAccentMuralTexture(activeWallTheme);
      accentWallMatRef.current.needsUpdate = true;
    }
    if (sideWallMatRef.current) {
      sideWallMatRef.current.map = getWallSidePastelTexture(activeWallTheme);
      sideWallMatRef.current.needsUpdate = true;
    }
  }, [lightingConfig]);

  // Switch between 3D Perspective and 2D Top View
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetView = cameraViews[viewMode];
    camera.position.copy(targetView.pos);
    controls.target.copy(targetView.target);
    camera.fov = targetView.fov;
    camera.updateProjectionMatrix();

    if (viewMode === 'top') {
      controls.maxPolarAngle = 0.01;
      controls.minPolarAngle = 0.01;
      controls.enableRotate = false;
    } else {
      controls.maxPolarAngle = Math.PI / 2 - 0.03;
      controls.minPolarAngle = 0.1;
      controls.enableRotate = true;
    }
  }, [viewMode]);

  // Update Placed Devices Mesh in Three.js Scene (including live state rebuilds)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMeshMap = meshMapRef.current;

    // Remove obsolete meshes
    const placedIds = new Set(placedItems.map((p) => p.id));
    currentMeshMap.forEach((mesh, id) => {
      if (!placedIds.has(id)) {
        scene.remove(mesh);
        currentMeshMap.delete(id);
      }
    });

    // Add or update items
    placedItems.forEach((item) => {
      let group = currentMeshMap.get(item.id);
      const cat = CATALOG[item.type];
      const nextSig = getDeviceVisualSignature(item, brandColor);

      // Rebuild mesh if device state or brand color changed
      if (group && group.userData.visualSig !== nextSig && cat) {
        scene.remove(group);
        currentMeshMap.delete(item.id);
        group = undefined;
      }

      if (!group && cat) {
        group = cat.factory(brandColor, item.state);
        group.userData = {
          id: item.id,
          type: item.type,
          isIoT: item.isIoT,
          online: item.state.online,
          visualSig: nextSig,
        };
        scene.add(group);
        currentMeshMap.set(item.id, group);
      }

      if (group) {
        group.position.x = item.position.x;
        group.position.z = item.position.z;
        group.rotation.y = item.rotation || 0;
        group.userData.online = item.state.online;

        // Selection highlight ring
        const isSel = selectedItem?.id === item.id;
        const existingRing = group.getObjectByName('selection-ring');
        if (isSel && !existingRing) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.38, 0.45, 36),
            new THREE.MeshBasicMaterial({
              color: 0x0EA5E9,
              side: THREE.DoubleSide,
              polygonOffset: true,
              polygonOffsetFactor: -2,
            })
          );
          ring.name = 'selection-ring';
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.018;
          group.add(ring);
        } else if (!isSel && existingRing) {
          group.remove(existingRing);
        }
      }
    });

    // Update Airflow Particles if AC is active
    if (particleGroupRef.current) {
      const pGroup = particleGroupRef.current;
      while (pGroup.children.length > 0) {
        pGroup.remove(pGroup.children[0]);
      }

      const activeAcs = placedItems.filter((i) => i.type === 'smart_ac_unit' && i.state.power);
      if (activeAcs.length > 0) {
        activeAcs.forEach((ac) => {
          for (let i = 0; i < 18; i++) {
            const p = new THREE.Mesh(
              new THREE.CapsuleGeometry(0.012, 0.08, 4, 8),
              new THREE.MeshBasicMaterial({
                color: 0x38BDF8,
                transparent: true,
                opacity: 0.45,
              })
            );
            p.rotation.x = Math.PI / 2.4;
            const startX = ac.position.x + (i / 17 - 0.5) * 0.95;
            p.position.set(
              startX,
              2.52 - (i % 5) * 0.35,
              ac.position.z + 0.25 + (i % 6) * 0.55
            );
            p.userData = { originX: startX, originZ: ac.position.z };
            pGroup.add(p);
          }
        });
      }
    }
  }, [placedItems, selectedItem, brandColor]);

  // Update Overlays (Heatmap / Sensor Coverage)
  useEffect(() => {
    const sensorGroup = sensorConesGroupRef.current;
    if (!sensorGroup) return;

    while (sensorGroup.children.length > 0) {
      sensorGroup.remove(sensorGroup.children[0]);
    }

    if (overlayMode === 'sensor_coverage') {
      placedItems.forEach((item) => {
        if (item.category === 'sensor' || item.type === 'smart_cctv') {
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 3.2, 32, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0x0EA5E9,
              transparent: true,
              opacity: 0.14,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          );
          cone.position.set(item.position.x, 1.6, item.position.z);
          sensorGroup.add(cone);

          const circle = new THREE.Mesh(
            new THREE.RingGeometry(2.42, 2.5, 36),
            new THREE.MeshBasicMaterial({ color: 0x0EA5E9, side: THREE.DoubleSide })
          );
          circle.rotation.x = -Math.PI / 2;
          circle.position.set(item.position.x, 0.015, item.position.z);
          sensorGroup.add(circle);
        }
      });
    }

    if (overlayMode === 'heatmap_temp') {
      placedItems.forEach((item) => {
        if (item.type === 'smart_ac_unit') {
          const coolZone = new THREE.Mesh(
            new THREE.CircleGeometry(3.5, 36),
            new THREE.MeshBasicMaterial({
              color: 0x0284C7,
              transparent: true,
              opacity: 0.22,
              side: THREE.DoubleSide,
              depthWrite: false,
            })
          );
          coolZone.rotation.x = -Math.PI / 2;
          coolZone.position.set(item.position.x, 0.012, item.position.z);
          sensorGroup.add(coolZone);
        }
      });
    }
  }, [overlayMode, placedItems]);

  // Manage Ghost Placement Preview when selectedItemKey is active
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (ghostRef.current) {
      scene.remove(ghostRef.current);
      ghostRef.current = null;
    }

    if (selectedItemKey && CATALOG[selectedItemKey]) {
      const ghost = CATALOG[selectedItemKey].factory(brandColor);
      ghost.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material.clone();
          mat.transparent = true;
          mat.opacity = 0.55;
          child.material = mat;
        }
      });
      ghost.visible = false;
      scene.add(ghost);
      ghostRef.current = ghost;
    }
  }, [selectedItemKey, brandColor]);

  // Click & Move Raycaster for Placement Preview & Device Selection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!selectedItemKey || !ghostRef.current || !cameraRef.current || !floorRef.current) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const floorHits = raycaster.intersectObject(floorRef.current);
      if (floorHits.length > 0) {
        const hitPoint = floorHits[0].point;
        const snappedX = Math.max(-5.2, Math.min(5.2, Math.round(hitPoint.x * 5) / 5));
        const snappedZ = Math.max(-4.2, Math.min(4.2, Math.round(hitPoint.z * 5) / 5));
        ghostRef.current.position.set(snappedX, 0, snappedZ);
        if (selectedItemKey === 'ergo_chair') {
          ghostRef.current.rotation.y = getChairFacingRotation(
            { x: snappedX, z: snappedZ },
            placedItems,
            Math.PI
          );
        } else {
          ghostRef.current.rotation.y = 0;
        }
        ghostRef.current.visible = true;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;

      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      // If placing a new catalog item
      if (selectedItemKey) {
        if (floorRef.current) {
          const floorHits = raycaster.intersectObject(floorRef.current);
          if (floorHits.length > 0) {
            const hitPoint = floorHits[0].point;
            const snappedX = Math.round(hitPoint.x * 5) / 5;
            const snappedZ = Math.round(hitPoint.z * 5) / 5;

            const clampedX = Math.max(-5.2, Math.min(5.2, snappedX));
            const clampedZ = Math.max(-4.2, Math.min(4.2, snappedZ));

            onPlaceItem(selectedItemKey, { x: clampedX, z: clampedZ });
            return;
          }
        }
      }

      // Otherwise select clicked device
      const meshes: THREE.Object3D[] = [];
      meshMapRef.current.forEach((group) => {
        meshes.push(...group.children);
      });

      const hits = raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        let parent: THREE.Object3D | null = hits[0].object;
        while (parent && !parent.userData?.id && parent.parent) {
          parent = parent.parent;
        }

        if (parent?.userData?.id) {
          const found = placedItems.find((p) => p.id === parent?.userData.id);
          if (found) {
            onSelectItem(found);
            return;
          }
        }
      }

      // Deselect if clicked floor
      if (e.target === rendererRef.current?.domElement && !selectedItemKey) {
        onSelectItem(null);
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [selectedItemKey, placedItems, onPlaceItem, onSelectItem]);

  return (
    <div
      id="viewport-canvas-container"
      ref={containerRef}
      className="flex-1 h-full w-full relative bg-[#F1F5F9] overflow-hidden select-none"
    >
      {/* 3D Lighting HUD */}
      <LightingHUD config={lightingConfig} onChange={onUpdateLighting} brandColor={brandColor} />

      {/* Floating Canvas Quick Controls */}
      <div
        id="canvas-viewport-floating-controls"
        className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 p-1.5 rounded-2xl border border-[#E4E4E7] shadow-lg text-[#18181B]"
      >
        <button
          type="button"
          onClick={() => {
            const cam = cameraRef.current;
            if (cam) {
              cam.position.multiplyScalar(0.85);
            }
          }}
          className="w-8 h-8 rounded-xl hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
          title="Perbesar (Zoom In)"
        >
          <Plus className="w-4 h-4 text-[#71717A]" />
        </button>

        <button
          type="button"
          onClick={() => {
            const cam = cameraRef.current;
            if (cam) {
              cam.position.multiplyScalar(1.15);
            }
          }}
          className="w-8 h-8 rounded-xl hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
          title="Perkecil (Zoom Out)"
        >
          <Minus className="w-4 h-4 text-[#71717A]" />
        </button>

        <button
          type="button"
          onClick={() => onRotateLastItem(Math.PI / 4)}
          className="w-8 h-8 rounded-xl hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
          title="Putar Perangkat Terakhir (45°)"
        >
          <RotateCw className="w-4 h-4 text-[#71717A]" />
        </button>

        <button
          type="button"
          onClick={() => {
            const cam = cameraRef.current;
            const controls = controlsRef.current;
            if (cam && controls) {
              const target = cameraViews[viewMode];
              cam.position.copy(target.pos);
              controls.target.copy(target.target);
            }
          }}
          className="w-8 h-8 rounded-xl hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
          title="Reset Sudut Kamera"
        >
          <Home className="w-4 h-4 text-[#71717A]" />
        </button>

        <div className="h-px bg-[#E4E4E7] my-0.5" />

        <button
          type="button"
          onClick={onClearAll}
          className="w-8 h-8 rounded-xl hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#A1A1AA] flex items-center justify-center transition-colors"
          title="Hapus Semua Perangkat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Item Placement Banner */}
      {selectedItemKey && (
        <div
          id="item-placement-banner"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-[#18181B] text-white rounded-full text-xs font-semibold shadow-xl flex items-center gap-3 animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-[#0EA5E9]" />
          <span>Menempatkan: {CATALOG[selectedItemKey]?.name}</span>
          <button
            type="button"
            onClick={onDeselectItem}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white"
          >
            Batal (Esc)
          </button>
        </div>
      )}
    </div>
  );
};

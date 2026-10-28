import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ViewMode,
  TemplateId,
  PlacedItem,
  LightingConfig,
  SimulationScenario,
  OverlayMode,
  AutomationRule,
  AlertNotification,
  TelemetryHistoryPoint,
  DeviceState,
} from './types';
import { TEMPLATES } from './data/templates';
import { CATALOG, getChairFacingRotation } from './data/catalog';
import {
  DEFAULT_AUTOMATIONS,
  updateDeviceSimulation,
  calculateRoomSummary,
} from './utils/iotSimulation';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { CanvasViewport } from './components/CanvasViewport';
import { AutomationModal } from './components/AutomationModal';
import { CostModal } from './components/CostModal';
import { ExportModal } from './components/ExportModal';
import { Toast } from './components/Toast';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('normal');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('smart_office');
  const [brandColor, setBrandColor] = useState<string>('#0EA5E9');
  const [scenario, setScenario] = useState<SimulationScenario>('normal');
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_AUTOMATIONS);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryPoint[]>([]);

  // Modals
  const [automationModalOpen, setAutomationModalOpen] = useState<boolean>(false);
  const [costModalOpen, setCostModalOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  // 3D Lighting Engine State
  const [lightingConfig, setLightingConfig] = useState<LightingConfig>({
    preset: 'studio',
    intensity: 1.15,
    ceilingSpots: true,
    wallSconces: true,
    colorTemp: 'neutral',
    shadows: true,
    wallTheme: 'executive_travertine',
  });

  const handleUpdateLighting = useCallback((update: Partial<LightingConfig>) => {
    setLightingConfig((prev) => ({ ...prev, ...update }));
  }, []);

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<any>('info');

  const showToast = useCallback((msg: string, type: any = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    const timer = setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 1. Template Loader
  const loadTemplate = useCallback(
    (templateId: TemplateId) => {
      const tmpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

      setSelectedTemplate(templateId);
      setBrandColor(tmpl.defaultBrandColor);

      const newItems: PlacedItem[] = tmpl.items.map((item, idx) => {
        const cat = CATALOG[item.type];
        const defaultSt: DeviceState = {
          online: true,
          power: true,
          battery: 95,
          rssi: -50,
          wattage: cat?.baseWatts || 0,
          ...(cat?.defaultState || {}),
          ...(item.initialState || {}),
        };

        return {
          id: `node-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          type: item.type,
          name: cat?.name || item.type,
          category: cat?.category || 'furniture',
          price: cat?.price || 0,
          seats: cat?.seats || 0,
          isIoT: cat?.isIoT ?? false,
          position: { x: item.x, z: item.z },
          rotation: item.rotation || 0,
          state: defaultSt,
        };
      });

      const orientedItems = newItems.map((item) =>
        item.type === 'ergo_chair'
          ? { ...item, rotation: getChairFacingRotation(item.position, newItems, item.rotation) }
          : item
      );

      setPlacedItems(orientedItems);
      setSelectedItem(null);
      setSelectedItemKey(null);
      setAlerts([]);
      showToast(`Templat ${tmpl.name} dimuat ke Digital Twin`, 'success');
    },
    [showToast]
  );

  // Initial load
  useEffect(() => {
    loadTemplate('smart_office');
  }, [loadTemplate]);

  // 2. Real-time Telemetry Simulation Loop (every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (placedItems.length === 0) return;

      const { updatedItems, newAlerts, triggeredRules } = updateDeviceSimulation(
        placedItems,
        scenario,
        rules
      );

      setPlacedItems(updatedItems);

      // Keep selectedItem state in sync
      if (selectedItem) {
        const updatedSelected = updatedItems.find((i) => i.id === selectedItem.id);
        if (updatedSelected) {
          setSelectedItem(updatedSelected);
        }
      }

      // Add new alerts
      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = newAlerts.filter((a) => !existingIds.has(a.id));
          return [...fresh, ...prev].slice(0, 10);
        });

        if (newAlerts.some((a) => a.type === 'critical')) {
          showToast('PERINGATAN KRITIS: Kondisi darurat terdeteksi!', 'trash');
        }
      }

      // Track history point
      const summary = calculateRoomSummary(updatedItems);
      const timeStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setTelemetryHistory((prev) => [
        ...prev.slice(-29),
        {
          time: timeStr,
          timestamp: Date.now(),
          avgTemp: summary.avgTemp,
          avgHumidity: summary.avgHumidity,
          totalWatts: summary.totalWatts,
          co2: summary.avgCo2,
          pm25: summary.avgPm25,
          comfortIndex: summary.comfortIndex,
        },
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, [placedItems, scenario, rules, selectedItem, showToast]);

  // 3. Place Item Handler
  const handlePlaceItem = (type: string, position: { x: number; z: number }) => {
    const cat = CATALOG[type];
    if (!cat) return;

    const defaultSt: DeviceState = {
      online: true,
      power: true,
      battery: 100,
      rssi: -45,
      wattage: cat.baseWatts,
      ...(cat.defaultState || {}),
    };

    const initialRotation =
      type === 'ergo_chair' ? getChairFacingRotation(position, placedItems, Math.PI) : 0;

    const newItem: PlacedItem = {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: cat.name,
      category: cat.category,
      price: cat.price,
      seats: cat.seats,
      isIoT: cat.isIoT,
      position,
      rotation: initialRotation,
      state: defaultSt,
    };

    setPlacedItems((prev) => {
      const next = [...prev, newItem];
      if (type === 'workstation' || type === 'boardroom_table') {
        return next.map((item) =>
          item.type === 'ergo_chair'
            ? { ...item, rotation: getChairFacingRotation(item.position, next, item.rotation) }
            : item
        );
      }
      return next;
    });
    setSelectedItem(newItem);
    showToast(`Memasang ${cat.name} pada koordinat spasial`, 'hand');
  };

  // 4. Update Device State
  const handleUpdateDeviceState = (id: string, partial: Partial<DeviceState>) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            state: {
              ...item.state,
              ...partial,
              lastUpdated: Date.now(),
            },
          };
          if (selectedItem?.id === id) {
            setSelectedItem(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // 5. Rotate Last Item
  const handleRotateLastItem = (angle: number) => {
    if (placedItems.length === 0) return;
    setPlacedItems((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = {
        ...last,
        rotation: (last.rotation || 0) + angle,
      };
      return copy;
    });
    showToast('Memutar orientasi perangkat', 'rotate');
  };

  // 6. Remove Single Item
  const handleRemoveItem = (id: string) => {
    setPlacedItems((prev) => {
      const copy = prev.filter((i) => i.id !== id);
      return copy;
    });
    if (selectedItem?.id === id) setSelectedItem(null);
    showToast('Perangkat berhasil dihapus dari denah', 'trash');
  };

  // 7. Clear All
  const handleClearAll = () => {
    setPlacedItems([]);
    setSelectedItem(null);
    setSelectedItemKey(null);
    setAlerts([]);
    showToast('Semua perangkat IoT telah dibersihkan', 'trash');
  };

  // 8. Automation Rules Handlers
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddRule = (rule: AutomationRule) => {
    setRules((prev) => [rule, ...prev]);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Aturan automasi dihapus', 'trash');
  };

  const handleTestRule = (rule: AutomationRule) => {
    showToast(`Mengeksekusi aksi uji coba: ${rule.name}`, 'rotate');
    // Force execute action across relevant devices
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (!item.isIoT) return item;
        if (rule.actionType === 'set_temp' && item.type === 'smart_ac_unit') {
          return {
            ...item,
            state: { ...item.state, power: true, targetTemp: Number(rule.actionParam || 22) },
          };
        }
        if (rule.actionType === 'set_brightness' && (item.type === 'smart_ceiling_light' || item.type === 'smart_pendant')) {
          return {
            ...item,
            state: { ...item.state, power: true, brightness: Number(rule.actionParam || 100) },
          };
        }
        if (rule.actionType === 'unlock_door' && item.type === 'smart_door_lock') {
          return {
            ...item,
            state: { ...item.state, locked: false },
          };
        }
        if (rule.actionType === 'power_on') {
          return {
            ...item,
            state: { ...item.state, power: true },
          };
        }
        if (rule.actionType === 'power_off') {
          return {
            ...item,
            state: { ...item.state, power: false },
          };
        }
        return item;
      })
    );
  };

  // 9. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (selectedItemKey) setSelectedItemKey(null);
        if (selectedItem) setSelectedItem(null);
      } else if (e.key === 'v' || e.key === 'V') {
        setViewMode((v) => (v === 'perspective' ? 'top' : 'perspective'));
      } else if (e.key === 'r' || e.key === 'R') {
        setAutomationModalOpen((o) => !o);
      } else if (e.key === 'c' || e.key === 'C') {
        setCostModalOpen((o) => !o);
      } else if (e.key === 'e' || e.key === 'E') {
        setExportModalOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemKey, selectedItem]);

  const summary = calculateRoomSummary(placedItems);
  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div
      id="aura-iot-platform-root"
      className="flex flex-col h-screen w-screen bg-[#F8F9FA] text-[#18181B] overflow-hidden select-none font-sans"
    >
      {/* Top Header Navigation */}
      <TopBar
        viewMode={viewMode}
        onViewChange={setViewMode}
        overlayMode={overlayMode}
        onOverlayModeChange={(mode) => {
          setOverlayMode(mode);
          showToast(`Mode lapisan: ${mode}`, 'palette');
        }}
        scenario={scenario}
        onScenarioChange={(sc) => {
          setScenario(sc);
          showToast(`Skenario simulasi dialihkan ke: ${sc.toUpperCase()}`, 'rotate');
        }}
        summary={summary}
        selectedTemplate={selectedTemplate}
        onOpenAutomation={() => setAutomationModalOpen(true)}
        onOpenCost={() => setCostModalOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
      />

      {/* Main Studio Workspace Grid */}
      <main id="aura-iot-workspace" className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Templates & IoT Catalog */}
        <LeftPanel
          selectedTemplate={selectedTemplate}
          onSelectTemplate={loadTemplate}
          selectedItemKey={selectedItemKey}
          onSelectItemKey={(key) => {
            setSelectedItemKey(key);
            if (key) {
              showToast(`${CATALOG[key].name} dipilih — Klik di lantai untuk memasang`, 'hand');
            }
          }}
        />

        {/* Center: Interactive 3D/2D Viewport */}
        <CanvasViewport
          viewMode={viewMode}
          overlayMode={overlayMode}
          brandColor={brandColor}
          selectedItemKey={selectedItemKey}
          placedItems={placedItems}
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItem(item)}
          lightingConfig={lightingConfig}
          onUpdateLighting={handleUpdateLighting}
          onPlaceItem={handlePlaceItem}
          onRotateLastItem={handleRotateLastItem}
          onClearAll={handleClearAll}
          onDeselectItem={() => setSelectedItemKey(null)}
        />

        {/* Right Column: Live Telemetry & Control Inspector */}
        <RightPanel
          placedItems={placedItems}
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItem(item)}
          onUpdateDeviceState={handleUpdateDeviceState}
          summary={summary}
          alerts={alerts}
          onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
          onRemoveItem={handleRemoveItem}
          onClearAll={handleClearAll}
        />
      </main>

      {/* Modals & Overlays */}
      <AutomationModal
        isOpen={automationModalOpen}
        onClose={() => setAutomationModalOpen(false)}
        rules={rules}
        onToggleRule={handleToggleRule}
        onAddRule={handleAddRule}
        onDeleteRule={handleDeleteRule}
        onTestRule={handleTestRule}
        placedItems={placedItems}
        onShowToast={showToast}
      />

      <CostModal
        isOpen={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        placedItems={placedItems}
        templateId={selectedTemplate}
        summary={summary}
        onShowToast={showToast}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        placedItems={placedItems}
        templateId={selectedTemplate}
        brandColor={brandColor}
        roomArea={120}
        summary={summary}
        onShowToast={showToast}
      />

      {/* Interactive Toast Notifications */}
      {toastMsg && <Toast message={toastMsg} type={toastType} />}
    </div>
  );
}

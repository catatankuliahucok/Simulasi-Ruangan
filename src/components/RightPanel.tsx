import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  Layers,
  Thermometer,
  Wind,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Power,
  Trash2,
  Lock,
  Unlock,
  Radio,
  BatteryCharging,
  Sun,
  Snowflake,
  Volume2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { PlacedItem, RoomTelemetrySummary, DeviceState, AlertNotification } from '../types';
import { CATALOG } from '../data/catalog';

interface RightPanelProps {
  placedItems: PlacedItem[];
  selectedItem: PlacedItem | null;
  onSelectItem: (item: PlacedItem | null) => void;
  onUpdateDeviceState: (id: string, state: Partial<DeviceState>) => void;
  summary: RoomTelemetrySummary;
  alerts: AlertNotification[];
  onDismissAlert: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  placedItems,
  selectedItem,
  onSelectItem,
  onUpdateDeviceState,
  summary,
  alerts,
  onDismissAlert,
  onRemoveItem,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'control' | 'nodes'>('telemetry');

  return (
    <aside
      id="right-inspector-panel"
      className="w-full md:w-[290px] lg:w-[320px] bg-white border-l border-[#E4E4E7] flex flex-col h-full overflow-hidden select-none shrink-0"
    >
      {/* Tab Selector */}
      <div className="flex border-b border-[#E4E4E7] bg-[#F8F9FA] px-2 py-1.5 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'telemetry'
              ? 'bg-white text-[#0EA5E9] shadow-2xs border border-[#E4E4E7]'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Telemetri
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('control')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
            activeTab === 'control'
              ? 'bg-white text-[#0EA5E9] shadow-2xs border border-[#E4E4E7]'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Kontrol
          {selectedItem && (
            <span className="w-2 h-2 rounded-full bg-[#0EA5E9] absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'nodes'
              ? 'bg-white text-[#0EA5E9] shadow-2xs border border-[#E4E4E7]'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Node ({placedItems.length})
        </button>
      </div>

      {/* Tab 1: Live Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="p-4 overflow-y-auto space-y-4 flex-1 scroll-thin">
          {/* Comfort Index Meter */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BAE6FD] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0369A1] uppercase tracking-wider font-display text-[10px]">
                Indeks Kenyamanan Ruangan
              </span>
              <span className="font-mono font-black text-sm text-[#0284C7]">
                {summary.comfortIndex} / 100
              </span>
            </div>
            <div className="h-2.5 bg-white/80 rounded-full overflow-hidden border border-[#0284C7]/20">
              <div
                className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#10B981] transition-all duration-500 rounded-full"
                style={{ width: `${summary.comfortIndex}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#0369A1]">
              <span>Status: {summary.comfortIndex > 80 ? 'Optimal & Nyaman' : summary.comfortIndex > 60 ? 'Cukup Baik' : 'Perlu Penyesuaian'}</span>
              <span>{summary.onlineDeviceCount}/{summary.totalDeviceCount} Online</span>
            </div>
          </div>

          {/* Environmental Sensor Grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#71717A] font-display">
              Parameter Sensor Lingkungan
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Temperature */}
              <div className="p-2.5 rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] space-y-1">
                <div className="flex items-center justify-between text-[#71717A] text-[11px]">
                  <span>Suhu Udara</span>
                  <Thermometer className="w-3.5 h-3.5 text-[#0EA5E9]" />
                </div>
                <div className="text-base font-mono font-bold text-[#18181B]">
                  {summary.avgTemp}°C
                </div>
                <div className="text-[10px] text-[#71717A]">Target ideal: 22-24°C</div>
              </div>

              {/* Humidity */}
              <div className="p-2.5 rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] space-y-1">
                <div className="flex items-center justify-between text-[#71717A] text-[11px]">
                  <span>Kelembaban</span>
                  <Wind className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <div className="text-base font-mono font-bold text-[#18181B]">
                  {summary.avgHumidity}% RH
                </div>
                <div className="text-[10px] text-[#71717A]">Rentang: 45-60%</div>
              </div>

              {/* CO2 Concentration */}
              <div className="p-2.5 rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] space-y-1">
                <div className="flex items-center justify-between text-[#71717A] text-[11px]">
                  <span>Kadar CO₂</span>
                  <Wind
                    className={`w-3.5 h-3.5 ${
                      summary.avgCo2 > 1000 ? 'text-[#EF4444]' : 'text-[#10B981]'
                    }`}
                  />
                </div>
                <div className="text-base font-mono font-bold text-[#18181B]">
                  {summary.avgCo2} <span className="text-[10px] font-normal">ppm</span>
                </div>
                <div
                  className={`text-[10px] font-medium ${
                    summary.avgCo2 > 1000 ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}
                >
                  {summary.aqiRating}
                </div>
              </div>

              {/* Real-time Wattage */}
              <div className="p-2.5 rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] space-y-1">
                <div className="flex items-center justify-between text-[#71717A] text-[11px]">
                  <span>Daya Aktif</span>
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <div className="text-base font-mono font-bold text-[#18181B]">
                  {summary.totalWatts} W
                </div>
                <div className="text-[10px] text-[#71717A]">
                  Rp {summary.estimatedDailyCostIdr.toLocaleString('id-ID')}/hari
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.14em] uppercase text-[#71717A] font-display">
              <span>Notifikasi & Peringatan ({alerts.length})</span>
              {alerts.length > 0 && <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />}
            </div>

            {alerts.length === 0 ? (
              <div className="p-3 rounded-xl border border-[#E4E4E7] bg-[#F8F9FA] text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Semua parameter lingkungan normal
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                      alert.type === 'critical'
                        ? 'border-[#EF4444] bg-[#FEF2F2] text-[#991B1B]'
                        : 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        {alert.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-[10px] underline hover:opacity-75"
                      >
                        Abaikan
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Device Control & Inspector */}
      {activeTab === 'control' && (
        <div className="p-4 overflow-y-auto space-y-4 flex-1 scroll-thin">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#18181B]">{selectedItem.name}</h3>
                    <span className="text-[10px] font-mono text-[#0284C7] uppercase">
                      {selectedItem.category} · Node-{selectedItem.id.slice(-4)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDeviceState(selectedItem.id, { power: !selectedItem.state.power })
                    }
                    className={`p-2 rounded-xl border transition-all ${
                      selectedItem.state.power
                        ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                        : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'
                    }`}
                    title="Toggle Power"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E4E7] text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#71717A]">
                    <Radio className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span>RSSI: {selectedItem.state.rssi} dBm</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#71717A]">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Baterai: {selectedItem.state.battery}%</span>
                  </div>
                </div>
              </div>

              {/* Specific Smart AC Controls */}
              {selectedItem.type === 'smart_ac_unit' && (
                <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#18181B]">
                    <span className="flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      Pengaturan Termostat AC
                    </span>
                    <span className="font-mono text-sm font-bold text-[#0EA5E9]">
                      {selectedItem.state.targetTemp || 22}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="30"
                    step="1"
                    value={selectedItem.state.targetTemp || 22}
                    onChange={(e) =>
                      onUpdateDeviceState(selectedItem.id, { targetTemp: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#0EA5E9] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                    <span>16°C (Maks)</span>
                    <span>22°C (Eco)</span>
                    <span>30°C</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E4E4E7]">
                    <label className="text-[11px] font-medium text-[#71717A] block">Kecepatan Kipas</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['low', 'med', 'high', 'auto'] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => onUpdateDeviceState(selectedItem.id, { fanSpeed: spd })}
                          className={`py-1 text-[10px] font-semibold uppercase rounded-lg border transition-all ${
                            (selectedItem.state.fanSpeed || 'auto') === spd
                              ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                              : 'bg-[#F8F9FA] text-[#71717A] border-[#E4E4E7]'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Smart Light Controls */}
              {(selectedItem.type === 'smart_ceiling_light' || selectedItem.type === 'smart_pendant') && (
                <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#18181B]">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Dimmer Kecerahan
                    </span>
                    <span className="font-mono text-sm font-bold text-[#F59E0B]">
                      {selectedItem.state.brightness || 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={selectedItem.state.brightness || 100}
                    onChange={(e) =>
                      onUpdateDeviceState(selectedItem.id, { brightness: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#F59E0B] cursor-pointer"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-[#E4E4E7]">
                    <label className="text-[11px] font-medium text-[#71717A] block">Warna Suasana (RGB/CCT)</label>
                    <div className="flex items-center gap-2">
                      {['#FFEAA7', '#FFFFFF', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => onUpdateDeviceState(selectedItem.id, { colorRgb: hex })}
                          className="w-6 h-6 rounded-full border border-black/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Door Lock Control */}
              {selectedItem.type === 'smart_door_lock' && (
                <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-white space-y-3 text-center">
                  <div className="text-xs font-semibold text-[#18181B]">Status Kunci Akses RFID</div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDeviceState(selectedItem.id, { locked: !selectedItem.state.locked })
                    }
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      selectedItem.state.locked
                        ? 'bg-[#EF4444] text-white shadow-xs'
                        : 'bg-[#10B981] text-white shadow-xs'
                    }`}
                  >
                    {selectedItem.state.locked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        PINTU TERKUNCI (Klik untuk Buka)
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        PINTU DIBUKA (Klik untuk Kunci)
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectItem(null)}
                className="w-full py-2 border border-[#E4E4E7] hover:bg-[#F8F9FA] rounded-xl text-xs font-medium text-[#71717A]"
              >
                Tutup Panel Kontrol
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#71717A] border-2 border-dashed border-[#E4E4E7] rounded-2xl">
              <Sliders className="w-8 h-8 mx-auto text-[#A1A1AA] mb-2" />
              <p className="font-medium text-[#18181B] mb-1">Pilih Perangkat di Kanvas</p>
              <p className="leading-relaxed">
                Klik perangkat IoT di denah 3D atau pilih dari daftar Node untuk membuka widget kontrol telemetri langsung.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Placed Nodes List */}
      {activeTab === 'nodes' && (
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scroll-thin">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#71717A] uppercase text-[10px]">
              Daftar Perangkat Terpasang ({placedItems.length})
            </span>
            {placedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] text-[#EF4444] hover:underline"
              >
                Hapus Semua
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {placedItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  setActiveTab('control');
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  selectedItem?.id === item.id
                    ? 'border-[#0EA5E9] bg-[#0EA5E9]/10'
                    : 'border-[#E4E4E7] bg-white hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      item.isIoT ? (item.state.online ? 'bg-[#10B981]' : 'bg-[#EF4444]') : 'bg-[#71717A]'
                    }`}
                  />
                  <div className="truncate">
                    <div className="font-semibold text-[#18181B] truncate">{item.name}</div>
                    <div className="text-[10px] font-mono text-[#71717A]">
                      Node-{idx + 1} · {item.category}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="p-1 rounded text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
                  title="Hapus Perangkat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

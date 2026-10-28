import React from 'react';
import {
  FolderOpen,
  Box,
  Square,
  Zap,
  Flame,
  FileDown,
  Layers,
  Thermometer,
  Wind,
  ShieldAlert,
  PlayCircle,
  Cpu,
  Receipt,
  Radio,
} from 'lucide-react';
import type {
  ViewMode,
  TemplateId,
  SimulationScenario,
  OverlayMode,
  RoomTelemetrySummary,
} from '../types';
import { TEMPLATES } from '../data/templates';

interface TopBarProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  overlayMode: OverlayMode;
  onOverlayModeChange: (mode: OverlayMode) => void;
  scenario: SimulationScenario;
  onScenarioChange: (scenario: SimulationScenario) => void;
  summary: RoomTelemetrySummary;
  selectedTemplate: TemplateId;
  onOpenAutomation: () => void;
  onOpenCost: () => void;
  onOpenExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  viewMode,
  onViewChange,
  overlayMode,
  onOverlayModeChange,
  scenario,
  onScenarioChange,
  summary,
  selectedTemplate,
  onOpenAutomation,
  onOpenCost,
  onOpenExport,
}) => {
  const currentTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <header
      id="top-navigation-bar"
      className="h-[64px] bg-white border-b border-[#E4E4E7] px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-xs"
    >
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center relative overflow-hidden shadow-xs shadow-sky-500/20">
            <Cpu className="w-5 h-5 relative z-10 animate-pulse" />
          </div>
          <div>
            <div className="font-display font-black text-sm tracking-tight text-[#18181B] leading-none flex items-center gap-1.5">
              Aura IoT
              <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            </div>
            <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-[#71717A] mt-0.5">
              Digital Twin Ruangan Cerdas
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-[#E4E4E7] hidden lg:block" />

        {/* Live Telemetry Tickers */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Temperature ticker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E4E4E7] text-xs">
            <Thermometer className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span className="text-[#71717A] text-[11px]">Suhu:</span>
            <span className="font-mono font-bold text-[#18181B]">{summary.avgTemp}°C</span>
          </div>

          {/* Air Quality / CO2 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E4E4E7] text-xs">
            <Wind
              className={`w-3.5 h-3.5 ${
                summary.aqiRating === 'Bagus'
                  ? 'text-[#10B981]'
                  : summary.aqiRating === 'Sedang'
                  ? 'text-[#F59E0B]'
                  : 'text-[#EF4444]'
              }`}
            />
            <span className="text-[#71717A] text-[11px]">AQI:</span>
            <span className="font-mono font-bold text-[#18181B]">
              {summary.avgCo2} ppm
            </span>
          </div>

          {/* Active Power */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E4E4E7] text-xs">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-[#71717A] text-[11px]">Daya:</span>
            <span className="font-mono font-bold text-[#18181B]">{summary.totalWatts} W</span>
          </div>

          {/* Active Alerts */}
          {summary.activeAlertsCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] font-semibold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{summary.activeAlertsCount} Bahaya</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Simulation Scenario Selector */}
      <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#F8F9FA] border border-[#E4E4E7] rounded-xl text-xs">
        <PlayCircle className="w-3.5 h-3.5 text-[#71717A]" />
        <span className="text-[#71717A] text-[11px] font-medium mr-1">Simulasi:</span>
        {(
          [
            { id: 'normal', label: 'Normal' },
            { id: 'heatwave', label: 'Gelombang Panas' },
            { id: 'rush_hour', label: 'Jam Padat' },
            { id: 'smoke_hazard', label: 'Bahaya Asap' },
            { id: 'night_eco', label: 'Eco Malam' },
          ] as const
        ).map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onScenarioChange(sc.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              scenario === sc.id
                ? 'bg-white text-[#0EA5E9] shadow-2xs border border-[#E4E4E7]'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Right Controls & Action Modals */}
      <div className="flex items-center gap-2">
        {/* 3D vs 2D View Switch */}
        <div className="flex items-center bg-[#F4F4F5] p-0.5 rounded-lg border border-[#E4E4E7]">
          <button
            id="view-mode-3d-button"
            type="button"
            onClick={() => onViewChange('perspective')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'perspective'
                ? 'bg-white text-[#18181B] shadow-2xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span className="hidden sm:inline">3D Twin</span>
          </button>
          <button
            id="view-mode-2d-button"
            type="button"
            onClick={() => onViewChange('top')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'top'
                ? 'bg-white text-[#18181B] shadow-2xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Square className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span className="hidden sm:inline">2D Denah</span>
          </button>
        </div>

        {/* Overlay Mode Selector */}
        <div className="hidden sm:flex items-center">
          <select
            id="overlay-mode-select"
            value={overlayMode}
            onChange={(e) => onOverlayModeChange(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#F8F9FA] border border-[#E4E4E7] text-xs font-medium rounded-lg text-[#18181B] focus:outline-none"
          >
            <option value="normal">Visual Standar</option>
            <option value="heatmap_temp">Heatmap Suhu Ruang</option>
            <option value="sensor_coverage">Radius Sensor IoT</option>
            <option value="heatmap_lux">Distribusi Lux Lampu</option>
          </select>
        </div>

        {/* Automations Modal Trigger */}
        <button
          id="open-automations-button"
          type="button"
          onClick={onOpenAutomation}
          className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] hover:bg-[#F8F9FA] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 transition-all shadow-2xs"
          title="Buka Mesin Aturan Automasi IF-THEN"
        >
          <Zap className="w-3.5 h-3.5 text-[#0EA5E9]" />
          <span className="hidden md:inline">Automasi</span>
        </button>

        {/* Cost & Energy Modal Trigger */}
        <button
          id="open-cost-button"
          type="button"
          onClick={onOpenCost}
          className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] hover:bg-[#F8F9FA] text-xs font-semibold text-[#18181B] flex items-center gap-1.5 transition-all shadow-2xs"
          title="Buka Audit Energi & BOM Hardware"
        >
          <Receipt className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="hidden md:inline">Audit Biaya</span>
        </button>

        {/* Gateway & Export Modal Trigger */}
        <button
          id="open-export-button"
          type="button"
          onClick={onOpenExport}
          className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          title="Ekspor Skematik & MQTT Broker"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Gateway & Ekspor</span>
        </button>
      </div>
    </header>
  );
};

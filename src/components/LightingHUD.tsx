import React, { useState } from 'react';
import {
  Sun,
  Sunrise,
  Moon,
  Sparkles,
  Zap,
  Sliders,
  X,
  Lightbulb,
  Check,
  Flame,
  Layers,
  ChevronRight,
  Eye,
  Palette,
} from 'lucide-react';
import type { LightingConfig, LightingPreset, WallPaintTheme } from '../types';
import { WALL_PAINT_PALETTES } from '../utils/proceduralMaterials';

interface LightingHUDProps {
  config: LightingConfig;
  onChange: (config: Partial<LightingConfig>) => void;
  brandColor: string;
}

const PRESETS: Array<{
  id: LightingPreset;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  temp: string;
  badge: string;
}> = [
  {
    id: 'evening',
    label: 'Malam Elegan',
    subLabel: 'Malam Mewah · Cahaya Emas Lembut',
    icon: <Moon className="w-4 h-4 text-[#D4AF37]" />,
    temp: '2700K',
    badge: 'Populer',
  },
  {
    id: 'golden_hour',
    label: 'Sore Emas',
    subLabel: 'Matahari Terbenam · Nuansa Amber Hangat',
    icon: <Sunrise className="w-4 h-4 text-[#F59E0B]" />,
    temp: '2400K',
    badge: 'Sinematik',
  },
  {
    id: 'daylight',
    label: 'Siang Alami',
    subLabel: 'Cahaya Matahari Alami · Bayangan Jelas',
    icon: <Sun className="w-4 h-4 text-[#38BDF8]" />,
    temp: '5500K',
    badge: 'Terang',
  },
  {
    id: 'studio',
    label: 'Galeri Sorot',
    subLabel: 'Sorot Lampu Galeri · Kontras Tinggi',
    icon: <Sparkles className="w-4 h-4 text-[#A855F7]" />,
    temp: '4500K',
    badge: 'Fokus',
  },
  {
    id: 'lounge',
    label: 'Lounge Malam',
    subLabel: 'Suasana Kafe & Bar · Aksen Neon',
    icon: <Zap className="w-4 h-4 text-[#EC4899]" />,
    temp: 'Neon',
    badge: 'Eksklusif',
  },
];

export const LightingHUD: React.FC<LightingHUDProps> = ({
  config,
  onChange,
  brandColor,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activePreset = PRESETS.find((p) => p.id === config.preset) || PRESETS[0];

  return (
    <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end">
      {/* Trigger Pill Button */}
      <button
        id="btn-toggle-lighting-hud"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-md ${
          isOpen
            ? 'bg-white border-[#C5A059] text-[#18181B] ring-2 ring-[#C5A059]/30'
            : 'bg-white/90 border-[#E4E4E7] text-[#18181B] hover:border-[#C5A059]/60 hover:bg-white'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
        <div className="flex items-center gap-1.5">
          {activePreset.icon}
          <span className="font-display font-semibold text-xs text-[#18181B]">
            {activePreset.label}
          </span>
        </div>
        <div className="h-3.5 w-px bg-[#E4E4E7]" />
        <span className="font-mono text-[10px] text-[#71717A]">
          {Math.round(config.intensity * 100)}%
        </span>
        <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
      </button>

      {/* Expandable Lighting Studio Panel */}
      {isOpen && (
        <div
          id="lighting-studio-panel"
          className="mt-2 w-80 bg-white/95 backdrop-blur-xl border border-[#E4E4E7] rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs text-[#18181B] uppercase tracking-wider">
                  Studio Pencahayaan 3D
                </h4>
                <p className="text-[10px] text-[#71717A]">
                  Fotometrik & Atmosfer Ruang
                </p>
              </div>
            </div>
            <button
              id="btn-close-lighting-hud"
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Selector Grid */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#71717A] font-display">
                Suasana & Waktu
              </span>
              <span className="text-[10px] font-mono font-bold text-[#C5A059]">
                {activePreset.temp}
              </span>
            </div>

            <div className="space-y-1.5">
              {PRESETS.map((preset) => {
                const isSelected = config.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`lighting-preset-${preset.id}`}
                    type="button"
                    onClick={() => onChange({ preset: preset.id })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#18181B] shadow-xs'
                        : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#71717A] hover:border-[#D4D4D8] hover:text-[#18181B] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#C5A059]/20 border-[#C5A059]/40 text-[#C5A059]'
                            : 'bg-white border-[#E4E4E7] text-[#71717A]'
                        }`}
                      >
                        {preset.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#18181B] flex items-center gap-1.5">
                          {preset.label}
                          {preset.badge && (
                            <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.2 bg-[#E4E4E7] text-[#18181B] rounded-sm">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#71717A]">
                          {preset.subLabel}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Intensity Slider */}
          <div className="mt-4 pt-3.5 border-t border-[#E4E4E7]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#71717A] font-display">
                Intensitas Cahaya (Kecerahan)
              </span>
              <span className="font-mono text-xs font-bold text-[#C5A059]">
                {Math.round(config.intensity * 100)}%
              </span>
            </div>
            <input
              id="slider-light-intensity"
              type="range"
              min="0.3"
              max="1.8"
              step="0.05"
              value={config.intensity}
              onChange={(e) => onChange({ intensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#E4E4E7] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#71717A] mt-1">
              <span>Redup (30%)</span>
              <span>Standar (100%)</span>
              <span>Terang (180%)</span>
            </div>
          </div>

          {/* Color Temperature Quick Selector */}
          <div className="mt-3.5">
            <div className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#71717A] font-display mb-2">
              Temperatur Warna (Kelvin)
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'warm', label: 'Hangat', sub: '2700K', color: '#FFA844' },
                { id: 'gold', label: 'Emas', sub: '2200K', color: '#D4AF37' },
                { id: 'neutral', label: 'Alami', sub: '4000K', color: '#FFFFFF' },
                { id: 'cool', label: 'Sejuk', sub: '6500K', color: '#88C0FF' },
              ].map((t) => {
                const active = config.colorTemp === t.id;
                return (
                  <button
                    key={t.id}
                    id={`btn-temp-${t.id}`}
                    type="button"
                    onClick={() => onChange({ colorTemp: t.id as any })}
                    className={`py-1.5 px-1 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#18181B] shadow-xs'
                        : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#71717A] hover:border-[#D4D4D8]'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mx-auto mb-1 border border-black/20"
                      style={{ backgroundColor: t.color }}
                    />
                    <div className="text-[10px] font-semibold leading-tight">{t.label}</div>
                    <div className="text-[8px] font-mono text-[#71717A]">{t.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cheerful Wall Paint Mural Theme Selector */}
          <div className="mt-4 pt-3.5 border-t border-[#E4E4E7]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#71717A] font-display flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-[#C5A059]" />
                Tema Interior & Cat Dinding
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#C5A059]">
                Eksekutif & Mural
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-0.5 scroll-thin">
              {(Object.keys(WALL_PAINT_PALETTES) as WallPaintTheme[]).map((themeKey) => {
                const pal = WALL_PAINT_PALETTES[themeKey];
                const isSelected = (config.wallTheme || 'executive_travertine') === themeKey;
                return (
                  <button
                    key={pal.id}
                    id={`wall-theme-${pal.id}`}
                    type="button"
                    onClick={() => onChange({ wallTheme: pal.id })}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#18181B] shadow-2xs'
                        : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#71717A] hover:border-[#D4D4D8] hover:text-[#18181B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1 shrink-0">
                        {[pal.archPrimary, pal.sunCircle, pal.archSecondary, pal.waveAccent].map(
                          (hex, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                              style={{ backgroundColor: hex }}
                            />
                          )
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#18181B] truncate">
                          {pal.label}
                        </div>
                        <div className="text-[10px] text-[#71717A] truncate">
                          {pal.subLabel}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architectural Fixtures Toggles */}
          <div className="mt-4 pt-3.5 border-t border-[#E4E4E7] space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#71717A] font-display mb-1.5">
              Fitur Pencahayaan Arsitektural
            </div>

            {/* Ceiling Spotlights */}
            <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] hover:border-[#D4D4D8] cursor-pointer transition-all">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <div>
                  <div className="text-xs font-semibold text-[#18181B]">
                    Lampu Plafon Spotlights
                  </div>
                  <div className="text-[9px] text-[#71717A]">
                    Grid recessed downlights 3.4m
                  </div>
                </div>
              </div>
              <input
                id="toggle-ceiling-spots"
                type="checkbox"
                checked={config.ceilingSpots}
                onChange={(e) => onChange({ ceilingSpots: e.target.checked })}
                className="w-4 h-4 rounded border-[#E4E4E7] text-[#C5A059] focus:ring-0 cursor-pointer accent-[#C5A059]"
              />
            </label>

            {/* Wall Grazing Sconces */}
            <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] hover:border-[#D4D4D8] cursor-pointer transition-all">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                <div>
                  <div className="text-xs font-semibold text-[#18181B]">
                    Pencahayaan Dinding (Sconces)
                  </div>
                  <div className="text-[9px] text-[#71717A]">
                    Up/down accent wall wash
                  </div>
                </div>
              </div>
              <input
                id="toggle-wall-sconces"
                type="checkbox"
                checked={config.wallSconces}
                onChange={(e) => onChange({ wallSconces: e.target.checked })}
                className="w-4 h-4 rounded border-[#E4E4E7] text-[#C5A059] focus:ring-0 cursor-pointer accent-[#C5A059]"
              />
            </label>

            {/* Soft Shadow Casting */}
            <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] hover:border-[#D4D4D8] cursor-pointer transition-all">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#C5A059]" />
                <div>
                  <div className="text-xs font-semibold text-[#18181B]">
                    Bayangan Lembut 3D (PCF Soft)
                  </div>
                  <div className="text-[9px] text-[#71717A]">
                    Real-time shadow map depth
                  </div>
                </div>
              </div>
              <input
                id="toggle-cast-shadows"
                type="checkbox"
                checked={config.shadows}
                onChange={(e) => onChange({ shadows: e.target.checked })}
                className="w-4 h-4 rounded border-[#E4E4E7] text-[#C5A059] focus:ring-0 cursor-pointer accent-[#C5A059]"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

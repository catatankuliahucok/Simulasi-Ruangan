import React, { useState } from 'react';
import {
  Laptop,
  Server,
  Users,
  Coffee,
  Flower2,
  LayoutGrid,
  Check,
  Wind,
  Radar,
  Flame,
  Snowflake,
  Sun,
  LampFloor,
  Camera,
  Lock,
  Zap,
  Grid,
  Armchair,
  Sofa,
  Cpu,
  Plus,
} from 'lucide-react';
import type { TemplateId, ItemCategory } from '../types';
import { TEMPLATES } from '../data/templates';
import { CATALOG } from '../data/catalog';

interface LeftPanelProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
  selectedItemKey: string | null;
  onSelectItemKey: (key: string | null) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  smart_office: <Laptop className="w-4 h-4" />,
  server_room: <Server className="w-4 h-4" />,
  smart_meeting: <Users className="w-4 h-4" />,
  smart_cafe: <Coffee className="w-4 h-4" />,
  greenhouse_lab: <Flower2 className="w-4 h-4" />,
};

const ITEM_ICONS: Record<string, React.ReactNode> = {
  Wind: <Wind className="w-4 h-4" />,
  Radar: <Radar className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Snowflake: <Snowflake className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  LampFloor: <LampFloor className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
  Server: <Server className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Laptop: <Laptop className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  Armchair: <Armchair className="w-4 h-4" />,
  Sofa: <Sofa className="w-4 h-4" />,
  Flower2: <Flower2 className="w-4 h-4" />,
};

export const LeftPanel: React.FC<LeftPanelProps> = ({
  selectedTemplate,
  onSelectTemplate,
  selectedItemKey,
  onSelectItemKey,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Semua' },
    { id: 'sensor', label: 'Sensor' },
    { id: 'climate', label: 'HVAC' },
    { id: 'lighting', label: 'Lampu' },
    { id: 'security', label: 'Keamanan' },
    { id: 'power', label: 'Daya' },
    { id: 'furniture', label: 'Furnitur' },
  ];

  const filteredItems = Object.entries(CATALOG).filter(
    ([_, item]) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <aside
      id="left-catalog-panel"
      className="w-full md:w-[270px] lg:w-[290px] bg-white border-r border-[#E4E4E7] flex flex-col h-full overflow-hidden select-none shrink-0"
    >
      {/* Templates Section */}
      <div className="p-4 border-b border-[#E4E4E7]">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.14em] uppercase text-[#71717A] mb-2.5 font-display">
          <span>Templat Digital Twin</span>
          <LayoutGrid className="w-3 h-3 text-[#71717A]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                id={`template-button-${tmpl.id}`}
                type="button"
                onClick={() => onSelectTemplate(tmpl.id)}
                className={`p-2.5 text-left rounded-xl border transition-all relative ${
                  isSelected
                    ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 shadow-xs ring-1 ring-[#0EA5E9]'
                    : 'border-[#E4E4E7] bg-[#F8F9FA] hover:border-[#D4D4D8] hover:bg-[#F4F4F5]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-[9px] font-bold">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
                <div
                  className={`text-base mb-1 ${
                    isSelected ? 'text-[#0EA5E9]' : 'text-[#71717A]'
                  }`}
                >
                  {TEMPLATE_ICONS[tmpl.id]}
                </div>
                <div className="text-xs font-semibold text-[#18181B] truncate">
                  {tmpl.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono text-[#71717A] mt-0.5">
                  120 m² · {tmpl.maxCapacity} Kapasitas
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills */}
      <div className="p-3 border-b border-[#E4E4E7] bg-[#F8F9FA] overflow-x-auto scroll-thin">
        <div className="flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0EA5E9] text-white shadow-2xs font-semibold'
                  : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Items Grid */}
      <div className="p-3 overflow-y-auto space-y-2 flex-1 scroll-thin">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#71717A] mb-1 font-display px-1">
          Katalog Perangkat IoT ({filteredItems.length})
        </div>

        {filteredItems.map(([key, item]) => {
          const isSelected = selectedItemKey === key;
          return (
            <div
              key={key}
              id={`catalog-item-${key}`}
              onClick={() => onSelectItemKey(isSelected ? null : key)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 shadow-xs ring-1 ring-[#0EA5E9]'
                  : 'border-[#E4E4E7] bg-white hover:border-[#CBD5E1] hover:bg-[#F8F9FA]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                      isSelected
                        ? 'bg-[#0EA5E9] text-white'
                        : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {key === 'plant' ? (
                      <img
                        src="/assets/aistudio/image_e95e467f.png"
                        alt={item.name}
                        className="w-7 h-7 object-contain"
                      />
                    ) : key === 'smart_desk_lamp' ? (
                      <img
                        src="/assets/aistudio/image_4d35e08e.png"
                        alt={item.name}
                        className="w-7 h-7 object-contain rounded"
                      />
                    ) : (
                      ITEM_ICONS[item.iconName] || <Cpu className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#18181B] leading-tight">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded font-medium">
                        {item.category.toUpperCase()}
                      </span>
                      {item.baseWatts > 0 && (
                        <span className="text-[10px] font-mono text-[#71717A]">
                          {item.baseWatts} W
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-[#18181B]">
                    Rp {(item.price / 1000).toLocaleString('id-ID')}k
                  </div>
                  <div className="text-[9px] text-[#0EA5E9] font-medium mt-0.5">
                    {isSelected ? 'Klik di Lantai' : '+ Pasang'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

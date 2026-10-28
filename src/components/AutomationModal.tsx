import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Sparkles,
  Zap,
  Power,
  Sliders,
  Bell,
  Thermometer,
  Shield,
  Activity,
} from 'lucide-react';
import type { AutomationRule, PlacedItem } from '../types';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AutomationRule[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: AutomationRule) => void;
  onDeleteRule: (id: string) => void;
  onTestRule: (rule: AutomationRule) => void;
  placedItems: PlacedItem[];
  onShowToast: (msg: string, type?: any) => void;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  rules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onTestRule,
  placedItems,
  onShowToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<AutomationRule['triggerType']>('temperature');
  const [operator, setOperator] = useState<AutomationRule['operator']>('>');
  const [thresholdValue, setThresholdValue] = useState<string>('26');
  const [actionType, setActionType] = useState<AutomationRule['actionType']>('set_temp');
  const [actionParam, setActionParam] = useState<string>('22');

  if (!isOpen) return null;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name,
      description: description || `Otomatisasi ${triggerType} -> ${actionType}`,
      enabled: true,
      triggerType,
      operator,
      thresholdValue: isNaN(Number(thresholdValue)) ? thresholdValue : Number(thresholdValue),
      actionType,
      actionParam: isNaN(Number(actionParam)) ? actionParam : Number(actionParam),
    };

    onAddRule(newRule);
    setName('');
    setDescription('');
    setIsCreating(false);
    onShowToast(`Aturan "${newRule.name}" berhasil ditambahkan!`, 'success');
  };

  return (
    <div
      id="automation-rules-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="automation-rules-modal-card"
        className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-gradient-to-r from-[#F8F9FA] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18181B] font-display flex items-center gap-2">
                Mesin Automasi IF-THEN Ruangan
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0EA5E9]/15 text-[#0284C7]">
                  {rules.filter((r) => r.enabled).length} Aktif
                </span>
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Konfigurasikan aksi otomatis aktuator berdasarkan batas sensor lingkungan secara real-time.
              </p>
            </div>
          </div>
          <button
            id="close-automation-modal-button"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F4F4F5] text-[#71717A] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 scroll-thin">
          {/* Rules List */}
          <div className="space-y-3">
            {rules.map((rule) => {
              return (
                <div
                  key={rule.id}
                  id={`automation-rule-card-${rule.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    rule.enabled
                      ? 'border-[#0EA5E9]/40 bg-[#F0F9FF]/40 shadow-xs'
                      : 'border-[#E4E4E7] bg-[#F8F9FA] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rule.enabled ? 'bg-[#10B981] animate-pulse' : 'bg-[#D4D4D8]'
                          }`}
                        />
                        <span className="font-semibold text-sm text-[#18181B]">{rule.name}</span>
                      </div>
                      <p className="text-xs text-[#52525B] leading-relaxed">{rule.description}</p>

                      {/* Rule Logic Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E4E4E7] text-[10px] font-mono text-[#3F3F46]">
                          <Activity className="w-3 h-3 text-[#0EA5E9]" />
                          IF <strong className="uppercase">{rule.triggerType}</strong> {rule.operator} {String(rule.thresholdValue)}
                        </span>
                        <span className="text-xs text-[#A1A1AA]">➔</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E4E4E7] text-[10px] font-mono text-[#3F3F46]">
                          <Zap className="w-3 h-3 text-[#F59E0B]" />
                          THEN <strong className="uppercase">{rule.actionType}</strong> ({String(rule.actionParam)})
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTestRule(rule)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E4E4E7] hover:bg-white text-xs text-[#18181B] font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Jalankan uji coba aturan ini sekarang"
                      >
                        <Play className="w-3 h-3 text-[#0EA5E9]" />
                        Uji Coba
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleRule(rule.id)}
                        className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                          rule.enabled ? 'bg-[#0EA5E9]' : 'bg-[#D4D4D8]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-4 shadow-xs' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                        title="Hapus aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create New Rule Form */}
          {isCreating ? (
            <form
              onSubmit={handleCreateRule}
              className="p-4 rounded-xl border border-[#0EA5E9]/50 bg-[#F0F9FF]/20 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-[#0284C7]">
                  Buat Logika Automasi Baru
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-[#71717A] hover:text-[#18181B]"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">Nama Aturan</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Auto Night Dimmer"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">Keterangan Deskripsi</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan tujuan automasi ini"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-[#E4E4E7]">
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">IF Sensor Trigger</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white"
                  >
                    <option value="temperature">Suhu Ruangan (°C)</option>
                    <option value="motion">Deteksi Gerak PIR</option>
                    <option value="co2">Kadar CO2 (ppm)</option>
                    <option value="smoke">Sensor Asap & Api</option>
                    <option value="lightLux">Tingkat Cahaya (Lux)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">Kondisi Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white"
                  >
                    <option value=">">Lebih Besar Dari (&gt;)</option>
                    <option value="<">Lebih Kecil Dari (&lt;)</option>
                    <option value="==">Sama Dengan (==)</option>
                    <option value="detected">Terdeteksi (Active)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">Nilai Ambang Batas</label>
                  <input
                    type="text"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    placeholder="26 atau true"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-[#E4E4E7]">
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">THEN Aksi Aktuator</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white"
                  >
                    <option value="set_temp">Atur Suhu AC (°C)</option>
                    <option value="set_brightness">Atur Dimmer Lampu (%)</option>
                    <option value="power_on">Nyalakan Perangkat (Power ON)</option>
                    <option value="power_off">Matikan Perangkat (Power OFF)</option>
                    <option value="unlock_door">Buka Kunci Pintu Otomatis</option>
                    <option value="trigger_alarm">Aktifkan Sirine Alarm</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#71717A] block mb-1">Parameter Aksi</label>
                  <input
                    type="text"
                    value={actionParam}
                    onChange={(e) => setActionParam(e.target.value)}
                    placeholder="Contoh: 22 atau 80"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E4E7] bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#71717A] hover:bg-[#F4F4F5] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg shadow-xs"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-3 border-2 border-dashed border-[#E4E4E7] hover:border-[#0EA5E9] hover:bg-[#F0F9FF]/40 rounded-xl text-xs font-semibold text-[#52525B] hover:text-[#0284C7] flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Logika Automasi Baru
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F9FA] border-t border-[#E4E4E7] flex justify-between items-center text-xs">
          <span className="text-[#71717A] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            Engine automasi memproses aturan setiap 1.5 detik.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-white rounded-lg font-medium text-xs shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

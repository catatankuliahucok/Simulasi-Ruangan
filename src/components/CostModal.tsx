import React from 'react';
import { X, FileDown, Receipt, Zap, Leaf, ShieldCheck, Cpu } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { PlacedItem, TemplateId, RoomTelemetrySummary } from '../types';
import { CATALOG } from '../data/catalog';

interface CostModalProps {
  isOpen: boolean;
  onClose: () => void;
  placedItems: PlacedItem[];
  templateId: TemplateId;
  summary: RoomTelemetrySummary;
  onShowToast: (msg: string, type?: any) => void;
}

export const CostModal: React.FC<CostModalProps> = ({
  isOpen,
  onClose,
  placedItems,
  templateId,
  summary,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const grouped: Record<
    string,
    { count: number; name: string; price: number; wattage: number; category: string; type: string }
  > = {};

  placedItems.forEach((item) => {
    if (!grouped[item.type]) {
      const cat = CATALOG[item.type];
      grouped[item.type] = {
        count: 0,
        name: item.name,
        price: item.price,
        wattage: item.state?.wattage || cat?.baseWatts || 0,
        category: item.category,
        type: item.type,
      };
    }
    grouped[item.type].count++;
  });

  const totalHardwareCost = placedItems.reduce((acc, item) => acc + item.price, 0);
  const installationCost = Math.round(totalHardwareCost * 0.1);
  const commissioningCost = 1500000;
  const grandTotalInvestment = totalHardwareCost + installationCost + commissioningCost;

  // Monthly Energy Calculations (Tarif Listrik B-2/TR ~Rp 1.444,70 / kWh)
  const monthlyKwh = Math.round(summary.dailyKwh * 30);
  const monthlyCostIdr = Math.round(monthlyKwh * 1445);
  // Energy saved by IoT automations (~28% efficiency boost)
  const monthlySavedKwh = Math.round(monthlyKwh * 0.28);
  const monthlySavedCostIdr = Math.round(monthlySavedKwh * 1445);
  const co2SavedKg = Math.round(monthlySavedKwh * 0.78); // 0.78 kg CO2 per kWh in ID grid

  const handleExportQuotePdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      // Header
      doc.setTextColor(24, 24, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Estimasi Investasi & Audit Energi IoT', 20, 26);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text(
        `Templat: ${templateId.toUpperCase()} · Tanggal: ${new Date().toLocaleDateString('id-ID')} · Beban Daya: ${summary.totalWatts} W`,
        20,
        34
      );

      // Energy Efficiency Metric Banner
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(20, 40, 170, 16, 2, 2, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(
        `Efisiensi Energi Cerdas: Penghematan ~${monthlySavedKwh} kWh/bln (Rp ${monthlySavedCostIdr.toLocaleString('id-ID')})`,
        24,
        50
      );

      // Table Header
      let y = 68;
      doc.setFillColor(244, 244, 245);
      doc.rect(20, y - 6, 170, 8, 'F');

      doc.setTextColor(24, 24, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PERANGKAT / ITEM', 24, y);
      doc.text('QTY', 110, y);
      doc.text('HARGA SATUAN', 130, y);
      doc.text('TOTAL (IDR)', 165, y);

      y += 7;
      doc.setFont('helvetica', 'normal');

      Object.values(grouped).forEach((g) => {
        doc.text(g.name.slice(0, 32), 24, y);
        doc.text(`${g.count}`, 112, y);
        doc.text(`Rp ${g.price.toLocaleString('id-ID')}`, 130, y);
        doc.text(`Rp ${(g.price * g.count).toLocaleString('id-ID')}`, 165, y);

        doc.setDrawColor(228, 228, 231);
        doc.line(20, y + 2.5, 190, y + 2.5);
        y += 7;
      });

      // Total Calculation
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Perangkat Keras (Hardware):', 100, y);
      doc.text(`Rp ${totalHardwareCost.toLocaleString('id-ID')}`, 165, y);
      y += 6;
      doc.text('Biaya Instalasi & Jaringan (10%):', 100, y);
      doc.text(`Rp ${installationCost.toLocaleString('id-ID')}`, 165, y);
      y += 6;
      doc.text('Komisioning Gateway & Kalibrasi Sensor:', 100, y);
      doc.text(`Rp ${commissioningCost.toLocaleString('id-ID')}`, 165, y);
      y += 7;
      doc.setFontSize(11);
      doc.setTextColor(14, 165, 233);
      doc.text('TOTAL INVESTASI:', 100, y);
      doc.text(`Rp ${grandTotalInvestment.toLocaleString('id-ID')}`, 165, y);

      doc.save(`AURA-IOT-AUDIT-${templateId}.pdf`);
      onShowToast('Laporan biaya dan energi berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mencetak dokumen PDF', 'trash');
    }
  };

  return (
    <div
      id="cost-energy-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="cost-energy-modal-card"
        className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18181B] font-display">
                Audit Investasi Hardware & Efisiensi Energi
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Rincian Bill of Materials (BOM), estimasi tagihan listrik bulanan, dan proyeksi ROI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F4F4F5] text-[#71717A] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scroll-thin">
          {/* Energy & Carbon Savings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                Hemat Energi IoT
              </span>
              <div className="text-lg font-mono font-black text-[#15803D]">
                ~{monthlySavedKwh} <span className="text-xs font-normal">kWh/bln</span>
              </div>
              <p className="text-[11px] text-[#166534]">Hemat 28% dari automasi cerdas</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#E0F2FE] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Estimasi Tagihan Listrik
              </span>
              <div className="text-lg font-mono font-black text-[#0369A1]">
                Rp {monthlyCostIdr.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-[#075985]">Beban aktif: {summary.totalWatts} Watts</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF5FF] border border-[#F3E8FF] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9333EA] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Reduksi Emisi Karbon
              </span>
              <div className="text-lg font-mono font-black text-[#7E22CE]">
                ~{co2SavedKg} <span className="text-xs font-normal">kg CO₂e/bln</span>
              </div>
              <p className="text-[11px] text-[#6B21A8]">Ramah lingkungan & Net-Zero ready</p>
            </div>
          </div>

          {/* BOM Item List */}
          <div>
            <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-2 font-display">
              Rincian Perangkat Keras & Komponen (BOM)
            </h3>
            <div className="border border-[#E4E4E7] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F9FA] text-[#71717A] border-b border-[#E4E4E7] font-semibold">
                  <tr>
                    <th className="p-2.5 pl-4">Perangkat</th>
                    <th className="p-2.5 text-center">Kategori</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Harga Satuan</th>
                    <th className="p-2.5 pr-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]">
                  {Object.values(grouped).map((g) => (
                    <tr key={g.type} className="hover:bg-[#F8F9FA]/50">
                      <td className="p-2.5 pl-4 font-medium text-[#18181B]">{g.name}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold bg-[#F4F4F5] text-[#52525B]">
                          {g.category}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono">{g.count}</td>
                      <td className="p-2.5 text-right font-mono text-[#52525B]">
                        Rp {g.price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 pr-4 text-right font-mono font-semibold text-[#18181B]">
                        Rp {(g.price * g.count).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E4E4E7] space-y-2 text-xs">
            <div className="flex justify-between text-[#71717A]">
              <span>Subtotal Perangkat Keras:</span>
              <span className="font-mono text-[#18181B]">Rp {totalHardwareCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Jasa Pemasangan & Konfigurasi Jaringan (10%):</span>
              <span className="font-mono text-[#18181B]">Rp {installationCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Komisioning IoT Gateway & Sertifikasi Keamanan:</span>
              <span className="font-mono text-[#18181B]">Rp {commissioningCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-px bg-[#E4E4E7] my-2" />
            <div className="flex justify-between text-sm font-bold text-[#18181B]">
              <span>Total Estimasi Investasi Awal:</span>
              <span className="font-mono text-[#0EA5E9]">
                Rp {grandTotalInvestment.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F9FA] border-t border-[#E4E4E7] flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E4E4E7] hover:bg-white text-[#71717A] font-medium"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleExportQuotePdf}
            className="px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            Unduh Estimasi & Audit PDF
          </button>
        </div>
      </div>
    </div>
  );
};

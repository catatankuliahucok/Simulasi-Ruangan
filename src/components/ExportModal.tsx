import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Check,
  Download,
  Layers,
  Terminal,
  Copy,
  Cpu,
  FileCode,
  CheckCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { PlacedItem, TemplateId, RoomTelemetrySummary } from '../types';
import { CATALOG } from '../data/catalog';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  placedItems: PlacedItem[];
  templateId: TemplateId;
  brandColor: string;
  roomArea: number;
  summary: RoomTelemetrySummary;
  onShowToast: (msg: string, type?: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  placedItems,
  templateId,
  brandColor,
  roomArea,
  summary,
  onShowToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [refCode, setRefCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'mqtt' | 'json'>('blueprint');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const code = `IOT-${templateId.slice(0, 3).toUpperCase()}-${Math.floor(
      Math.random() * 9000 + 1000
    )}`;
    setRefCode(code);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let progress = 0;
    let animationId: number;

    const render = () => {
      progress = Math.min(1, progress + 0.04);
      drawIoTBlueprint(ctx, canvas.width, canvas.height, progress, code);

      if (progress < 1) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isOpen, templateId, brandColor, placedItems, activeTab]);

  const drawIoTBlueprint = (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    progress: number,
    code: string
  ) => {
    ctx.clearRect(0, 0, W, H);

    // 1. Dark Blueprint Technical Grid
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Outer Room Perimeter
    const margin = 35;
    const roomW = W - margin * 2;
    const roomH = H - 120;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, roomW, roomH);

    // 2. Title & Header
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 13px Archivo, sans-serif';
    ctx.fillText(`AURA IOT DIGITAL TWIN SCHEMATIC — ${code}`, margin, H - 55);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(
      `Area: ${roomArea}m² | Perangkat: ${placedItems.length} | Beban: ${summary.totalWatts}W | Status: NORMAL`,
      margin,
      H - 38
    );
    ctx.fillText(
      `Suhu: ${summary.avgTemp}°C | Kelembaban: ${summary.avgHumidity}% | AQI: ${summary.aqiRating}`,
      margin,
      H - 22
    );

    // 3. Draw Placed IoT Devices & Sensor Coverage Zones
    const scaleX = roomW / 12;
    const scaleZ = roomH / 10;
    const centerX = margin + roomW / 2;
    const centerZ = margin + roomH / 2;

    placedItems.forEach((item, idx) => {
      const px = centerX + item.position.x * scaleX;
      const pz = centerZ + item.position.z * scaleZ;

      // Draw sensor coverage radius
      if (item.isIoT && item.category === 'sensor') {
        ctx.beginPath();
        ctx.arc(px, pz, 36, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw device symbol
      ctx.fillStyle = item.isIoT ? (item.state.online ? '#0EA5E9' : '#EF4444') : '#64748B';
      ctx.beginPath();
      ctx.arc(px, pz, 6, 0, Math.PI * 2);
      ctx.fill();

      // Device label
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(`NODE-${idx + 1}`, px + 8, pz + 3);
    });
  };

  const mqttPayload = {
    broker: 'mqtt://iot-gateway.internal:1883',
    timestamp: new Date().toISOString(),
    roomId: templateId,
    metrics: {
      temperature_c: summary.avgTemp,
      humidity_pct: summary.avgHumidity,
      co2_ppm: summary.avgCo2,
      pm25_ugm3: summary.avgPm25,
      active_power_watts: summary.totalWatts,
      daily_energy_kwh: summary.dailyKwh,
      comfort_score: summary.comfortIndex,
      aqi_rating: summary.aqiRating,
    },
    nodes: placedItems.map((item, idx) => ({
      nodeId: `node_${idx + 1}`,
      type: item.type,
      category: item.category,
      coordinates: { x: item.position.x, z: item.position.z },
      state: item.state,
    })),
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(mqttPayload, null, 2));
    setCopied(true);
    onShowToast('Payload MQTT disalin ke clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Background
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 297, 210, 'F');

      // Title & Header
      doc.setTextColor(248, 250, 252);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('AURA IOT — LAPORAN DIGITAL TWIN RUANGAN CERDAS', 15, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Referensi Proyek: ${refCode} | Ruang: ${templateId.toUpperCase()} | Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
        15,
        27
      );

      // Metric Summary Boxes
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(15, 34, 60, 24, 2, 2, 'F');
      doc.roundedRect(80, 34, 60, 24, 2, 2, 'F');
      doc.roundedRect(145, 34, 60, 24, 2, 2, 'F');
      doc.roundedRect(210, 34, 72, 24, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('SUHU & KELEMBABAN', 20, 42);
      doc.text('KUALITAS UDARA (AQI)', 85, 42);
      doc.text('DAYA REAL-TIME', 150, 42);
      doc.text('INDEKS KENYAMANAN', 215, 42);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(56, 189, 248);
      doc.text(`${summary.avgTemp}°C / ${summary.avgHumidity}%`, 20, 52);
      doc.text(`${summary.avgCo2} ppm (${summary.aqiRating})`, 85, 52);
      doc.text(`${summary.totalWatts} W (${summary.dailyKwh} kWh/hr)`, 150, 52);
      doc.text(`${summary.comfortIndex} / 100`, 215, 52);

      // Node Table Header
      let y = 70;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y - 5, 267, 8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(248, 250, 252);
      doc.text('NODE ID', 20, y);
      doc.text('NAMA PERANGKAT', 50, y);
      doc.text('KATEGORI', 115, y);
      doc.text('DAYA (W)', 150, y);
      doc.text('STATUS', 185, y);
      doc.text('KOORDINAT SPASIAL', 225, y);

      y += 6;
      doc.setFont('helvetica', 'normal');

      placedItems.slice(0, 14).forEach((item, idx) => {
        doc.setTextColor(226, 232, 240);
        doc.text(`NODE-0${idx + 1}`, 20, y);
        doc.text(item.name.slice(0, 28), 50, y);
        doc.text(item.category.toUpperCase(), 115, y);
        doc.text(`${item.state?.wattage || item.price ? (item.state.wattage || 0) : 0} W`, 150, y);
        doc.text(item.isIoT ? (item.state.online ? 'ONLINE' : 'OFFLINE') : 'PASSIVE', 185, y);
        doc.text(`X: ${item.position.x.toFixed(1)}m, Z: ${item.position.z.toFixed(1)}m`, 225, y);

        doc.setDrawColor(51, 65, 85);
        doc.line(15, y + 2, 282, y + 2);
        y += 6.5;
      });

      doc.save(`AURA-IOT-SCHEMATIC-${refCode}.pdf`);
      onShowToast('Cetak biru PDF digital twin berhasil diekspor!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat PDF', 'trash');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="iot-export-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="iot-export-modal-card"
        className="bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col text-[#F8FAFC]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0EA5E9]/20 border border-[#0EA5E9]/40 flex items-center justify-center text-[#38BDF8]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white flex items-center gap-2">
                Pusat Integrasi & Ekspor IoT Gateway
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#0EA5E9]/20 text-[#38BDF8] border border-[#0EA5E9]/30">
                  {refCode}
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Ekspor cetak biru spasial teknis, streaming telemetri MQTT, dan skema JSON perangkat.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1E293B] bg-[#0F172A] px-4">
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'blueprint'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Skematik 2D Digital Twin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mqtt')}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'mqtt'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            MQTT Telemetry Stream
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Skema JSON Perangkat
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'blueprint' && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-xl overflow-hidden border border-[#334155] shadow-lg bg-[#0F172A]">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={420}
                  className="w-full max-w-[720px] h-auto block"
                />
              </div>
              <p className="text-xs text-[#94A3B8] text-center max-w-lg">
                Cetak biru menampilkan batas fisik, radius jangkauan sensor (lingkaran putus-putus), dan koordinat penempatan aktuator.
              </p>
            </div>
          )}

          {(activeTab === 'mqtt' || activeTab === 'json') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] font-mono">Topik: room/{templateId}/telemetry</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg flex items-center gap-1.5 transition-colors text-xs"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin!' : 'Salin JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#020617] border border-[#1E293B] text-[#38BDF8] font-mono text-xs overflow-x-auto max-h-[380px] scroll-thin">
                {JSON.stringify(mqttPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0B1120] border-t border-[#1E293B] flex justify-between items-center">
          <span className="text-xs text-[#94A3B8]">
            Format kompatibel dengan AWS IoT Core, Home Assistant & Node-RED.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg text-xs font-medium"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Cetak Biru PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

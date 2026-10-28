import React from 'react';
import { Info, CheckCircle2, AlertTriangle, Palette, Route, RotateCcw, Trash2, Hand } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'warn' | 'palette' | 'route' | 'rotate' | 'trash' | 'hand';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#6B8E4E]" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-[#D49B3B]" />;
      case 'palette':
        return <Palette className="w-4 h-4 text-[#C75D3F]" />;
      case 'route':
        return <Route className="w-4 h-4 text-[#C75D3F]" />;
      case 'rotate':
        return <RotateCcw className="w-4 h-4 text-[#C75D3F]" />;
      case 'trash':
        return <Trash2 className="w-4 h-4 text-[#B0432E]" />;
      case 'hand':
        return <Hand className="w-4 h-4 text-[#C75D3F]" />;
      default:
        return <Info className="w-4 h-4 text-[#C75D3F]" />;
    }
  };

  return (
    <div
      id="toast-notification"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2A2826] text-[#F5F1EA] text-xs font-medium shadow-2xl transition-all duration-300 pointer-events-none animate-in fade-in slide-in-from-bottom-3"
    >
      {renderIcon()}
      <span>{message}</span>
    </div>
  );
};

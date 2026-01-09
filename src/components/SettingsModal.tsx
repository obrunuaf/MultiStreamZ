import React from 'react';
import { createPortal } from 'react-dom';
import { useStreamStore } from '../store/useStreamStore';
import { X, RefreshCw, Trash2, Layout, Info, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { reorderStreams, resetLayout } = useStreamStore();

  if (!isOpen) return null;

  const handleResetAll = () => {
    resetLayout();
    alert('Layout e proporções resetados!');
  };

  const handleClearStreams = () => {
    if (confirm('Tem certeza que deseja remover TODAS as lives?')) {
      reorderStreams([]);
      onClose();
    }
  };

  // Usamos Portal para garantir que o modal flutue acima de TUDO (iframes, header, etc)
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-surface border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-panel/50">
          <div className="flex items-center gap-2">
            <Settings className="text-neutral-400" size={18} />
            <h2 className="font-bold text-neutral-100 uppercase tracking-widest text-xs">Configurações</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section: App Control */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter flex items-center gap-2">
              <Layout size={12} /> Interface & Layout
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={handleResetAll}
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all group"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-200">Resetar Layout</div>
                  <div className="text-[10px] text-neutral-500">Voltar para a grade padrão e limpar proporções</div>
                </div>
                <RefreshCw size={16} className="text-neutral-600 group-hover:text-neutral-300 transition-colors" />
              </button>
            </div>
          </div>

          {/* Section: API & Developer */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter flex items-center gap-2">
              <Settings size={12} /> API & Developer
            </h3>
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Twitch Client ID</label>
                <input 
                  type="text"
                  value={useStreamStore.getState().customClientId}
                  onChange={(e) => useStreamStore.getState().setCustomClientId(e.target.value)}
                  placeholder="Seu Twitch Client ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-twitch/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Kick Client ID</label>
                <input 
                  type="text"
                  value={useStreamStore.getState().kickClientId}
                  onChange={(e) => useStreamStore.getState().setKickClientId(e.target.value)}
                  placeholder="Seu Kick Client ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-kick/50"
                />
              </div>
            </div>
          </div>

          {/* Section: Data Management */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter flex items-center gap-2">
              <Trash2 size={12} /> Dados & Privacidade
            </h3>
            <button 
              onClick={handleClearStreams}
              className="w-full flex items-center justify-between p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg transition-all group"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-red-400">Limpar Todas as Lives</div>
                <div className="text-[10px] text-red-500/70">Remove permanentemente sua lista atual</div>
              </div>
              <Trash2 size={16} className="text-red-900 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Section: Info */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-400/80 leading-relaxed">
                MultiStreamZ salva suas lives localmente no navegador. Nenhum dado é enviado para servidores externos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 text-center">
          <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
            MultiStreamZ v1.0.0 • Made with ❤️ for Streamers
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

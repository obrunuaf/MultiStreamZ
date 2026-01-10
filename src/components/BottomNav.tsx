import React from 'react';
import { LayoutGrid, MessageSquare, Map as MapIcon, Maximize2, Minimize2, Settings } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

export const BottomNav: React.FC = () => {
  const { 
    sidebarVisible, 
    toggleSidebar, 
    chatVisible, 
    toggleChat, 
    mapVisible, 
    toggleMap,
    mobileCinemaMode,
    toggleMobileCinema
  } = useStreamStore();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/10 flex items-center justify-around px-2 z-[100] md:hidden transition-all duration-500 ${mobileCinemaMode ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <button
        onClick={toggleSidebar}
        className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-300 ${sidebarVisible && !chatVisible && !mapVisible ? 'text-white' : 'text-neutral-500'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${sidebarVisible && !chatVisible && !mapVisible ? 'bg-white/10 scale-110 shadow-lg shadow-white/5' : ''}`}>
          <LayoutGrid size={20} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Painel</span>
      </button>

      <button
        onClick={toggleChat}
        className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-300 ${chatVisible ? 'text-twitch' : 'text-neutral-500'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${chatVisible ? 'bg-twitch/20 scale-110 shadow-lg shadow-twitch/10' : ''}`}>
          <MessageSquare size={20} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Chat</span>
      </button>

      <button
        onClick={toggleMap}
        className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-300 ${mapVisible ? 'text-blue-400' : 'text-neutral-500'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${mapVisible ? 'bg-blue-500/20 scale-110 shadow-lg shadow-blue-500/10' : ''}`}>
          <MapIcon size={20} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Mapa</span>
      </button>

      <button
        onClick={toggleMobileCinema}
        className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-300 ${mobileCinemaMode ? 'text-kick' : 'text-neutral-500'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all duration-300 ${mobileCinemaMode ? 'bg-kick/20 scale-110 shadow-lg shadow-kick/10' : ''}`}>
          {mobileCinemaMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Cinema</span>
      </button>

      <button
        onClick={() => {}}
        className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-neutral-500 transition-all duration-300 opacity-40 grayscale"
      >
        <div className="p-1.5 rounded-xl">
          <Settings size={20} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Ajustes</span>
      </button>
    </nav>
  );
};

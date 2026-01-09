import React, { useState } from 'react';
import { MessageSquare, Map as MapIcon, Settings, User, LayoutGrid } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const addStream = useStreamStore((state) => state.addStream);
  const { toggleChat, toggleMap, sidebarVisible, toggleSidebar } = useStreamStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addStream(input.trim());
      setInput('');
    }
  };

  return (
    <header className="h-13 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 bg-neutral-200 rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-background rounded-xs" />
          </div>
          <span className="font-black text-sm tracking-tighter text-neutral-100 uppercase">MultiStreamZ</span>
        </div>
        
        <form onSubmit={handleSubmit} className="relative w-48 hidden lg:block">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Adicionar live..."
            className="w-full bg-panel border-none rounded-full py-1.5 px-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-600 tracking-tight"
          />
        </form>
      </div>

      {/* Center: Stream Selector */}
      <div className="hidden md:flex flex-2 justify-center h-full items-center">
        <StreamSelector />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        <LayoutSelector />
        <div className="w-px h-10 bg-border mx-2" />
        <button
          onClick={toggleChat}
          className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100"
          title="Alternar Chat"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={toggleMap}
          className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100"
          title="Alternar Mapa"
        >
          <MapIcon size={20} />
        </button>
        <button
          onClick={toggleSidebar}
          className={`p-2 hover:bg-surface rounded-md transition-colors ${sidebarVisible ? 'text-neutral-100' : 'text-neutral-400'}`}
          title="Alternar Lateral"
        >
          <LayoutGrid size={20} />
        </button>
        <div className="w-px h-4 bg-border mx-2" />
        <button className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100">
          <Settings size={20} />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-background rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors ml-2">
          <User size={16} />
          <span>Entrar</span>
        </button>
      </div>
    </header>
  );
};

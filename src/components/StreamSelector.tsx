import React, { useState, useRef, useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { Users, ChevronDown, Check, X } from 'lucide-react';

export const StreamSelector: React.FC = () => {
  const { streams, featuredStreamId, setFeaturedStream, removeStream } = useStreamStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (streams.length === 0) return null;

  const featuredStream = streams.find(s => s.id === featuredStreamId) || streams[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 bg-panel border border-border/50 rounded-full hover:border-neutral-600 transition-all group"
      >
        {/* Live Badge */}
        <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/15 border border-red-500/10 rounded-full shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">AO VIVO</span>
        </div>

        <div className="flex items-center gap-2 max-w-30">
          <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 shrink-0 overflow-hidden">
             <span className="text-[9px] font-black">{featuredStream?.channelName[0].toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-bold text-neutral-300 truncate lowercase">
            {featuredStream?.channelName}
          </span>
        </div>

        <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-[calc(100vw-2rem)] max-w-72 md:w-72 bg-background border border-border rounded-xl shadow-2xl z-100 overflow-hidden backdrop-blur-xl py-1">
          <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Streamers Ativos</span>
            <div className="flex items-center gap-1 text-neutral-500">
              <Users size={12} />
              <span className="text-[10px] font-bold">{streams.length}</span>
            </div>
          </div>
          
          <div className="max-h-60 md:max-h-80 overflow-y-auto no-scrollbar">
            {streams.map((stream) => (
              <button
                key={stream.id}
                onClick={() => {
                  setFeaturedStream(stream.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors group ${
                  featuredStreamId === stream.id ? 'bg-neutral-100 text-background' : 'hover:bg-neutral-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                  featuredStreamId === stream.id ? 'border-background/20 bg-background/10' : 'border-neutral-800 bg-neutral-900 group-hover:bg-neutral-800'
                }`}>
                   <span className="text-xs font-black">{stream.channelName[0].toUpperCase()}</span>
                </div>
                
                <div className="flex-1 text-left overflow-hidden">
                  <div className={`text-[11px] font-bold truncate leading-tight ${
                    featuredStreamId === stream.id ? 'text-background' : 'text-neutral-200'
                  }`}>
                    {stream.channelName.toLowerCase()}
                  </div>
                  <div className={`text-[9px] font-medium uppercase tracking-tighter opacity-60`}>
                    {stream.platform}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {featuredStreamId === stream.id && <Check size={14} />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStream(stream.id);
                    }}
                    className={`p-1.5 rounded-md transition-colors ${
                      featuredStreamId === stream.id 
                        ? 'hover:bg-background/20 text-background' 
                        : 'hover:bg-neutral-700 text-neutral-500 hover:text-red-400'
                    }`}
                    title="Remover live"
                  >
                    <X size={12} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

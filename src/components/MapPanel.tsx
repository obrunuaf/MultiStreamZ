import React, { useState } from 'react';
import { Map as MapIcon, X, Edit2, Globe } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

interface MapPanelProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ showCloseButton, onClose }) => {
  const { 
    streams, activeChatStreamId, customMapUrl, setCustomMapUrl, toggleMap 
  } = useStreamStore();

  const [isEditingMap, setIsEditingMap] = useState(false);
  const [mapInput, setMapInput] = useState(customMapUrl);
  const activeStream = streams.find(s => s.id === activeChatStreamId) || streams[0];

  const getMapUrl = () => {
    if (customMapUrl) return customMapUrl;
    
    // Mapping for test streamers
    const streamerMapIds: Record<string, string> = {
      'jonvlogs': 'twitch:103989988',
      'shevii2k': 'twitch:119611214',
      'linsjr': 'twitch:264931435'
    };

    if (activeStream) {
      const channelLower = activeStream.channelName.toLowerCase();
      if (streamerMapIds[channelLower]) {
        return `https://rtirl.com/${streamerMapIds[channelLower]}`;
      }
      return `https://rtirl.com/${activeStream.platform}:${activeStream.channelName}`;
    }
    
    return 'https://rtirl.com/';
  };

  const handleSaveMap = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomMapUrl(mapInput.trim());
    setIsEditingMap(false);
  };

  const handleResetMap = () => {
    setCustomMapUrl('');
    setMapInput('');
    setIsEditingMap(false);
  };

  return (
    <div className="relative flex flex-col bg-background overflow-hidden h-full">
      <div className="flex items-center justify-between px-3 py-2 bg-panel/30 border-b border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <MapIcon size={14} className="text-blue-400/50" />
          <span>MAPA RTIRL</span>
          <span title="URL Personalizada"><Globe size={11} className="text-blue-400" /></span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <button 
            onClick={() => {
              setMapInput(customMapUrl);
              setIsEditingMap(!isEditingMap);
            }}
            className={`p-1 hover:bg-white/5 rounded transition-colors ${isEditingMap ? 'text-white bg-white/10 shadow-inner' : ''}`}
            title="Personalizar URL do Mapa"
          >
            <Edit2 size={13} />
          </button>
          {showCloseButton && (
            <button onClick={onClose || toggleMap} className="hover:text-white p-1 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        {isEditingMap ? (
          <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black uppercase text-neutral-400 mb-3 tracking-widest">URL PERSONALIZADA</span>
            <form onSubmit={handleSaveMap} className="w-full max-w-70 space-y-3">
              <input 
                type="text"
                value={mapInput}
                onChange={(e) => setMapInput(e.target.value)}
                placeholder="https://exemplo.com/mapa"
                className="w-full bg-panel border border-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-white text-black py-2 rounded text-[10px] font-black uppercase border border-white hover:bg-neutral-200 transition-colors"
                >
                  Salvar
                </button>
                <button 
                  type="button" 
                  onClick={handleResetMap}
                  className="px-3 bg-panel text-neutral-400 py-2 rounded text-[10px] font-black uppercase border border-border hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditingMap(false)}
                className="text-[9px] text-neutral-600 hover:text-neutral-400 font-bold uppercase transition-colors"
              >
                Voltar
              </button>
            </form>
          </div>
        ) : null}

        <iframe
          key={getMapUrl()}
          src={getMapUrl()}
          className="w-full h-full border-none bg-black"
          title="RTIRL Map"
          loading="lazy"
        />
      </div>
    </div>
  );
};

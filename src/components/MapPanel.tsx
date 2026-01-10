import React from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { X, ExternalLink, Map as MapIcon } from 'lucide-react';

interface MapPanelProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ showCloseButton, onClose }) => {
  const { streams, customMapUrl, toggleMap } = useStreamStore();

  // Try to find a streamer who might have a map
  // RTIRL pattern often uses the channel name directly
  const getMapUrl = () => {
    if (customMapUrl) return customMapUrl;
    
    // Default to the first active stream if no custom URL
    if (streams.length > 0) {
      const activeStream = streams[0];
      return `https://rtirl.com/embed/${activeStream.channelName}`;
    }
    
    return 'https://rtirl.com/embed'; // Fallback
  };

  const currentUrl = getMapUrl();

  const handlePopout = () => {
    window.open(currentUrl, '_blank', 'width=800,height=600,location=no,menubar=no,status=no,toolbar=no');
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-panel/30">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <MapIcon size={14} className="text-blue-400/50" />
          <span>Mapa RTIRL</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePopout}
            className="text-neutral-500 hover:text-white transition-colors p-1"
            title="Abrir em nova janela"
          >
            <ExternalLink size={14} />
          </button>
          {showCloseButton && (
            <button 
              onClick={onClose || toggleMap}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 bg-black overflow-hidden relative">
        <iframe
          src={currentUrl}
          className="w-full h-full border-none"
          title="RTIRL Map"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    </div>
  );
};

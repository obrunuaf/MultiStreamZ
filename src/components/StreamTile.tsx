import React, { useState } from 'react';
import { useStreamStore, type Stream } from '../store/useStreamStore';
import { Maximize2, Volume2, VolumeX, X, MoreHorizontal, PictureInPicture, GripHorizontal, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StreamTileProps {
  stream: Stream;
  isFeatured?: boolean;
}

export const StreamTile: React.FC<StreamTileProps> = ({ stream, isFeatured }) => {
  const { removeStream, toggleStreamMute } = useStreamStore();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stream.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const getEmbedUrl = () => {
    if (stream.platform === 'twitch') {
      // Note: volume can't be controlled via URL params, only muted state
      return `https://player.twitch.tv/?channel=${stream.channelName}&parent=${window.location.hostname}&muted=${stream.isMuted ? 'true' : 'false'}`;
    }
    if (stream.platform === 'kick') {
      return `https://player.kick.com/${stream.channelName}`;
    }
    return '';
  };
  
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group relative w-full h-full bg-black overflow-hidden transition-all duration-300 ${
        isDragging ? 'opacity-50 scale-95 z-50' : 'opacity-100'
      } ${
        isFeatured ? 'border-2 border-neutral-100 ring-4 ring-neutral-100/5' : 'border border-border'
      }`}
    >
      {/* Video Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
         
         {/* Kick Platform - Try embed, fallback to link if blocked */}
         {stream.platform === 'kick' && (
           <>
             {/* Kick Loading State */}
             {isLoading && !hasError && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-5">
                 <div className="animate-spin mb-2">
                   <RefreshCw size={24} className="text-kick" />
                 </div>
                 <span className="text-[10px] font-bold text-neutral-600 uppercase">Conectando ao Kick...</span>
               </div>
             )}
             
             {/* Kick Error Fallback - CSP blocked */}
             {hasError && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-10 p-4">
                 <div className="w-16 h-16 rounded-full bg-kick/10 border-2 border-kick/30 flex items-center justify-center mb-4">
                   <span className="text-2xl font-black text-kick">{stream.channelName[0].toUpperCase()}</span>
                 </div>
                 <span className="text-xl font-black text-white mb-1">{stream.channelName}</span>
                 <div className="px-2 py-0.5 bg-kick rounded text-[10px] font-black text-black uppercase mb-4">KICK</div>
                 <a 
                   href={`https://kick.com/${stream.channelName}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-kick hover:bg-kick/80 rounded-lg text-sm font-bold text-black uppercase transition-colors flex items-center gap-2"
                 >
                   Assistir no Kick
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                   </svg>
                 </a>
                 <span className="text-[9px] text-neutral-600 mt-3 text-center">Kick bloqueia embeds em localhost</span>
               </div>
             )}
             
             {/* Kick Iframe - works on production domains */}
             {!hasError && (
               <iframe
                 src={`https://player.kick.com/${stream.channelName}`}
                 className={`w-full h-full border-none pointer-events-auto ${isDragging ? 'pointer-events-none' : ''}`}
                 allowFullScreen
                 onLoad={() => setIsLoading(false)}
                 onError={() => { setHasError(true); setIsLoading(false); }}
               />
             )}
           </>
         )}
         
         {/* Twitch Embed */}
         {stream.platform === 'twitch' && (
           <>
             {/* Loading State */}
             {isLoading && !hasError && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-5">
                 <div className="animate-spin mb-2">
                   <RefreshCw size={24} className="text-neutral-500" />
                 </div>
                 <span className="text-[10px] font-bold text-neutral-600 uppercase">Carregando...</span>
               </div>
             )}
             
             {/* Error State */}
             {hasError && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-10 p-4">
                 <AlertTriangle size={32} className="text-red-500/50 mb-2" />
                 <span className="text-[11px] font-bold text-neutral-400 uppercase mb-1">Erro ao carregar</span>
                 <span className="text-[10px] text-neutral-600 text-center mb-3">{stream.channelName} ({stream.platform})</span>
                 <button 
                   onClick={handleRetry}
                   className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-[10px] font-bold text-neutral-300 uppercase transition-colors"
                 >
                   Tentar novamente
                 </button>
               </div>
             )}
             
             {!hasError && (
               <iframe
                  src={getEmbedUrl()}
                  className={`w-full h-full border-none pointer-events-auto ${isDragging ? 'pointer-events-none' : ''}`}
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                  onError={() => { setHasError(true); setIsLoading(false); }}
               />
             )}
           </>
         )}
         
         {isDragging && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <GripHorizontal size={32} className="text-white/50" />
         </div>}
      </div>

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
            stream.platform === 'twitch' ? 'bg-twitch text-white' : 
            stream.platform === 'kick' ? 'bg-kick text-black' : 'bg-neutral-600'
          }`}>
            {stream.platform}
          </div>
          <span className="text-xs font-semibold text-neutral-100 drop-shadow-md">{stream.channelName}</span>
        </div>
        <div className="flex items-center gap-1 pointer-events-auto">
          <button 
            {...attributes}
            {...listeners}
            className="p-1.5 hover:bg-neutral-700/50 rounded-md text-neutral-300 hover:text-white transition-colors cursor-grab active:cursor-grabbing"
            title="Arrastar para ordenar"
          >
            <GripHorizontal size={14} />
          </button>
          <button className="p-1.5 hover:bg-neutral-700/50 rounded-md text-neutral-300 hover:text-white transition-colors">
            <PictureInPicture size={14} />
          </button>
          <button 
            onClick={() => removeStream(stream.id)}
            className="p-1.5 hover:bg-red-500/20 rounded-md text-neutral-300 hover:text-red-400 transition-colors"
            title="Remover"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
           <button 
             onClick={() => toggleStreamMute(stream.id)}
             className={`p-2 rounded-full transition-colors ${
               stream.isMuted ? 'text-red-500 bg-red-500/10' : 'text-white hover:bg-white/10'
             }`}
             title={stream.isMuted ? 'Ativar som' : 'Mutar'}
           >
             {stream.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
           </button>
           
            {isFeatured && (
              <div className="flex items-center gap-2 px-2 py-1 bg-neutral-100 rounded-sm">
                <span className="text-[9px] font-black text-background uppercase">Destaque</span>
              </div>
            )}
        </div>
        <div className="flex items-center gap-1 pointer-events-auto">
          <button className="p-1.5 hover:bg-neutral-700/50 rounded-md text-neutral-300 hover:text-white transition-colors border border-transparent">
             <Maximize2 size={16} />
          </button>
          <button className="p-1.5 hover:bg-neutral-700/50 rounded-md text-neutral-300 hover:text-white transition-colors">
             <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { useStreamStore, type Stream } from '../store/useStreamStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripHorizontal, RefreshCw, Volume2, VolumeX, Radio } from 'lucide-react';

interface StreamSlotProps {
  stream: Stream;
}

export const StreamSlot: React.FC<StreamSlotProps> = ({ stream }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setStreamRect, removeStream, reloadStream, setStreamVolume, toggleStreamMute, setFeaturedStream } = useStreamStore();

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

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStreamRect(stream.id, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateRect();
    const observer = new ResizeObserver(updateRect);
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      setStreamRect(stream.id, null);
    };
  }, [stream.id, setStreamRect]);

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      style={style}
      className={`group w-full h-full relative border border-border/10 rounded-lg overflow-hidden transition-opacity duration-300 ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* UI Controls - Always on top of the portal layer */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-100 pointer-events-none">
        <div className="flex items-center bg-black/60 backdrop-blur-md rounded-md border border-white/10 pointer-events-auto overflow-hidden shadow-xl">
          <button 
            {...attributes}
            {...listeners}
            className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-grab active:cursor-grabbing"
            title="Arrastar"
          >
            <GripHorizontal size={14} />
          </button>
          
          <div className="w-px h-3 bg-white/10" />

          <button 
            onClick={() => reloadStream(stream.id)}
            className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Recarregar live"
          >
            <RefreshCw size={14} />
          </button>
          
          <div className="w-px h-3 bg-white/10" />

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 px-2 bg-white/5">
            <button 
              onClick={() => toggleStreamMute(stream.id)}
              className={`text-neutral-400 hover:text-white transition-colors p-0.5 ${stream.isMuted ? 'text-red-400' : ''}`}
            >
              {stream.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={stream.isMuted ? 0 : stream.volume} 
              onChange={(e) => setStreamVolume(stream.id, parseFloat(e.target.value))}
              className="w-16 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="w-px h-3 bg-white/10" />

          {/* Solo Button */}
          <button 
            onClick={() => setFeaturedStream(stream.id)}
            className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-purple-400 transition-colors flex items-center gap-1"
            title="Solo (Muta os outros)"
          >
            <Radio size={14} />
            <span className="text-[9px] font-black uppercase">SOLO</span>
          </button>

          <div className="w-px h-3 bg-white/10" />

          <button 
            onClick={() => removeStream(stream.id)}
            className="p-1.5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
            title="Remover"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Placeholder Label (visible through the video if desired or when loading) */}
      <div className="absolute bottom-2 left-2 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity z-100">
        <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {stream.channelName}
        </span>
      </div>
    </div>
  );
};

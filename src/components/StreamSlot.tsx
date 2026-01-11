import React, { useRef, useEffect } from 'react';
import { useStreamStore, type Stream } from '../store/useStreamStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripHorizontal, RefreshCw, Radio } from 'lucide-react';

interface StreamSlotProps {
  stream: Stream;
}

export const StreamSlot: React.FC<StreamSlotProps> = ({ stream }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setStreamRect, removeStream, reloadStream, setFeaturedStream } = useStreamStore();

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
      className={`group w-full h-full relative rounded-lg overflow-hidden transition-all duration-300 z-50 pointer-events-none ${
        isDragging ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* UI Controls - Individual Discreet Buttons */}
      <div className="absolute top-2 right-2 flex flex-row-reverse items-center gap-1.5 pointer-events-none z-100">
        
        {/* Remove Button - Most critical right */}
        <button 
          onClick={() => removeStream(stream.id)}
          className="p-1.5 bg-black/40 hover:bg-red-500/80 text-white/40 hover:text-white rounded-lg backdrop-blur-md border border-white/5 transition-all pointer-events-auto active:scale-95"
          title="Remover"
        >
          <X size={14} />
        </button>

        {/* Refresh Button - User requested primary visibility */}
        <button 
          onClick={() => reloadStream(stream.id)}
          className="p-2 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto active:scale-95 shadow-xl"
          title="Recarregar"
        >
          <RefreshCw size={14} strokeWidth={2.5} />
        </button>

        {/* Mover Button - Discreet Circle */}
        <button 
          {...attributes}
          {...listeners}
          className="p-2 bg-black/40 hover:bg-black/80 text-white/80 hover:text-primary rounded-full backdrop-blur-md border border-white/10 transition-all pointer-events-auto cursor-grab active:cursor-grabbing shadow-xl"
          title="Mover"
        >
          <GripHorizontal size={14} strokeWidth={2.5} />
        </button>

        {/* Solo Button - Discreet */}
        <button 
          onClick={() => setFeaturedStream(stream.id)}
          className="p-2 bg-black/40 hover:bg-purple-500/40 text-white/40 hover:text-purple-300 rounded-full backdrop-blur-md border border-white/5 transition-all pointer-events-auto hidden sm:block"
          title="Solo"
        >
          <Radio size={14} />
        </button>
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

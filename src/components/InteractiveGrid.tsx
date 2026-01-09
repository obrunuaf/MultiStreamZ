import React, { useState, useRef } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSlot } from './StreamSlot';

export const InteractiveGrid: React.FC = () => {
  const { streams, gridProportions, updateGridProportion } = useStreamStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<'col' | 'row' | null>(null);

  if (streams.length === 0) return null;

  const handleMouseDown = (type: 'col' | 'row') => {
    setIsResizing(type);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      let percent = 0;
      
      if (type === 'col') {
        percent = ((e.clientX - rect.left) / rect.width) * 100;
        updateGridProportion('columns', 0, Math.min(Math.max(10, percent), 90));
      } else {
        percent = ((e.clientY - rect.top) / rect.height) * 100;
        updateGridProportion('rows', 0, Math.min(Math.max(10, percent), 90));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 1 Stream: Full
  if (streams.length === 1) {
    return (
      <div className="flex-1 w-full h-full p-2">
        <StreamSlot stream={streams[0]} />
      </div>
    );
  }

  // 2 Streams: Side by Side (Vertical Splitter)
  if (streams.length === 2) {
    return (
      <div ref={containerRef} className="flex-1 flex w-full h-full overflow-hidden p-1 relative">
        <div style={{ width: `${gridProportions.columns[0]}%` }} className="h-full pr-0.5">
          <StreamSlot stream={streams[0]} />
        </div>
        
        {/* Splitter */}
        <div 
          onMouseDown={() => handleMouseDown('col')}
          className={`group absolute top-0 bottom-0 z-50 cursor-col-resize flex items-center justify-center transition-all ${
            isResizing === 'col' ? 'w-2 bg-blue-500/50' : 'w-1 hover:bg-white/10'
          }`}
          style={{ left: `calc(${gridProportions.columns[0]}% - 2px)` }}
        >
          <div className="w-1 h-8 bg-white/20 rounded-full group-hover:bg-white/50" />
        </div>

        <div style={{ width: `${100 - gridProportions.columns[0]}%` }} className="h-full pl-0.5">
          <StreamSlot stream={streams[1]} />
        </div>
      </div>
    );
  }

  // 3-4 Streams: 2x2 Grid with Cross Splitters
  const topStreams = streams.slice(0, 2);
  const bottomStreams = streams.slice(2, 4);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col w-full h-full overflow-hidden p-1 relative">
      {/* Top Row */}
      <div style={{ height: `${gridProportions.rows[0]}%` }} className="flex w-full pb-0.5 relative">
        <div style={{ width: `${gridProportions.columns[0]}%` }} className="h-full pr-0.5">
          <StreamSlot stream={topStreams[0]} />
        </div>
        
        <div style={{ width: `${100 - gridProportions.columns[0]}%` }} className="h-full pl-0.5">
          {topStreams[1] && <StreamSlot stream={topStreams[1]} />}
        </div>
      </div>

      {/* Main Horizontal Splitter */}
      <div 
        onMouseDown={() => handleMouseDown('row')}
        className={`group absolute left-0 right-0 z-50 cursor-row-resize flex items-center justify-center transition-all ${
          isResizing === 'row' ? 'h-2 bg-blue-500/50' : 'h-1 hover:bg-white/10'
        }`}
        style={{ top: `calc(${gridProportions.rows[0]}% - 2px)` }}
      >
        <div className="h-1 w-8 bg-white/20 rounded-full group-hover:bg-white/50" />
      </div>

      {/* Main Vertical Splitter */}
      <div 
        onMouseDown={() => handleMouseDown('col')}
        className={`group absolute top-0 bottom-0 z-50 cursor-col-resize flex items-center justify-center transition-all ${
          isResizing === 'col' ? 'w-2 bg-blue-500/50' : 'w-1 hover:bg-white/10'
        }`}
        style={{ left: `calc(${gridProportions.columns[0]}% - 2px)` }}
      >
        <div className="w-1 h-8 bg-white/20 rounded-full group-hover:bg-white/50" />
      </div>

      {/* Bottom Row */}
      <div style={{ height: `${100 - gridProportions.rows[0]}%` }} className="flex w-full pt-0.5">
        <div style={{ width: `${gridProportions.columns[0]}%` }} className="h-full pr-0.5">
          {bottomStreams[0] && <StreamSlot stream={bottomStreams[0]} />}
        </div>
        <div style={{ width: `${100 - gridProportions.columns[0]}%` }} className="h-full pl-0.5">
          {bottomStreams[1] && <StreamSlot stream={bottomStreams[1]} />}
        </div>
      </div>
    </div>
  );
};

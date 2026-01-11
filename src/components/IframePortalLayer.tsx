import React, { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamTile } from './StreamTile';

type Rect = { top: number; left: number; width: number; height: number };

export const IframePortalLayer: React.FC = () => {
  const streams = useStreamStore((state) => state.streams);
  const streamRects = useStreamStore((state) => state.streamRects);
  const featuredStreamId = useStreamStore((state) => state.featuredStreamId);

  // Buffer for rects to prevent iframe unmounting during layout transitions
  const persistentRectsRef = useRef<Record<string, Rect>>({});
  const [, forceUpdate] = useState(0);

  // Synchronize the buffer with the live rects
  useLayoutEffect(() => {
    let changed = false;
    Object.entries(streamRects).forEach(([id, rect]) => {
      if (rect && (rect.width > 0 || rect.height > 0)) {
        if (JSON.stringify(persistentRectsRef.current[id]) !== JSON.stringify(rect)) {
          persistentRectsRef.current[id] = rect;
          changed = true;
        }
      }
    });
    if (changed) {
      forceUpdate(v => v + 1);
    }
  }, [streamRects]);

  const stableStreams = useMemo(() => [...streams].sort((a, b) => a.id.localeCompare(b.id)), [streams]);

  // Read current buffer snapshot for this render
  const currentRects = persistentRectsRef.current;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {stableStreams.map((stream) => {
        const liveRect = streamRects[stream.id];
        // Use the snapshot value if the live rect is missing (during transitions)
        const rect = liveRect || currentRects[stream.id];
        
        if (!rect) return null;

        return (
          <div
            key={stream.id}
            className="absolute pointer-events-auto"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              zIndex: stream.id === featuredStreamId ? 20 : 10,
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: liveRect ? 1 : 0,
              visibility: liveRect ? 'visible' : 'hidden',
            }}
          >
            <StreamTile 
              stream={stream} 
              isFeatured={stream.id === featuredStreamId} 
            />
          </div>
        );
      })}
    </div>
  );
};

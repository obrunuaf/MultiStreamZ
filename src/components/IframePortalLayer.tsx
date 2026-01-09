import React from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamTile } from './StreamTile';

export const IframePortalLayer: React.FC = () => {
  const streams = useStreamStore((state) => state.streams);
  const streamRects = useStreamStore((state) => state.streamRects);
  const featuredStreamId = useStreamStore((state) => state.featuredStreamId);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {streams.map((stream) => {
        const rect = streamRects[stream.id];
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

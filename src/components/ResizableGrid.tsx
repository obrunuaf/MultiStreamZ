import React, { useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { StreamSlot } from './StreamSlot';
import { useStreamStore, type Stream } from '../store/useStreamStore';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface ResizableGridProps {
  streams: Stream[];
}

const ResizeHandle = ({ className = '', id }: { className?: string, id?: string }) => {
  const { setIsResizing } = useStreamStore();

  return (
    <Separator
      id={id}
      className={`relative flex items-center justify-center bg-white/5 active:bg-primary/20 transition-colors z-50 ${className}`}
      onMouseDown={() => setIsResizing(true)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`rounded-full bg-primary/40 ${className.includes('w-') ? 'w-0.5 h-8' : 'h-0.5 w-8'}`} />
      </div>
      {/* Invisible hit area expansion */}
      <div className="absolute inset-0 -m-1" />
    </Separator>
  );
};

export const ResizableGrid: React.FC<ResizableGridProps> = ({ streams }) => {
  const { setIsResizing } = useStreamStore();
  const count = streams.length;

  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [setIsResizing]);

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="w-full h-full">
        <StreamSlot stream={streams[0]} />
      </div>
    );
  }

  const content = () => {
    if (count === 2) {
      return (
        <Group orientation="horizontal" className="w-full h-full">
          <Panel key={streams[0].id} defaultSize={50} minSize={20}>
            <StreamSlot stream={streams[0]} />
          </Panel>
          <ResizeHandle className="w-1.5" />
          <Panel key={streams[1].id} defaultSize={50} minSize={20}>
            <StreamSlot stream={streams[1]} />
          </Panel>
        </Group>
      );
    }

    if (count === 3) {
      return (
        <Group orientation="vertical" className="w-full h-full">
          <Panel defaultSize={50} minSize={20}>
            <Group orientation="horizontal">
              <Panel key={streams[0].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[0]} />
              </Panel>
              <ResizeHandle className="w-1.5" />
              <Panel key={streams[1].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[1]} />
              </Panel>
            </Group>
          </Panel>
          <ResizeHandle className="h-1.5" />
          <Panel key={streams[2].id} defaultSize={50} minSize={20}>
            <StreamSlot stream={streams[2]} />
          </Panel>
        </Group>
      );
    }

    if (count === 4) {
      return (
        <Group orientation="vertical" className="w-full h-full">
          <Panel defaultSize={50} minSize={20}>
            <Group orientation="horizontal">
              <Panel key={streams[0].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[0]} />
              </Panel>
              <ResizeHandle className="w-1.5" />
              <Panel key={streams[1].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[1]} />
              </Panel>
            </Group>
          </Panel>
          <ResizeHandle className="h-1.5" />
          <Panel defaultSize={50} minSize={20}>
            <Group orientation="horizontal">
              <Panel key={streams[2].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[2]} />
              </Panel>
              <ResizeHandle className="w-1.5" />
              <Panel key={streams[3].id} defaultSize={50} minSize={20}>
                <StreamSlot stream={streams[3]} />
              </Panel>
            </Group>
          </Panel>
        </Group>
      );
    }

    // Fallback for 5+ streams
    const rows = Math.ceil(Math.sqrt(count));
    const perRow = Math.ceil(count / rows);
    
    return (
      <Group orientation="vertical" className="w-full h-full">
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const rowStreams = streams.slice(rowIndex * perRow, (rowIndex + 1) * perRow);
          if (rowStreams.length === 0) return null;

          return (
            <React.Fragment key={`row-${rowIndex}`}>
              <Panel defaultSize={100 / rows} minSize={10}>
                <Group orientation="horizontal">
                  {rowStreams.map((stream, colIndex) => (
                    <React.Fragment key={stream.id}>
                      <Panel defaultSize={100 / rowStreams.length} minSize={10}>
                        <StreamSlot stream={stream} />
                      </Panel>
                      {colIndex < rowStreams.length - 1 && (
                        <ResizeHandle className="w-1.5" />
                      )}
                    </React.Fragment>
                  ))}
                </Group>
              </Panel>
              {rowIndex < rows - 1 && (
                <ResizeHandle className="h-1.5" />
              )}
            </React.Fragment>
          );
        })}
      </Group>
    );
  };

  return (
    <div className="w-full h-full">
      <SortableContext items={streams.map(s => s.id)} strategy={rectSortingStrategy}>
        {content()}
      </SortableContext>
    </div>
  );
};

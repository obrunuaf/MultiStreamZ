import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStreamStore } from '../store/useStreamStore';
import { StreamTile } from './StreamTile';
import { Plus } from 'lucide-react';

export const StreamGrid: React.FC = () => {
  const { streams, featuredStreamId, layoutType, reorderStreams, setFeaturedStream } = useStreamStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = streams.findIndex((s) => s.id === active.id);
      const newIndex = streams.findIndex((s) => s.id === over.id);
      const newStreams = arrayMove(streams, oldIndex, newIndex);
      
      reorderStreams(newStreams);
      
      // If we are in a layout that uses a featured stream, 
      // the one at index 0 is now the featured one.
      if (layoutType === 'featured' || layoutType === 'sidebar') {
        setFeaturedStream(newStreams[0].id);
      }
    }
  };

  if (streams.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
          <Plus size={32} className="opacity-20" />
        </div>
        <h2 className="text-lg font-medium text-neutral-300 mb-1">Nenhuma live ativa</h2>
        <p className="text-sm">Adicione uma live da Twitch ou Kick para começar.</p>
      </div>
    );
  }

  const featuredStream = streams[0];
  const otherStreams = streams.slice(1);

  const renderContent = () => {
    // Layout: FEATURED
    if (layoutType === 'featured' && featuredStream && otherStreams.length > 0) {
      return (
        <div className="flex-1 flex flex-col md:flex-row gap-0.5 p-0.5 bg-border/20 overflow-hidden">
          <div className="flex-3 min-h-[50%] md:min-h-0">
            <StreamTile stream={featuredStream} isFeatured={true} />
          </div>
          <div className={`flex-1 grid gap-0.5 overflow-y-auto ${
            otherStreams.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {otherStreams.map((stream) => (
              <StreamTile key={stream.id} stream={stream} isFeatured={false} />
            ))}
          </div>
        </div>
      );
    }

    // Layout: SIDEBAR (Vertical list on the right)
    if (layoutType === 'sidebar' && featuredStream && otherStreams.length > 0) {
      return (
        <div className="flex-1 flex flex-col md:flex-row gap-0.5 p-0.5 bg-border/20 overflow-hidden">
          <div className="flex-4 h-full">
            <StreamTile stream={featuredStream} isFeatured={true} />
          </div>
          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto min-w-60">
            {otherStreams.map((stream) => (
              <div key={stream.id} className="aspect-video w-full shrink-0">
                <StreamTile stream={stream} isFeatured={false} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Layout: COLUMNS (Equal vertical columns)
    if (layoutType === 'columns') {
      return (
        <div className="flex-1 flex flex-row gap-0.5 p-0.5 bg-border/20 overflow-x-auto">
          {streams.map((stream) => (
            <div key={stream.id} className="flex-1 min-w-75 h-full">
              <StreamTile stream={stream} isFeatured={stream.id === featuredStreamId} />
            </div>
          ))}
        </div>
      );
    }

    // Layout: GRID (Balanced)
    const getGridClass = () => {
      const count = streams.length;
      if (count === 1) return 'grid-cols-1 grid-rows-1';
      if (count === 2) return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
      if (count <= 4) return 'grid-cols-2 grid-rows-2';
      if (count <= 6) return 'grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2';
      return 'grid-cols-3 grid-rows-3';
    };

    return (
      <div className={`flex-1 grid gap-0.5 p-0.5 bg-border/20 ${getGridClass()}`}>
        {streams.map((stream) => (
          <StreamTile key={stream.id} stream={stream} isFeatured={stream.id === featuredStreamId} />
        ))}
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={streams.map(s => s.id)}
        strategy={rectSortingStrategy}
      >
        {renderContent()}
      </SortableContext>
    </DndContext>
  );
};

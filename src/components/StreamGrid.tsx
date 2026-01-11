import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragMoveEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSlot } from './StreamSlot';
import { FlexGrid } from './FlexGrid';
import { SnapFlyout } from './SnapFlyout';
import { Plus, GripHorizontal } from 'lucide-react';
import { ResizableGrid } from './ResizableGrid';

export const StreamGrid: React.FC = () => {
  const { streams, layoutType, reorderStreams, setFeaturedStream, setLayoutType, setIsDragging } = useStreamStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSnapFlyout, setShowSnapFlyout] = useState(false);
  const [ghostLayout, setGhostLayout] = useState<string | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { clientY } = event.activatorEvent as MouseEvent;
    
    // Show flyout if dragging near top
    const shouldShow = clientY < 100;
    if (shouldShow !== showSnapFlyout) {
      setShowSnapFlyout(shouldShow);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
    setShowSnapFlyout(false);
    setGhostLayout(null);

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = streams.findIndex((s) => s.id === active.id);
      const newIndex = streams.findIndex((s) => s.id === over.id);
      const newStreams = arrayMove(streams, oldIndex, newIndex);
      
      reorderStreams(newStreams);
      
      // Force a global layout sync after DND stabilization
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      
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

  if (layoutType === 'interactive') {
    return <FlexGrid />;
  }

  const activeStream = streams.find(s => s.id === activeId);
  
  // Inline grid config to avoid Tailwind specificity issues
  const gridStyle: React.CSSProperties = {};
  if (layoutType === 'featured') {
    gridStyle.gridTemplateColumns = '3fr 1fr';
    gridStyle.gridTemplateRows = `repeat(${Math.max(1, streams.length - 1)}, 1fr)`;
  } else if (layoutType === 'sidebar') {
    gridStyle.gridTemplateColumns = '1fr 3fr';
    gridStyle.gridTemplateRows = `repeat(${Math.max(1, streams.length - 1)}, 1fr)`;
  } else if (layoutType === 'grid') {
    const cols = streams.length <= 1 ? 1 : 2;
    gridStyle.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  }
  
  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="flex-1 stream-grid-container relative"
      >
        <SnapFlyout 
          isVisible={showSnapFlyout}
          onHoverLayout={setGhostLayout}
          onSelectLayout={(id) => {
            setLayoutType(id as 'grid' | 'featured' | 'sidebar' | 'columns' | 'interactive');
            setShowSnapFlyout(false);
          }}
        />

        {ghostLayout && (
          <div 
            className="ghost-preview"
            style={{
              inset: ghostLayout === 'featured' ? '4px 25% 4px 4px' : 
                     ghostLayout === 'sidebar' ? '4px 4px 4px 75%' : 
                     '4px',
              width: ghostLayout === 'featured' ? '75%' : 
                     ghostLayout === 'sidebar' ? '25%' : 'auto',
              left: ghostLayout === 'sidebar' ? '75%' : '4px',
              height: 'calc(100% - 8px)'
            }}
          />
        )}

        {layoutType === 'grid' ? (
          <ResizableGrid streams={streams} />
        ) : (
          <SortableContext 
            items={streams.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            <div 
              className="flex-1 grid gap-1 w-full h-full min-h-0 min-w-0 pb-16 md:pb-0"
              style={gridStyle}
            >
                {streams.map((stream, logicalIndex) => {
                  const isFeatured = (layoutType === 'featured' || layoutType === 'sidebar') && logicalIndex === 0;
                  const isSidebarItem = (layoutType === 'featured' || layoutType === 'sidebar') && logicalIndex > 0;

                  const slotStyle: React.CSSProperties = {
                    opacity: activeId === stream.id ? 0.3 : 1,
                  };

                  // Dynamic grid positioning for featured/sidebar layouts
                  if (layoutType === 'featured') {
                    if (isFeatured) {
                      slotStyle.gridColumn = '1';
                      slotStyle.gridRow = `1 / span ${Math.max(1, streams.length - 1)}`;
                    } else {
                      slotStyle.gridColumn = '2';
                    }
                  } else if (layoutType === 'sidebar') {
                    if (isFeatured) {
                      slotStyle.gridColumn = '2';
                      slotStyle.gridRow = `1 / span ${Math.max(1, streams.length - 1)}`;
                    } else {
                      slotStyle.gridColumn = '1';
                    }
                  }

                  return (
                    <div 
                      key={stream.id} 
                      className={`w-full h-full relative min-h-0 min-w-0 ${
                        isFeatured ? 'tile-featured' : 
                        isSidebarItem ? 'tile-sidebar' : ''
                      }`}
                      style={slotStyle}
                    >
                      <StreamSlot stream={stream} />
                    </div>
                  );
                })}
            </div>
          </SortableContext>
        )}

        <DragOverlay adjustScale={false} dropAnimation={null} style={{ zIndex: 99999 }}>
          {activeId && activeStream ? (
            <div className="w-64 h-36 bg-surface/90 border-2 border-primary/50 rounded-xl flex flex-col items-center justify-center p-4 shadow-2xl backdrop-blur-xl ring-4 ring-primary/20 pointer-events-none scale-105">
              <GripHorizontal size={24} className="text-primary mb-2 animate-bounce" />
              <span className="text-xs font-black text-white uppercase tracking-widest">{activeStream.channelName}</span>
              <span className="text-[10px] text-primary font-bold uppercase">{activeStream.platform}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

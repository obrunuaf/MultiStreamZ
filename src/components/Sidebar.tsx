import React, { useRef, useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { ChevronLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { MapPanel } from './MapPanel';

export const Sidebar: React.FC = () => {
  const { 
    sidebarVisible, toggleSidebar, chatVisible, toggleChat, 
    mapVisible, toggleMap, sidebarWidth, setSidebarWidth,
    mapHeight, setMapHeight, mobileCinemaMode
  } = useStreamStore();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingMap = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 800) {
          setSidebarWidth(newWidth);
        }
      }
      if (isResizingMap.current) {
        const rect = sidebarRef.current?.getBoundingClientRect();
        if (rect) {
          const newHeight = e.clientY - rect.top;
          if (newHeight > 100 && newHeight < rect.height - 100) {
            setMapHeight(newHeight);
          }
        }
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingMap.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSidebarWidth, setMapHeight]);

  // Hide the sidebar trigger button on mobile to avoid UI clutter
  const toggleButton = (
    <button 
      onClick={toggleSidebar}
      className={`fixed right-0 top-1/2 -translate-y-1/2 bg-panel border-l border-y border-border p-1.5 rounded-l-md hover:bg-surface text-neutral-400 z-50 transition-all duration-300 hidden md:flex ${
        sidebarVisible ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 shadow-[-5px_0_15px_rgba(0,0,0,0.3)]'
      }`}
    >
      <ChevronLeft size={20} className="rotate-180" />
    </button>
  );

  return (
    <>
      <aside 
      ref={sidebarRef}
      className={`glass-panel flex flex-col relative z-40 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${mobileCinemaMode ? 'hidden' : 'flex'}`}
      style={{ 
        width: sidebarVisible ? `${sidebarWidth}px` : '0px',
        height: '100%',
        opacity: sidebarVisible ? 1 : 0,
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(40px)',
        pointerEvents: sidebarVisible ? 'auto' : 'none',
        borderLeft: '1px solid var(--glass-border)'
      }}
    >
      <div 
        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-neutral-600 transition-colors z-50 -ml-0.75 hidden md:block"
        onMouseDown={() => {
          isResizingSidebar.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />

      {/* Map Panel */}
      {mapVisible && (
        <div 
          className="relative flex flex-col bg-background overflow-hidden border-b border-border shrirnk-0"
          style={{ height: `${mapHeight}px` }}
        >
          <MapPanel showCloseButton onClose={toggleMap} />
          
          <div 
            className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-neutral-600 transition-colors z-50 hidden md:block"
            onMouseDown={() => {
              isResizingMap.current = true;
              document.body.style.cursor = 'row-resize';
            }}
          />
        </div>
      )}

      {/* Chat Panel */}
      <div className={`flex flex-col overflow-hidden transition-all duration-500 ${chatVisible ? 'h-full' : 'h-0'}`}>
        {chatVisible && <ChatPanel showCloseButton onClose={toggleChat} />}
      </div>

    </aside>
    {toggleButton}
  </>
);
};

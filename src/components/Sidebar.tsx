import React, { useRef, useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { ChevronLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';

export const Sidebar: React.FC = () => {
  const { 
    sidebarVisible, toggleSidebar, chatVisible, toggleChat, 
    sidebarWidth, setSidebarWidth
  } = useStreamStore();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 800) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSidebarWidth]);

  const toggleButton = (
    <button 
      onClick={toggleSidebar}
      className={`fixed right-0 top-1/2 -translate-y-1/2 bg-panel border-l border-y border-border p-1.5 rounded-l-md hover:bg-surface text-neutral-400 z-50 transition-all duration-300 ${
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
      className="h-full border-l border-border bg-background flex flex-col relative z-40 transition-all duration-300 ease-in-out"
      style={{ 
        width: sidebarVisible ? `${sidebarWidth}px` : '0px',
        opacity: sidebarVisible ? 1 : 0,
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(20px)',
        pointerEvents: sidebarVisible ? 'auto' : 'none'
      }}
    >
      <div 
        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-neutral-600 transition-colors z-50 -ml-0.75"
        onMouseDown={() => {
          isResizingSidebar.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {chatVisible && <ChatPanel showCloseButton onClose={toggleChat} />}
      </div>

    </aside>
    {toggleButton}
  </>
);
};

import React, { useRef, useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { ChevronLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { MapPanel } from './MapPanel';
import { SidebarStreamList } from './SidebarStreamList';
import { useState } from 'react';

export const Sidebar: React.FC = () => {
  const { 
    sidebarVisible, toggleSidebar, chatVisible, toggleChat, 
    mapVisible, toggleMap, sidebarWidth, setSidebarWidth,
    mapHeight, setMapHeight
  } = useStreamStore();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingMap = useRef(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'chat'>('chat');


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
      {/* Sidebar Resize Handle */}
      <div 
        className="absolute left-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-neutral-600 transition-colors z-50 -ml-0.75"
        onMouseDown={() => {
          isResizingSidebar.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />

      {/* Sidebar Content Tabs */}
      <div className="flex items-center border-b border-white/5 bg-black/20">
         <button 
           onClick={() => setActiveTab('chat')}
           className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
             activeTab === 'chat' ? 'text-white border-white' : 'text-neutral-600 border-transparent hover:text-neutral-400'
           }`}
         >
           Chat Global
         </button>
         <button 
           onClick={() => setActiveTab('monitor')}
           className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
             activeTab === 'monitor' ? 'text-white border-white' : 'text-neutral-600 border-transparent hover:text-neutral-400'
           }`}
         >
           Monitoring
         </button>
      </div>

      {/* Map Panel (Always on top if visible) */}
      {mapVisible && (
        <div 
          className="relative flex flex-col bg-background overflow-hidden border-b border-border"
          style={{ height: `${mapHeight}px` }}
        >
          <MapPanel showCloseButton onClose={toggleMap} />
          
          <div 
            className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-neutral-500 transition-colors z-50"
            onMouseDown={() => {
              isResizingMap.current = true;
              document.body.style.cursor = 'row-resize';
            }}
          />
        </div>
      )}

      {/* Active Tab Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chat' && chatVisible && <ChatPanel showCloseButton onClose={toggleChat} />}
        {activeTab === 'monitor' && <SidebarStreamList />}
      </div>

    </aside>
    {toggleButton}
  </>
);
};

import React, { useRef, useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { ChevronLeft, Map as MapIcon, MessageSquare, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    sidebarVisible, toggleSidebar, chatVisible, toggleChat, 
    mapVisible, toggleMap, sidebarWidth, setSidebarWidth,
    mapHeight, setMapHeight
  } = useStreamStore();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingMap = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 600) {
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

  if (!sidebarVisible) {
    return (
      <button 
        onClick={toggleSidebar}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-panel border-l border-y border-border p-1 rounded-l-md hover:bg-surface text-neutral-400 z-40 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
    );
  }

  return (
    <aside 
      ref={sidebarRef}
      className="h-[calc(100vh-var(--header-height,52px))] border-l border-border bg-background flex flex-col relative z-40"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Sidebar Resize Handle */}
      <div 
        className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-neutral-600 transition-colors z-50"
        onMouseDown={() => {
          isResizingSidebar.current = true;
          document.body.style.cursor = 'col-resize';
        }}
      />

      {/* Map Panel */}
      {mapVisible && (
        <div 
          className="relative flex flex-col bg-surface overflow-hidden"
          style={{ height: chatVisible ? `${mapHeight}px` : '100%' }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-panel/50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
              <MapIcon size={14} />
              <span>MAPA RTIRL</span>
            </div>
            <button onClick={toggleMap} className="text-neutral-500 hover:text-neutral-100">
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-2 opacity-30">
              <MapIcon size={20} className="text-neutral-500" />
            </div>
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">Espaço do Mapa</span>
          </div>
          
          {/* Map Resize Handle */}
          {chatVisible && (
            <div 
              className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-neutral-600 transition-colors z-50"
              onMouseDown={() => {
                isResizingMap.current = true;
                document.body.style.cursor = 'row-resize';
              }}
            />
          )}
        </div>
      )}

      {/* Chat Panel */}
      {chatVisible && (
        <div className="flex-1 flex flex-col bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-panel/50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
              <MessageSquare size={14} />
              <span>CHAT AO VIVO</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleChat} className="text-neutral-500 hover:text-neutral-100">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-3">
             {/* Chat Empty State */}
             <div className="mt-auto opacity-40 text-[10px] font-bold text-center pb-4 uppercase tracking-tighter">
               Bem-vindo ao chat do MultiStreamZ. Os chats das lives apareceriam aqui.
             </div>
          </div>
        </div>
      )}

      {/* Collapsed/Empty State for panels */}
      {!mapVisible && !chatVisible && (
        <div className="flex-1 flex items-center justify-center text-neutral-600 text-[11px] font-bold p-4 text-center uppercase tracking-tighter opacity-40">
           <p>Os painéis laterais estão ocultos. Use os ícones no topo para mostrar o mapa ou o chat.</p>
        </div>
      )}
    </aside>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useStreamStore } from '../store/useStreamStore';
import { ChevronLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { MapPanel } from './MapPanel';
import { Group, Panel, Separator } from 'react-resizable-panels';

export const Sidebar: React.FC = () => {
  const { 
    sidebarVisible, toggleSidebar, chatVisible, toggleChat, 
    mapVisible, toggleMap, mobileCinemaMode, setIsResizing
  } = useStreamStore();

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

  if (mobileCinemaMode || !sidebarVisible) {
    return <>{toggleButton}</>;
  }

  return (
    <>
      <motion.aside 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        className="glass-panel flex flex-col relative z-40 h-full overflow-hidden pointer-events-auto"
        style={{ borderLeft: '1px solid var(--glass-border)' }}
      >
        <Group orientation="vertical" className="w-full h-full">
          {mapVisible && (
            <>
              <Panel defaultSize={40} minSize={20}>
                <div className="flex flex-col h-full bg-background overflow-hidden border-b border-border pointer-events-auto">
                  <MapPanel showCloseButton onClose={toggleMap} />
                </div>
              </Panel>
              {chatVisible && (
                <Separator 
                  className="h-1.5 bg-border/20 hover:bg-primary/20 transition-colors relative"
                  onMouseDown={() => setIsResizing(true)}
                >
                  <div className="absolute inset-x-0 -top-1 -bottom-1 z-10" />
                </Separator>
              )}
            </>
          )}

          {chatVisible && (
            <Panel defaultSize={60} minSize={20}>
              <div className="flex flex-col h-full overflow-hidden">
                <ChatPanel showCloseButton onClose={toggleChat} />
              </div>
            </Panel>
          )}
        </Group>
      </motion.aside>
      {toggleButton}
    </>
  );
};

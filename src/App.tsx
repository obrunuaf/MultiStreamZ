import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Minimize2 } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StreamGrid } from './components/StreamGrid';
import { IframePortalLayer } from './components/IframePortalLayer';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useStreamStore } from './store/useStreamStore';
import { useMetadataSync } from './hooks/useMetadataSync';
import { stayAlive } from './utils/stayAlive';

function App() {
  const { 
    streams, addStream, layoutType, headerVisible, 
    toggleHeader, mobileCinemaMode, toggleMobileCinema,
    isResizing, isDragging, sidebarVisible, setIsResizing
  } = useStreamStore();
  useMetadataSync(); // Global metadata background sync

  // Load initial streams if empty (just for demo purposes)
  useEffect(() => {
    if (streams.length === 0) {
      addStream('https://www.twitch.tv/jonvlogs');
      addStream('https://www.twitch.tv/sheviii2k');
      addStream('https://www.twitch.tv/linsjr');
      addStream('https://kick.com/stereonline');
    }
  }, [streams.length, addStream]);

  // Handle High Performance (Anti-Throttling) Mode
  const highPerformanceMode = useStreamStore(state => state.highPerformanceMode);
  useEffect(() => {
    if (highPerformanceMode) {
      stayAlive.enable();
    } else {
      stayAlive.disable();
    }
    return () => stayAlive.disable();
  }, [highPerformanceMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-neutral-200 overflow-hidden relative">
      {/* Global Protection Shield (Iframe interference fix) */}
      {(isResizing || isDragging) && (
        <div 
          className="fixed inset-0 z-1000 cursor-grabbing select-none pointer-events-auto bg-transparent"
          onMouseUp={() => {
            useStreamStore.getState().setIsResizing(false);
            useStreamStore.getState().setIsDragging(false);
          }}
        />
      )}
      {/* Header Container with Framer Motion */}
      <motion.div 
        initial={false}
        animate={{ 
          y: headerVisible ? 0 : -100,
          opacity: headerVisible ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        style={{ pointerEvents: headerVisible ? 'auto' : 'none' }}
      >
        <Header />
      </motion.div>

      {/* Show Header Trigger */}
      <AnimatePresence>
        {!headerVisible && !mobileCinemaMode && (
          <motion.button 
            initial={{ y: -50, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: -50, x: '-50%', opacity: 0 }}
            whileHover={{ paddingTop: 10, paddingBottom: 10, opacity: 1 }}
            onClick={toggleHeader}
            className="fixed top-0 left-1/2 z-50 group/trigger flex flex-col items-center px-6 py-1.5 rounded-b-2xl bg-twitch/20 border border-t-0 border-white/10 backdrop-blur-md opacity-40 transition-all group"
            title="Mostrar Header"
          >
            <div className="flex flex-col items-center gap-0.5 pointer-events-none">
              <span className="text-[7px] font-black text-white/50 group-hover:text-white uppercase tracking-[0.2em] mb-0.5">MOSTRAR HEADER</span>
              <ChevronDown size={14} className="text-white group-hover:scale-125 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 bg-twitch/10 blur-xl -z-10 group-hover:bg-twitch/40 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Return from Cinema Mode Button */}
      <AnimatePresence>
        {mobileCinemaMode && (
          <motion.button
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            onClick={toggleMobileCinema}
            className="fixed bottom-6 left-1/2 flex items-center gap-3 px-6 py-3 bg-green-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] z-110 active:scale-95 transition-transform active:bg-green-400 group"
          >
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            Sair do Modo Cinema
            <Minimize2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
     
      <main 
        className={`flex-1 flex overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) relative z-30 pointer-events-none ${mobileCinemaMode ? 'pb-0' : 'pb-16 md:pb-0'}`}
        style={{ 
          marginTop: headerVisible ? 'var(--header-height)' : '0px'
        }}
      >
        <Group orientation="horizontal" className="w-full h-full">
          <Panel defaultSize={75} minSize={20}>
            <StreamGrid />
          </Panel>
          
          {layoutType !== 'interactive' && sidebarVisible && (
            <>
              <Separator 
                className="w-1.5 bg-border/20 hover:bg-primary/40 transition-colors relative group"
                onMouseDown={() => setIsResizing(true)}
              >
                 <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
              </Separator>
              <Panel defaultSize={25} minSize={10}>
                <Sidebar />
              </Panel>
            </>
          )}
        </Group>
      </main>

      <BottomNav />

      <IframePortalLayer />

      <footer className="hidden md:flex h-6 border-t border-border bg-panel px-3 items-center justify-between text-[10px] text-neutral-500 font-medium z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span>SISTEMA PRONTO</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase">{streams.length} LIVES ATIVAS</span>
        </div>
        <div className="flex items-center gap-3 italic font-black text-[10px] text-neutral-600 uppercase tracking-tighter">
          <span>ZMULTILIVE v3.2.0-STABLE</span>
        </div>
      </footer>

    </div>
  );
}

export default App;

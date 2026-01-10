import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StreamGrid } from './components/StreamGrid';
import { IframePortalLayer } from './components/IframePortalLayer';
import { useStreamStore } from './store/useStreamStore';
import { useMetadataSync } from './hooks/useMetadataSync';
import { stayAlive } from './utils/stayAlive';

function App() {
  const { streams, addStream, layoutType, headerVisible, toggleHeader } = useStreamStore();
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
      {/* Header Container with Slide Animation */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)`}
        style={{ 
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: headerVisible ? 1 : 0,
          pointerEvents: headerVisible ? 'auto' : 'none'
        }}
      >
        <Header />
      </div>

      {/* Show Header Trigger (Visible when header is hidden) */}
      {!headerVisible && (
        <button 
          onClick={toggleHeader}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 group/trigger flex flex-col items-center px-6 py-1.5 rounded-b-2xl bg-twitch/20 hover:bg-twitch/80 border border-t-0 border-white/10 backdrop-blur-md opacity-40 hover:opacity-100 transition-all duration-500 hover:py-2.5 animate-in slide-in-from-top-8 group"
          title="Mostrar Header"
        >
          <div className="flex flex-col items-center gap-0.5 pointer-events-none">
            <span className="text-[7px] font-black text-white/50 group-hover:text-white uppercase tracking-[0.2em] mb-0.5">MOSTRAR HEADER</span>
            <ChevronDown size={14} className="text-white group-hover:scale-125 transition-transform duration-300" />
          </div>
          {/* Subtle Glow beneath the button */}
          <div className="absolute inset-0 bg-twitch/10 blur-xl -z-10 group-hover:bg-twitch/40 transition-colors" />
        </button>
      )}
     
      <main 
        className="flex-1 flex overflow-hidden flex-row transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
        style={{ 
          marginTop: headerVisible ? 'var(--header-height)' : '0px'
        }}
      >
        <StreamGrid />
        {layoutType !== 'interactive' && <Sidebar />}
      </main>

      <IframePortalLayer />

      {/* Footer / Status Bar */}
      <footer className="h-6 border-t border-border bg-panel px-3 flex items-center justify-between text-[10px] text-neutral-500 font-medium z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span>SISTEMA PRONTO</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase">{streams.length} LIVES ATIVAS</span>
        </div>
        <div className="flex items-center gap-3 italic font-black text-[10px] text-neutral-600 uppercase tracking-tighter">
          <span>MULTISTREAMZ v3.2.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

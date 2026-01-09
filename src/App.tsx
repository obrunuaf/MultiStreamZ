import { useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StreamGrid } from './components/StreamGrid';
import { IframePortalLayer } from './components/IframePortalLayer';
import { useStreamStore } from './store/useStreamStore';
import { useMetadataSync } from './hooks/useMetadataSync';
import { stayAlive } from './utils/stayAlive';

function App() {
  const { streams, addStream, layoutType } = useStreamStore();
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
    <div className="flex flex-col h-screen bg-background text-neutral-200">
      <Header />
      
      <main className="flex-1 flex overflow-hidden flex-row">
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

import React from 'react';
import { MessageSquare, X, ExternalLink } from 'lucide-react';
import { useStreamStore, type Stream } from '../store/useStreamStore';

interface ChatPanelProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const ChatPanel = React.memo<ChatPanelProps>(({ showCloseButton, onClose }) => {
  const { streams, activeChatStreamId, setActiveChatStream, toggleChat } = useStreamStore();

  const currentActiveId = activeChatStreamId || streams[0]?.id;
  const activeStream = streams.find(s => s.id === currentActiveId);

  const getChatUrl = (stream: Stream) => {
    if (!stream) return '';
    const hostname = window.location.hostname;
    if (stream.platform === 'twitch') {
      return `https://www.twitch.tv/embed/${stream.channelName}/chat?parent=${hostname}&darkpopout`;
    }
    if (stream.platform === 'kick') {
      return `https://chat.kick.cx/embed/${stream.channelName}`;
    }
    return '';
  };

  const handlePopout = () => {
    if (!activeStream) return;
    const url = activeStream.platform === 'twitch' 
      ? `https://www.twitch.tv/popout/${activeStream.channelName}/chat?darkpopout`
      : `https://chat.kick.cx/embed/${activeStream.channelName}`;
    
    window.open(url, '_blank', 'width=400,height=600,location=no,menubar=no,status=no,toolbar=no');
  };

  // Sort streams by ID to keep the iframe list stable in the DOM
  const stableStreams = [...streams].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative h-full pointer-events-auto">
      <div className="flex flex-col border-b border-white/5 bg-panel/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            <MessageSquare size={14} className="text-purple-400/50" />
            <span>CHAT</span>
          </div>
          <div className="flex items-center gap-1">
            {activeStream && (
                <button 
                onClick={handlePopout} 
                className="text-neutral-500 hover:text-white transition-colors p-1"
                title="Abrir em nova janela (Popout)"
                >
                <ExternalLink size={14} />
                </button>
            )}
            {showCloseButton && (
                <button onClick={onClose || toggleChat} className="text-neutral-500 hover:text-white transition-colors p-1">
                <X size={14} />
                </button>
            )}
          </div>
        </div>

        {/* Chat Select Tabs (Order preserves visual stream order) */}
        {streams.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 pb-2.5 h-auto overflow-x-auto no-scrollbar">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveChatStream(s.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase transition-all border ${
                  currentActiveId === s.id 
                    ? 'bg-white text-black border-white shadow-lg' 
                    : 'bg-panel text-neutral-500 border-border hover:border-neutral-700 hover:text-neutral-300'
                }`}
              >
                {s.channelName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-black">
        {stableStreams.length > 0 ? (
          stableStreams.map((s) => (
            <iframe
              key={s.id}
              src={getChatUrl(s)}
              className={`w-full h-full border-none bg-black absolute inset-0 transition-opacity duration-300 ${
                currentActiveId === s.id
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
              title={`Chat for ${s.channelName}`}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 bg-background h-full">
             <div className="opacity-20 text-[10px] font-bold text-center uppercase tracking-widest">
                Nenhum chat disponível.<br/>Adicione uma live para começar.
             </div>
          </div>
        )}
      </div>
    </div>
  );
});
ChatPanel.displayName = 'ChatPanel';

import React from 'react';
import { MessageSquare, X, ExternalLink } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

interface ChatPanelProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ showCloseButton, onClose }) => {
  const { streams, activeChatStreamId, setActiveChatStream, toggleChat } = useStreamStore();

  const activeStream = streams.find(s => s.id === activeChatStreamId) || streams[0];

  const getChatUrl = (stream: typeof activeStream) => {
    if (!stream) return '';
    const hostname = window.location.hostname;
    if (stream.platform === 'twitch') {
      // Use popout URL as it often handles sessions better than the standard embed
      // We also include both window.location.hostname for the parent requirement
      return `https://www.twitch.tv/popout/${stream.channelName}/chat?parent=${hostname}&darkpopout=true`;
    }
    if (stream.platform === 'kick') {
      // Using the industry-standard Kick.CX chat client (as used by MultiKick.com)
      // This client handles login, 7TV emotes, and is much more stable than official embed
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

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative h-full">
      <div className="flex flex-col border-b border-white/5 bg-panel/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            <MessageSquare size={14} className="text-purple-400/50" />
            <span>CHAT AO VIVO</span>
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

        {/* Chat Select Tabs */}
        {streams.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 pb-2.5 h-auto overflow-x-auto no-scrollbar">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveChatStream(s.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase transition-all border ${
                  activeChatStreamId === s.id 
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
        {activeStream ? (
          <iframe
            key={activeStream.id}
            src={getChatUrl(activeStream)}
            className="w-full h-full border-none bg-black"
            title={`Chat for ${activeStream.channelName}`}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
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
};

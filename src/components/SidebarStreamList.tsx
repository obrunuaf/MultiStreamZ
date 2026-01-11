import React from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { Trash2, Volume2, VolumeX, RefreshCw, Users, Tv } from 'lucide-react';

export const SidebarStreamList: React.FC = () => {
    const { 
        streams, removeStream, toggleStreamMute, reloadStream,
        activeChatStreamId, setActiveChatStream 
    } = useStreamStore();

    if (streams.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                <Tv size={32} className="text-neutral-800 mb-3" />
                <p className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">
                    Nenhuma live ativa
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-black/20 p-2 space-y-2 custom-scrollbar">
            <h3 className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2 pt-2 mb-1">
                Monitoramento ({streams.length})
            </h3>
            
            {streams.map((stream) => (
                <div 
                    key={stream.id}
                    onClick={() => setActiveChatStream(stream.id)}
                    onWheel={(e) => {
                      const delta = e.deltaY > 0 ? -0.05 : 0.05;
                      const newVolume = Math.max(0, Math.min(1, stream.volume + delta));
                      useStreamStore.getState().setStreamVolume(stream.id, newVolume);
                      if (delta > 0 && stream.isMuted) useStreamStore.getState().toggleStreamMute(stream.id);
                    }}
                    className={`cursor-pointer border rounded-md p-3 group/item transition-all duration-300 ${
                        activeChatStreamId === stream.id 
                        ? 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                        : 'bg-black/40 border-white/5 hover:border-white/10'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="relative">
                                <img 
                                    src={stream.metadata?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.channelName}`} 
                                    className={`w-8 h-8 rounded-sm object-cover bg-neutral-900 border border-white/5 ${!stream.metadata?.isLive && 'grayscale opacity-50'}`}
                                    alt=""
                                />
                                {stream.metadata?.isLive && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#18181b] animate-pulse" />
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black text-white truncate uppercase tracking-tight">
                                    {stream.channelName}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase ${stream.platform === 'twitch' ? 'text-twitch' : 'text-[#00e701]'}`}>
                                        {stream.platform}
                                    </span>
                                    {stream.metadata?.isLive && (
                                        <div className="flex items-center gap-1 text-neutral-400">
                                            <Users size={8} />
                                            <span className="text-[8px] font-bold">
                                                {stream.metadata.viewerCount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button 
                                onClick={() => reloadStream(stream.id)}
                                className="p-1.5 hover:bg-white/5 text-neutral-500 hover:text-white rounded transition-colors"
                            >
                                <RefreshCw size={12} />
                            </button>
                            <button 
                                onClick={() => removeStream(stream.id)}
                                className="p-1.5 hover:bg-white/5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>

                    {stream.metadata?.isLive && (
                        <div className="flex flex-col gap-1.5 pt-1">
                            <span className="text-[9px] font-bold text-neutral-300 truncate lowercase opacity-80">
                                {stream.metadata.title}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <div className="px-1.5 py-0.5 bg-white/5 rounded-xs border border-white/5">
                                    <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest">
                                        {stream.metadata.gameName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3 w-full max-w-32">
                            <button onClick={() => toggleStreamMute(stream.id)} className="text-neutral-500 hover:text-white transition-colors">
                                {stream.isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                            </button>
                            <div className="flex-1 h-0.5 bg-white/5 rounded-full relative overflow-hidden group/vol">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-neutral-400 transition-all" 
                                    style={{ width: `${stream.volume * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

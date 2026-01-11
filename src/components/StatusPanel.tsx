import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, Twitch, Cpu, RefreshCw } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

export const StatusPanel: React.FC = () => {
    const { auth, streams } = useStreamStore();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden h-full p-4 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-green-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-100">Live Monitor</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.dispatchEvent(new Event('refresh-metadata'))}
                        className="p-1 hover:bg-white/10 rounded-sm transition-colors text-neutral-400 hover:text-white"
                        title="Atualizar Metadados"
                    >
                        <RefreshCw size={12} />
                    </button>
                    <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded-sm text-neutral-500 uppercase tracking-widest border border-white/5">v4.1 PRO</span>
                </div>
            </div>

            {/* Time and Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-3 rounded-sm border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 opacity-50">
                        <Clock size={10} />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Local Time</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-neutral-200">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
                <div className="bg-black/40 p-3 rounded-sm border border-white/5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 opacity-50">
                        <Activity size={10} />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Canais Ativos</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-green-400">
                        {streams.length.toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Streams Monitor List */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <h4 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-1 mb-1">Status do Feed</h4>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {streams.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 border border-dashed border-white/10 rounded-sm p-4">
                            <ShieldAlert size={20} className="mb-2" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Nenhum stream ativo</span>
                        </div>
                    ) : (
                        streams.map((stream) => (
                            <div key={stream.id} className="bg-white/5 border border-white/5 rounded-sm p-3 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${stream.metadata?.isLive ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'}`} />
                                        <span className="text-[10px] font-bold text-neutral-200 truncate max-w-30">
                                            {stream.channelName}
                                        </span>
                                    </div>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-xs uppercase ${
                                        stream.platform === 'twitch' ? 'bg-twitch/20 text-twitch' : 'bg-kick/20 text-kick'
                                    }`}>
                                        {stream.platform}
                                    </span>
                                </div>
                                
                                {stream.metadata ? (
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-neutral-400 font-medium line-clamp-1 opacity-80 group-hover:opacity-100">
                                            {stream.metadata.title || 'Sem título'}
                                        </div>
                                        <div className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-widest text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Activity size={8} />
                                                {stream.metadata.viewerCount.toLocaleString()} Viewers
                                            </span>
                                            {stream.metadata.gameName && (
                                                <span className="flex items-center gap-1 text-neutral-400">
                                                    <Cpu size={8} />
                                                    {stream.metadata.gameName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest italic py-1">
                                        Sincronizando metadados...
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Account Connections */}
            <div className="space-y-2 border-t border-white/5 pt-4">
                <h4 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-1 mb-1">Conexões do Sistema</h4>
                
                <div className={`rounded-sm border p-2 flex items-center justify-between transition-all ${
                    auth.twitch 
                    ? 'bg-twitch/5 border-twitch/20' 
                    : 'bg-black/40 border-white/5 grayscale opacity-50'
                }`}>
                    <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-xs ${auth.twitch ? 'bg-twitch text-white' : 'bg-neutral-800'}`}>
                            <Twitch size={12} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-white uppercase leading-none">Twitch Integration</div>
                            <div className="text-[8px] font-bold text-neutral-500 mt-0.5">
                                {auth.twitch ? `@${auth.twitch.username}` : 'Desconectado'}
                            </div>
                        </div>
                    </div>
                    {auth.twitch && <div className="w-1.5 h-1.5 rounded-full bg-twitch shadow-[0_0_8px_rgba(145,71,255,0.6)]" />}
                </div>
            </div>
            
            <div className="pt-2 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none">ZMultiLive OS</span>
                    <span className="text-[6px] font-mono text-neutral-700 mt-0.5">STABLE_V4_1_RELEASE</span>
                </div>
                <div className="px-1.5 py-0.5 bg-black/40 border border-white/5 rounded-xs">
                    <span className="text-[6px] font-black text-neutral-700 uppercase">Secure</span>
                </div>
            </div>
        </div>
    );
};

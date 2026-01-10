import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, Twitch, Cpu } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

export const StatusPanel: React.FC = () => {
    const { auth } = useStreamStore();
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
                <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded-sm text-neutral-500 uppercase tracking-widest border border-white/5">v3.9 PRO</span>
            </div>

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
                        <Cpu size={10} />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Sessão</span>
                    </div>
                    <span className="text-[9px] font-black text-green-400 uppercase">
                        Sincronizada
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-1 mb-3 text-center">Contas Vinculadas</h4>
                
                {/* Twitch Card */}
                <div className={`rounded-sm border p-3 flex items-center justify-between transition-all ${
                    auth.twitch 
                    ? 'bg-twitch/5 border-twitch/20' 
                    : 'bg-black/40 border-white/5 grayscale opacity-50'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-xs ${auth.twitch ? 'bg-twitch text-white' : 'bg-neutral-800'}`}>
                            <Twitch size={14} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-tight">Twitch TV</div>
                            <div className="text-[9px] font-bold text-neutral-500">
                                {auth.twitch ? `@${auth.twitch.username}` : 'Nenhuma conta'}
                            </div>
                        </div>
                    </div>
                    {auth.twitch && <div className="w-1.5 h-1.5 rounded-full bg-twitch" />}
                </div>
                
            </div>

            <div className="flex-1 bg-black/20 rounded-md border border-dashed border-white/5 flex items-center justify-center p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                    <ShieldAlert size={24} className="text-neutral-800" />
                    <p className="text-[9px] text-neutral-700 font-bold uppercase leading-relaxed tracking-widest">
                        Aguardando integração <br/> de estatísticas Helix
                    </p>
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest leading-none">ZMultiLive Build</span>
                    <span className="text-[7px] font-mono text-neutral-800 mt-1">PRO_STABLE_4922_FF</span>
                </div>
                <div className="px-2 py-0.5 bg-black/40 border border-white/5 rounded-xs">
                    <span className="text-[7px] font-black text-neutral-700 uppercase">Acesso Global</span>
                </div>
            </div>
        </div>
    );
};

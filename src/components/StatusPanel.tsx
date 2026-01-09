import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, Twitch, Globe } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';

export const StatusPanel: React.FC = () => {
    const { auth } = useStreamStore();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden h-full p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity size={16} className="text-green-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-100">Live Monitor v1.0</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-panel/50 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Uptime Sistema</span>
                    <span className="text-xs font-mono text-neutral-200 flex items-center gap-1.5">
                        <Clock size={12} className="text-neutral-500" />
                        {time.toLocaleTimeString()}
                    </span>
                </div>
                <div className="bg-panel/50 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Status API</span>
                    <span className="text-[10px] font-black text-green-400 uppercase flex items-center gap-1.5">
                        Operacional
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-[9px] font-bold text-neutral-500 uppercase px-1">Conexões Sociais</h4>
                <div className="bg-panel/50 rounded-xl border border-white/5 p-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${auth.twitch ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800 text-neutral-600'}`}>
                            <Twitch size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-neutral-200 uppercase">Twitch TV</div>
                            <div className="text-[9px] text-neutral-500">{auth.twitch ? `@${auth.twitch.username}` : 'Desconectado'}</div>
                        </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${auth.twitch ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-neutral-700'}`} />
                </div>
                
                <div className="bg-panel/50 rounded-xl border border-white/5 p-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${auth.kick ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-600'}`}>
                            <Globe size={16} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-neutral-200 uppercase">Kick.com</div>
                            <div className="text-[9px] text-neutral-500">{auth.kick ? `@${auth.kick.username}` : 'Desconectado'}</div>
                        </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${auth.kick ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-700'}`} />
                </div>
            </div>

            <div className="flex-1 bg-panel/30 rounded-2xl border border-dashed border-white/10 flex items-center justify-center p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                    <ShieldAlert size={32} className="text-neutral-700" />
                    <p className="text-[10px] text-neutral-500 font-medium uppercase leading-relaxed tracking-tight">
                        Estatísticas em tempo real <br/> (Viewers/FPS) requerem conexão <br/> com as APIs. Disponível em breve.
                    </p>
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-bold text-neutral-600 uppercase">
                <span>MultiStreamZ v3.1</span>
                <span>Pro Build 793</span>
            </div>
        </div>
    );
};

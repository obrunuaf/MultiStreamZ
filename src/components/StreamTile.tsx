import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Stream } from '../store/useStreamStore';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface StreamTileProps {
  stream: Stream;
  isFeatured?: boolean;
}

const MAX_RETRIES = 3;
const LOADING_TIMEOUT_MS = 15000;

export const StreamTile: React.FC<StreamTileProps> = ({ stream, isFeatured }) => {
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const getParentDomains = useCallback(() => {
    const domains = [window.location.hostname];
    if (window.location.hostname !== 'localhost') domains.push('localhost');
    if (window.location.hostname !== '127.0.0.1') domains.push('127.0.0.1');
    return domains;
  }, []);

  const getEmbedUrl = useCallback(() => {
    if (stream.platform === 'twitch') {
      const parents = getParentDomains().map(d => `parent=${d}`).join('&');
      return `https://player.twitch.tv/?channel=${stream.channelName}&${parents}&muted=${stream.isMuted ? 'true' : 'false'}`;
    }
    if (stream.platform === 'kick') {
      return `https://player.kick.com/${stream.channelName}`;
    }
    return '';
  }, [stream.platform, stream.channelName, stream.isMuted, getParentDomains]);

  useEffect(() => {
    if (status === 'loading') {
      timeoutRef.current = setTimeout(() => {
        setStatus('error');
        setErrorReason('Tempo limite excedido');
      }, LOADING_TIMEOUT_MS);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, retryCount]);

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('active');
  };

  const handleError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (retryCount < MAX_RETRIES) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setStatus('loading');
    } else {
      setStatus('error');
      setErrorReason('Falha no carregamento');
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setErrorReason(null);
    setStatus('loading');
  };

  const renderContent = () => {
    if (stream.platform === 'kick') {
      if (status === 'error') {
         return (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center select-none">
             {/* Premium Background Blur */}
             <div className="absolute inset-0 bg-neutral-950">
               <div className="absolute inset-0 bg-[#53FC18]/5 blur-[100px] opacity-20" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#53FC18]/10 rounded-full blur-[60px]" />
             </div>

             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-kick/20 to-black border border-kick/30 flex items-center justify-center mb-5 shadow-2xl ring-1 ring-white/5">
                 <span className="text-3xl font-black text-kick drop-shadow-[0_0_10px_rgba(83,252,24,0.4)]">
                   {stream.channelName[0].toUpperCase()}
                 </span>
               </div>
               
               <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{stream.channelName}</h3>
               
               <p className="text-[10px] font-bold text-neutral-500 mb-6 max-w-50 uppercase tracking-widest leading-relaxed">
                 O Kick bloqueou o acesso direto.<br/>Aperte abaixo para abrir no player oficial.
               </p>
               
               <a 
                 href={`https://kick.com/${stream.channelName}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="group/btn relative px-6 py-3 bg-[#53FC18] hover:bg-[#43e614] rounded-xl text-[11px] font-black text-black uppercase transition-all flex items-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(83,252,24,0.3)] hover:shadow-[0_0_30px_rgba(83,252,24,0.5)] active:scale-95 pointer-events-auto"
               >
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                 <span className="relative">Assistir no Kick.com</span>
                 <svg className="w-4 h-4 relative group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M5 12h14M12 5l7 7-7 7"/>
                 </svg>
               </a>
             </div>
           </div>
         );
      }
      
      return (
        <iframe
          key={`${stream.id}-${retryCount}-${stream.reloadKey}`}
          src={`https://player.kick.com/${stream.channelName}`}
          className="w-full h-full border-none pointer-events-auto bg-black"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      );
    }

    if (status === 'error') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-10 p-4 text-center">
          <AlertTriangle size={32} className="text-red-500/50 mb-2" />
          <span className="text-[11px] font-bold text-neutral-400 uppercase mb-1">Erro ao carregar</span>
          <span className="text-[10px] text-neutral-600 text-center mb-3">{stream.channelName}</span>
          <p className="text-[9px] text-neutral-700 mb-3 max-w-45">
             {errorReason === 'Tempo limite excedido' ? 'A conexão demorou muito.' : 'Verifique se o canal existe.'}
          </p>
          <button 
            onClick={handleManualRetry}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-[10px] font-bold text-neutral-300 uppercase transition-colors flex items-center gap-2 pointer-events-auto"
          >
            <RefreshCw size={12} /> Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <iframe
         key={`${stream.id}-${retryCount}-${stream.reloadKey}`}
         src={getEmbedUrl()}
         className="w-full h-full border-none pointer-events-auto bg-black"
         allowFullScreen
         onLoad={handleLoad}
         onError={handleError}
      />
    );
  };

  return (
    <div className={`group relative w-full h-full bg-black overflow-hidden transition-all duration-300 ${
        isFeatured ? 'border-2 border-neutral-100 ring-4 ring-neutral-100/5' : 'border border-border'
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
         {status === 'loading' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-5 pointer-events-none">
             <div className="animate-spin mb-2">
               <RefreshCw size={24} className={retryCount > 0 ? "text-yellow-500" : "text-neutral-500"} />
             </div>
             <span className="text-[10px] font-bold text-neutral-600 uppercase">
               {retryCount > 0 ? `Reconectando (${retryCount}/${MAX_RETRIES})...` : 'Carregando...'}
             </span>
           </div>
         )}
         {renderContent()}
      </div>
    </div>
  );
};

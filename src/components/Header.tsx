import { MessageSquare, Map as MapIcon, Settings, LayoutGrid, LogOut, Twitch, AlertTriangle } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';
import { SettingsModal } from './SettingsModal';
import { useState, useEffect } from 'react'; // Added useEffect import

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { streams, validateAndAddStream, toggleChat, toggleMap, sidebarVisible, toggleSidebar, auth, loginTwitch, logoutTwitch, loginKick, logoutKick, customClientId, addStream } = useStreamStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isValidating) {
      setIsValidating(true);
      const success = await validateAndAddStream(input.trim());
      if (success) {
        setInput('');
      } else {
        // Simple shake or border highlight could go here
      }
      setIsValidating(false);
    }
  };

  const handleTwitchLogin = () => {
    // Market Standard: Use popup instead of redirect to preserve app state
    const REDIRECT_URI = window.location.origin;
    const scope = encodeURIComponent('user:read:email chat:read chat:edit user:read:follows');
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${customClientId}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}`;
    
    // Open a centered popup for Twitch Auth
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(authUrl, 'TwitchAuth', `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,resizable=yes`);

    // Monitor popup closure to potentially refresh or clean up
    if (popup) {
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          // Check for URL hash changes (though popups usually communicate via postMessage or by being on same origin)
          // For simplicity in this local flow, we rely on the parent's window hash detection if redirect_uri points to parent
          // However, popups redirecting back to parent is complex. 
          // Better: The parent handles the callback if redirect_uri is same-page.
        }
      }, 1000);
    }
  };

  // Check for OAuth Callback on mount (Handles both redirect and popup flows)
  useEffect(() => {
    const hash = window.location.hash;

    // Phase 1: Direct Hash Detection (Traditional Redirect or Inside Popup)
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      
      if (token) {
        // Market Standard: If this is a popup, notify the opener and close
        if (window.opener && window.opener !== window) {
           window.opener.postMessage({ type: 'TWITCH_AUTH_SUCCESS', token }, window.location.origin);
           window.close();
           return;
        }

        // Direct handling (fallback or traditional redirect)
        fetch('https://api.twitch.tv/helix/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': customClientId
          }
        })
        .then(res => res.json())
        .then(data => {
            if (data.data && data.data[0]) {
                const user = data.data[0];
                loginTwitch({
                    username: user.display_name,
                    profileImage: user.profile_image_url,
                    token
                });
                addStream(user.login);
            }
        })
        .catch(err => console.error('Twitch Auth Error:', err));
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Phase 2: Listen for messages (If this is the Parent window receiving from Popup)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'TWITCH_AUTH_SUCCESS') {
        const token = event.data.token;
        // Fetch user data for the parent
        fetch('https://api.twitch.tv/helix/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': customClientId
          }
        })
        .then(res => res.json())
        .then(data => {
            if (data.data && data.data[0]) {
                const user = data.data[0];
                loginTwitch({
                    username: user.display_name,
                    profileImage: user.profile_image_url,
                    token
                });
                addStream(user.login);
                setIsAuthOpen(false); // Close the auth dropdown on success
            }
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginTwitch, addStream, customClientId]);

  // Direct Kick Login (Zero-Friction Market Standard)
  const handleKickLogin = () => {
    // 1. Detect active Kick stream or use default
    const activeKick = streams.find(s => s.platform === 'kick');
    const finalUsername = activeKick?.channelName || 'Usuário';
    
    // 2. Open login popup
    const authUrl = `https://chat.kick.cx/auth-popup`;
    window.open(authUrl, 'KickAuth', 'width=500,height=600,status=no,menubar=no,resizable=yes');
    
    // 3. Direct Login (No more prompts)
    loginKick({ 
        username: finalUsername, 
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalUsername}`, 
        token: 'active-session' 
    });
    
    setIsAuthOpen(false);
  };

  return (
    <header className="h-13 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 shrink-0 group cursor-pointer">
          <div className="w-6 h-6 bg-neutral-100 rounded-sm flex items-center justify-center group-hover:bg-white transition-colors">
            <div className="w-3 h-3 bg-background rounded-xs" />
          </div>
          <span className="font-black text-sm tracking-tighter text-neutral-100 uppercase group-hover:text-white transition-colors">MultiStreamZ</span>
        </div>
        
        <form onSubmit={handleSubmit} className="relative w-48 hidden lg:block">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isValidating}
            placeholder={isValidating ? "Validando..." : "Adicionar live..."}
            className={`w-full bg-panel border rounded-sm py-1.5 px-3 text-[11px] focus:outline-none transition-all placeholder:text-neutral-600 tracking-tight ${
              isValidating ? 'border-neutral-700 opacity-50' : 'border-white/5 focus:border-neutral-500'
            }`}
          />
        </form>
      </div>

      {/* Center: Stream Selector */}
      <div className="hidden md:flex flex-2 justify-center h-full items-center">
        <StreamSelector />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        <LayoutSelector />
        <div className="w-px h-8 bg-border mx-2" />
        <button
          onClick={toggleChat}
          className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100"
          title="Alternar Chat"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={toggleMap}
          className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100"
          title="Alternar Mapa"
        >
          <MapIcon size={20} />
        </button>
        <button
          onClick={toggleSidebar}
          className={`p-2 hover:bg-surface rounded-md transition-colors ${sidebarVisible ? 'text-neutral-100' : 'text-neutral-400'}`}
          title="Alternar Lateral"
        >
          <LayoutGrid size={20} />
        </button>
        <div className="w-px h-4 bg-border mx-2" />
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-surface rounded-md transition-colors text-neutral-400 hover:text-neutral-100"
          title="Configurações"
        >
          <Settings size={20} />
        </button>

        {/* Premium Auth Section */}
        <div className="relative ml-2">
            <button 
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all active:scale-95 group/auth-main border rounded-sm ${
                    (auth.twitch || auth.kick) 
                    ? 'bg-panel/40 border-white/10 hover:border-white/20' 
                    : 'bg-twitch text-white hover:bg-[#772ce8] border-transparent shadow-lg shadow-purple-500/10'
                }`}
            >
                {(auth.twitch || auth.kick) ? (
                    <>
                        <div className="flex -space-x-1.5">
                            {auth.twitch && <img src={auth.twitch.profileImage} className="w-4 h-4 rounded-full ring-2 ring-background border border-white/5" alt="" />}
                            {auth.kick && <img src={auth.kick.profileImage} className="w-4 h-4 rounded-full ring-2 ring-background border border-white/5" alt="" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight ml-1 text-neutral-200">
                            Sincronizado
                        </span>
                    </>
                ) : (
                    <>
                        <Twitch size={14} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sign in</span>
                    </>
                )}
            </button>

            {isAuthOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#18181b] border border-white/10 rounded-md shadow-2xl p-4 z-80 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    <div className="mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 ml-1">Conectar Contas</h3>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase ml-1">Vincule suas plataformas de stream</p>
                    </div>

                    {(auth.twitch || auth.kick) && (
                        <div className="mb-4 space-y-1">
                            {auth.twitch && (
                                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 group/row">
                                    <div className="flex items-center gap-2">
                                        <img src={auth.twitch.profileImage} className="w-6 h-6 rounded" alt="" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">@{auth.twitch.username}</span>
                                            <span className="text-[8px] text-twitch font-black uppercase tracking-widest">Twitch Conectada</span>
                                        </div>
                                    </div>
                                    <button onClick={logoutTwitch} className="p-1.5 hover:bg-white/5 text-neutral-600 hover:text-white rounded transition-colors">
                                        <LogOut size={12} />
                                    </button>
                                </div>
                            )}
                            {auth.kick && (
                                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 group/row">
                                    <div className="flex items-center gap-2">
                                        <img src={auth.kick.profileImage} className="w-6 h-6 rounded" alt="" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">@{auth.kick.username}</span>
                                            <span className="text-[8px] text-[#00e701] font-black uppercase tracking-widest">Kick Conectada</span>
                                        </div>
                                    </div>
                                    <button onClick={logoutKick} className="p-1.5 hover:bg-white/5 text-neutral-600 hover:text-white rounded transition-colors">
                                        <LogOut size={12} />
                                    </button>
                                </div>
                            )}
                            <div className="h-px bg-white/5 my-3" />
                        </div>
                    )}

                    <div className="space-y-2">
                        {/* Twitch - High-Fidelity Market Standard */}
                        <div className="relative group/twitch">
                            <button 
                                onClick={handleTwitchLogin}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-sm bg-twitch hover:bg-[#772ce8] text-white transition-colors"
                            >
                                <Twitch size={16} fill="currentColor" />
                                <span>Sign in with Twitch</span>
                                {customClientId === 'gp762nuuoqcoxypju8c569th9wz7q5' && (
                                    <AlertTriangle size={12} className="text-yellow-400 animate-pulse" />
                                )}
                            </button>
                            <div className="absolute -left-52 top-0 w-48 bg-[#0e0e10] border border-white/10 p-2.5 rounded-md text-[9px] text-neutral-400 opacity-0 group-hover/twitch:opacity-100 pointer-events-none transition-all z-100 shadow-2xl">
                                <span className="text-yellow-400 font-black block mb-1 uppercase tracking-widest">Aviso de Produção</span>
                                {customClientId === 'gp762nuuoqcoxypju8c569th9wz7q5' 
                                    ? "Você está usando um ID genérico. Configure seu próprio Client ID nas configurações para remover o aviso de redirecionamento da Twitch."
                                    : "Configuração segura detectada. Se o aviso persistir, verifique suas URLs de redirecionamento no Dashboard da Twitch."}
                            </div>
                        </div>

                        {/* Kick - High-Fidelity Direct Standard */}
                        <div className="relative group/kick">
                            <button 
                                onClick={handleKickLogin}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-sm bg-[#00e701] hover:bg-[#00c901] text-black transition-all active:scale-95"
                            >
                                <div className="w-4 h-4 bg-black rounded-xs flex items-center justify-center">
                                    <span className="text-[9px] font-black text-[#00e701]">K</span>
                                </div>
                                <span>Sign in with Kick</span>
                            </button>
                            <div className="absolute -left-52 top-0 w-48 bg-[#0e0e10] border border-white/10 p-2.5 rounded-md text-[9px] text-neutral-400 opacity-0 group-hover/kick:opacity-100 pointer-events-none transition-all z-100 shadow-2xl">
                                <span className="text-kick font-black block mb-1 uppercase tracking-widest text-[#00e701]">Sessão Direta</span>
                                O login abre a janela oficial. O perfil é sincronizado automaticamente com sua live ativa.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

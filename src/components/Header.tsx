import { MessageSquare, Map as MapIcon, Settings, LayoutGrid, LogOut, Twitch, Search, ChevronUp } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';
import { SettingsModal } from './SettingsModal';
import { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { 
    validateAndAddStream, 
    toggleChat, 
    toggleMap, 
    sidebarVisible, 
    toggleSidebar, 
    auth, 
    loginTwitch, 
    logoutTwitch, 
    customClientId, 
    addStream, 
    activeChatStreamId,
    toggleHeader
  } = useStreamStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isValidating) {
      setIsValidating(true);
      const success = await validateAndAddStream(input.trim());
      if (success) {
        setInput('');
      }
      setIsValidating(false);
    }
  };

  const handleTwitchLogin = () => {
    const OFFICIAL_TWITCH_ID = '6gu4wf1zdyfcxcgmedhazg3sswibof';
    const REDIRECT_URI = window.location.origin;
    const scope = encodeURIComponent('user:read:email chat:read chat:edit user:read:follows');
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${OFFICIAL_TWITCH_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}`;
    
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(authUrl, 'TwitchAuth', `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,resizable=yes`);
  };

  useEffect(() => {
    if (customClientId === 'gp762nuuoqcoxypju8c569th9wz7q5') {
       useStreamStore.getState().setCustomClientId('6gu4wf1zdyfcxcgmedhazg3sswibof');
    }

    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      
      if (token) {
        if (window.opener && window.opener !== window) {
           window.opener.postMessage({ type: 'TWITCH_AUTH_SUCCESS', token }, window.location.origin);
           window.close();
           return;
        }

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

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'TWITCH_AUTH_SUCCESS') {
        const token = event.data.token;
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
                setIsAuthOpen(false);
            }
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginTwitch, addStream, customClientId]);

  useEffect(() => {
    if (auth.twitch?.token) {
      fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${auth.twitch.token}`,
          'Client-Id': customClientId
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Twitch session expired');
        return res.json();
      })
      .then(data => {
        if (data.data && data.data[0]) {
          const user = data.data[0];
          loginTwitch({
            username: user.display_name,
            profileImage: user.profile_image_url,
            token: auth.twitch!.token
          });
        }
      })
      .catch(() => logoutTwitch());
    }
  }, [auth.twitch, customClientId, loginTwitch, logoutTwitch]);

  return (
    <header className="h-[header-height] glass-panel flex items-center justify-between px-6 z-9999 border-b border-white/5 shadow-2xl transition-premium backdrop-blur-xl">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Brand Section - Always Left */}
      <div className="flex items-center gap-3 shrink-0 group cursor-pointer relative">
        <div className="relative">
          <div className="w-7 h-7 bg-neutral-100 rounded flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-lg shadow-white/5">
            <div className="w-3.5 h-3.5 bg-background rounded-xs" />
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#18181b] animate-live-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xs tracking-[0.2em] text-neutral-100 uppercase group-hover:text-white transition-colors leading-none">MultiStreamZ</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Search Bar */}
        <div className="hidden lg:block group/search">
          <form onSubmit={handleSubmit} className="relative w-44">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/search:text-white transition-colors pointer-events-none">
              <Search size={12} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isValidating}
              placeholder={isValidating ? "..." : "ADICIONAR CANAL..."}
              className={`w-full bg-panel/30 border rounded-md py-1.5 pl-8 pr-8 text-[9px] font-black uppercase focus:outline-none transition-all placeholder:text-neutral-700 tracking-[0.15em] search-glow hover:bg-panel/50 ${
                isValidating ? 'border-neutral-700 opacity-50' : 'border-white/5'
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1 rounded border border-white/10 bg-white/5 text-[7px] font-black text-neutral-600 pointer-events-none">
              /
            </div>
          </form>
        </div>

        {/* Stream Selector */}
        <div className="hidden sm:block">
          <StreamSelector />
        </div>

        {/* Layout & Toolbar Group */}
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5 ml-2">
          <LayoutSelector />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={toggleChat}
            className={`p-1.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 ${activeChatStreamId ? 'text-purple-400' : 'text-neutral-400'} hover:text-white`}
            title="Alternar Chat"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={toggleMap}
            className="p-1.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 text-neutral-400 hover:text-white"
            title="Alternar Mapa"
          >
            <MapIcon size={16} />
          </button>
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 ${sidebarVisible ? 'text-neutral-100 bg-white/5 shadow-inner' : 'text-neutral-400'} hover:text-white`}
            title="Alternar Lateral"
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 text-neutral-400 hover:text-white border-l border-white/10 ml-0.5 pl-2"
            title="Configurações"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Auth Group */}
        <div className="relative ml-2">
          <button 
            onClick={() => setIsAuthOpen(!isAuthOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 transition-all active:scale-95 group/auth-main border rounded-lg shadow-xl ${
              auth.twitch 
              ? 'bg-panel/40 border-white/10 hover:border-white/20 hover:bg-panel/60' 
              : 'bg-twitch text-white hover:bg-[#772ce8] border-transparent shadow-purple-500/10'
            }`}
          >
            {auth.twitch ? (
              <>
                <div className="relative">
                  <img src={auth.twitch.profileImage} className="w-5 h-5 rounded-md ring-2 ring-background border border-white/5 object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-purple-500 rounded-full border border-background shadow-lg" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest ml-1 text-neutral-100 whitespace-nowrap hidden lg:block">
                  @{auth.twitch.username}
                </span>
              </>
            ) : (
              <>
                <Twitch size={14} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] ml-1">Entrar</span>
              </>
            )}
          </button>

          {isAuthOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-xl shadow-2xl p-5 z-9999 animate-in fade-in slide-in-from-top-4 duration-300 cubic-bezier(0.16, 1, 0.3, 1)">
              <div className="mb-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-100 mb-1 ml-1">ID MULTISTREAMZ</h3>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Gerencie suas conexões</p>
              </div>

              {auth.twitch && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group/row hover:bg-white/10 transition-premium">
                    <div className="flex items-center gap-3">
                      <img src={auth.twitch.profileImage} className="w-8 h-8 rounded-md shadow-lg" alt="" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">@{auth.twitch.username}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-twitch rounded-full" />
                          <span className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">Twitch Conectada</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={logoutTwitch} className="p-2 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 rounded-lg transition-premium">
                      <LogOut size={14} />
                    </button>
                  </div>
                  <div className="h-px bg-white/5 my-4" />
                </div>
              )}

              <div className="space-y-3">
                <button 
                  onClick={handleTwitchLogin}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg bg-twitch hover:bg-[#772ce8] text-white transition-premium shadow-lg shadow-purple-500/20 active:scale-[0.98]"
                >
                  <Twitch size={18} fill="currentColor" />
                  <span>Conectar com Twitch</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hide Toggle */}
        <button
          onClick={toggleHeader}
          className="p-1.5 ml-1 hover:bg-white/5 rounded-md text-neutral-600 hover:text-white transition-premium group/hide"
          title="Esconder Header"
        >
          <ChevronUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

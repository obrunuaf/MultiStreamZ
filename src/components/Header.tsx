import { MessageSquare, Map as MapIcon, Settings, LayoutGrid, LogOut, Twitch } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';
import { SettingsModal } from './SettingsModal';
import { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { validateAndAddStream, toggleChat, toggleMap, sidebarVisible, toggleSidebar, auth, loginTwitch, logoutTwitch, customClientId, addStream } = useStreamStore();
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
    <header className="h-[header-height] glass-panel flex items-center justify-between px-4 z-100 transition-premium">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
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

      <div className="hidden md:flex flex-2 justify-center h-full items-center">
        <StreamSelector />
      </div>

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
          className="p-2 hover:bg-white/5 rounded-md transition-premium text-neutral-400 hover:text-neutral-100"
          title="Alternar Mapa"
        >
          <MapIcon size={20} />
        </button>
        <button
          onClick={toggleSidebar}
          className={`p-2 hover:bg-white/5 rounded-md transition-premium ${sidebarVisible ? 'text-neutral-100' : 'text-neutral-400'}`}
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

        <div className="relative ml-2">
            <button 
                onClick={() => setIsAuthOpen(!isAuthOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all active:scale-95 group/auth-main border rounded-sm ${
                    auth.twitch 
                    ? 'bg-panel/40 border-white/10 hover:border-white/20' 
                    : 'bg-twitch text-white hover:bg-[#772ce8] border-transparent shadow-lg shadow-purple-500/10'
                }`}
            >
                {auth.twitch ? (
                    <>
                        <img src={auth.twitch.profileImage} className="w-4 h-4 rounded-full ring-2 ring-background border border-white/5" alt="" />
                        <span className="text-[10px] font-bold uppercase tracking-tight ml-1 text-neutral-200">
                            @{auth.twitch.username}
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
                        <p className="text-[9px] text-neutral-600 font-bold uppercase ml-1">Vincule sua conta Twitch</p>
                    </div>

                    {auth.twitch && (
                        <div className="mb-4 space-y-1">
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
                            <div className="h-px bg-white/5 my-3" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="relative group/twitch">
                            <button 
                                onClick={handleTwitchLogin}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-sm bg-twitch hover:bg-[#772ce8] text-white transition-colors"
                            >
                                <Twitch size={16} fill="currentColor" />
                                <span>Sign in with Twitch</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

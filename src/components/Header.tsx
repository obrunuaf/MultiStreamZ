import { MessageSquare, Map as MapIcon, Settings, User, LayoutGrid, LogOut } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';
import { SettingsModal } from './SettingsModal';
import { useState, useEffect } from 'react'; // Added useEffect import

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { addStream, toggleChat, toggleMap, sidebarVisible, toggleSidebar, auth, loginTwitch, logoutTwitch, loginKick, logoutKick, customClientId } = useStreamStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addStream(input.trim());
      setInput('');
    }
  };

  const handleTwitchLogin = () => {
    // Uses the ID from store (can be user-provided via settings)
    const REDIRECT_URI = window.location.origin;
    const scope = 'user:read:email';
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${customClientId}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}`;
    
    window.location.href = authUrl;
  };

  // Check for OAuth Callback on mount
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      
      if (token) {
        // Fetch real user info from Twitch Helix API
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
                
                // Automatically add the user's own stream to the grid
                addStream(user.login);
            }
        })
        .catch(err => console.error('Twitch Auth Error:', err));
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [loginTwitch, addStream, customClientId]);

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
            placeholder="Adicionar live..."
            className="w-full bg-panel border border-white/5 rounded-full py-1.5 px-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-600 tracking-tight"
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

        {/* Auth Button */}
        <div className="relative ml-2">
          {!auth.twitch && !auth.kick ? (
            <button 
              onClick={() => setIsAuthOpen(!isAuthOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-background rounded-md text-sm font-bold hover:bg-white transition-all active:scale-95"
            >
              <User size={16} />
              <span className="uppercase text-[10px] tracking-tight text-nowrap">Conectar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {auth.twitch && (
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md group/auth relative">
                  <img src={auth.twitch.profileImage} alt="Twitch" className="w-4 h-4 rounded-full" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-tight">{auth.twitch.username}</span>
                  <button onClick={logoutTwitch} className="opacity-0 group-hover/auth:opacity-100 absolute -top-1 -right-1 bg-background border border-border p-0.5 rounded-full text-neutral-400 hover:text-white transition-all">
                    <LogOut size={10} />
                  </button>
                </div>
              )}
              {auth.kick && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md group/auth relative">
                  <img src={auth.kick.profileImage} alt="Kick" className="w-4 h-4 rounded-full" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-tight">{auth.kick.username}</span>
                  <button onClick={logoutKick} className="opacity-0 group-hover/auth:opacity-100 absolute -top-1 -right-1 bg-background border border-border p-0.5 rounded-full text-neutral-400 hover:text-white transition-all">
                    <LogOut size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          {isAuthOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3 z-50">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3 ml-1">Conectar Contas</h3>
               <div className="space-y-2">
                  <button 
                    onClick={handleTwitchLogin}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg bg-[#a970ff]/10 hover:bg-[#a970ff]/20 text-[#a970ff] border border-[#a970ff]/20 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#a970ff] shadow-[0_0_8px_#a970ff]" />
                    Twitch
                  </button>
                  <button 
                    onClick={() => {
                        loginKick({ 
                          username: 'UserKick', 
                          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kick', 
                          token: 'fake' 
                        });
                        addStream('kick.com/UserKick');
                        setIsAuthOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg bg-[#53fc18]/10 hover:bg-[#53fc18]/20 text-[#53fc18] border border-[#53fc18]/20 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#53fc18] shadow-[0_0_8px_#53fc18]" />
                    Kick
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

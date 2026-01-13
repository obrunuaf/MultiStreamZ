import { MessageSquare, Map as MapIcon, Settings, LayoutGrid, LogOut, Twitch, Search, ChevronUp, ChevronDown, Wrench, Trash2, Zap, RefreshCw, Info } from 'lucide-react';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSelector } from './StreamSelector';
import { LayoutSelector } from './LayoutSelector';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Suggestion } from '../hooks/useAutocomplete';
import { useAutocomplete } from '../hooks/useAutocomplete';

export const Header: React.FC = () => {
  const [input, setInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, setSuggestions } = useAutocomplete(input);

  const { 
    validateAndAddStream, 
    toggleChat, 
    toggleMap, 
    chatVisible,
    mapVisible,
    sidebarVisible, 
    toggleSidebar, 
    auth, 
    loginTwitch, 
    logoutTwitch, 
    customClientId, 
    addStream, 
    activeChatStreamId,
    toggleHeader,
    amoledMode,
    setAmoledMode,
    resetLayout,
    reorderStreams
  } = useStreamStore();

  const highPerformanceMode = useStreamStore(state => state.highPerformanceMode);
  const setHighPerformanceMode = (val: boolean) => useStreamStore.getState().setHighPerformanceMode(val);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isValidating) {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
      } else {
        setIsValidating(true);
        const success = await validateAndAddStream(input.trim());
        if (success) {
          setInput('');
          setSuggestions([]);
        }
        setIsValidating(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev + 1) % suggestions.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        e.preventDefault();
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        handleSelectSuggestion(suggestions[activeIndex]);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    validateAndAddStream(s.login);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleReset = () => { 
    resetLayout(); 
    setIsSettingsOpen(false);
    alert('Layout resetado!'); 
  };
  
  const handleClear = () => {
    if (confirm('Remover todas as lives?')) {
      reorderStreams([]);
      setIsSettingsOpen(false);
    }
  };

  return (
    <header className="h-[header-height] glass-panel flex items-center justify-between px-4 md:px-6 z-50 border-b border-white/5 shadow-2xl transition-premium backdrop-blur-xl">
      
      {/* Brand Section - Always Left */}
      <div className="flex items-center gap-3 shrink-0 group cursor-pointer relative ">
        <div className="relative">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-neutral-100/5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-xl overflow-hidden border border-white/10">
            <img src="/logo.png" className="w-full h-full object-cover" alt="ZMultiLive Logo" />
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 md:w-3 h-2.5 md:h-3 bg-red-500 rounded-full border-2 border-[#18181b] animate-live-pulse z-10" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-[10px] md:text-xs tracking-[0.2em] text-neutral-100 uppercase group-hover:text-white transition-colors leading-none">ZMultiLive</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Search Bar */}
        <div className="hidden lg:block group/search" ref={dropdownRef}>
          <form onSubmit={handleSubmit} className="relative w-56">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within/search:text-white transition-colors pointer-events-none">
              <Search size={12} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => input.length >= 2 && setShowSuggestions(true)}
              disabled={isValidating}
              placeholder={isValidating ? "..." : "BUSCAR CANAL..."}
              className={`w-full bg-panel/30 border rounded-md py-1.5 pl-8 pr-8 text-[9px] font-black uppercase focus:outline-none transition-all placeholder:text-neutral-700 tracking-[0.15em] search-glow hover:bg-panel/50 ${
                isValidating ? 'border-neutral-700 opacity-50' : 'border-white/5'
              }`}
            />
            {isLoading && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1 rounded border border-white/10 bg-white/5 text-[7px] font-black text-neutral-600 pointer-events-none">
              /
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-panel border border-white/10 rounded-lg shadow-2xl overflow-hidden z-100"
                >
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {suggestions.map((s, index) => (
                      <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectSuggestion(s)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${
                          activeIndex === index ? 'bg-twitch/20 text-white' : 'hover:bg-white/5 text-neutral-400'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img src={s.profile_image} className="w-7 h-7 rounded-md object-cover border border-white/10" alt="" />
                          {s.is_live && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#18181b] animate-pulse" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-tight truncate">{s.display_name}</span>
                            <span className={`text-[7px] font-black uppercase ${s.platform === 'twitch' ? 'text-twitch' : 'text-kick'}`}>
                              {s.platform}
                            </span>
                          </div>
                          {s.is_live && (
                            <span className="text-[7px] font-bold text-neutral-500 truncate lowercase">{s.game_name}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
        {/* Stream Selector */}
        <div className="hidden sm:block">
          <StreamSelector />
        </div>

        {/* Layout & Toolbar Group */}
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5 ml-2 relative" ref={toolsRef}>
          <LayoutSelector />
          <div className="w-px h-4 bg-white/10 mx-1" />
          
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`flex items-center gap-1.5 p-1.5 px-2.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 ${
              isToolsOpen ? 'bg-white/10 text-white' : 'text-neutral-400'
            } hover:text-white group/tools`}
            title="Ferramentas Extra"
          >
            <div className="relative">
              <Wrench size={16} />
              {(activeChatStreamId && !chatVisible) && (
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-background animate-pulse" />
              )}
            </div>
            <ChevronDown size={12} className={`transition-transform duration-300 ${isToolsOpen ? 'rotate-180 text-white' : 'text-neutral-600'}`} />
          </button>

          {/* Tools Dropdown */}
          <AnimatePresence>
            {isToolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-48 glass-panel border border-white/10 rounded-xl shadow-2xl p-2 z-100"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { toggleChat(); setIsToolsOpen(false); }}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors group/item ${
                      chatVisible ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className={chatVisible ? 'text-purple-400' : 'text-neutral-500'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chat Multilive</span>
                    </div>
                    {chatVisible && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(145,70,255,0.5)]" />}
                  </button>

                  <button
                    onClick={() => { toggleMap(); setIsToolsOpen(false); }}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors group/item ${
                      mapVisible ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapIcon size={16} className={mapVisible ? 'text-blue-400' : 'text-neutral-500'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mapa GPS</span>
                    </div>
                    {mapVisible && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  <button
                    onClick={toggleSidebar}
                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors group/item ${
                      sidebarVisible ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={16} className={sidebarVisible ? 'text-white' : 'text-neutral-500'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Painel Lateral</span>
                    </div>
                    {sidebarVisible && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-1.5 rounded-md transition-premium hover:bg-white/5 active:scale-95 border-l border-white/10 ml-0.5 pl-2 ${
                isSettingsOpen ? 'text-white bg-white/5' : 'text-neutral-400'
              } hover:text-white`}
              title="Configurações"
            >
              <Settings size={16} className={isSettingsOpen ? 'animate-spin-slow' : ''} />
            </button>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 glass-panel border border-white/10 rounded-xl shadow-2xl p-4 z-100 space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Settings size={14} className="text-neutral-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-100">Ajustes</span>
                  </div>

                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setHighPerformanceMode(!highPerformanceMode)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Zap size={14} className={highPerformanceMode ? 'text-yellow-500' : 'text-neutral-600'} />
                        <span className="text-[11px] font-bold text-neutral-300">Alto Desempenho</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${highPerformanceMode ? 'bg-yellow-500' : 'bg-neutral-800'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${highPerformanceMode ? 'left-4.5' : 'left-0.5'}`} />
                      </div>
                    </button>

                    <button 
                      onClick={() => setAmoledMode(!amoledMode)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-3.5 h-3.5 rounded-md border border-white/10 ${amoledMode ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,1)]' : 'bg-neutral-800'}`} />
                        <span className="text-[11px] font-bold text-neutral-300">Modo Amoled</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${amoledMode ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${amoledMode ? 'left-4.5' : 'left-0.5'}`} />
                      </div>
                    </button>
                  </div>

                  <div className="h-px bg-white/5 mx-1" />

                  <div className="space-y-1.5">
                    <button 
                      onClick={handleReset}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-neutral-400 hover:text-white"
                    >
                      <RefreshCw size={14} />
                      <span className="text-[11px] font-bold">Resetar Layout</span>
                    </button>

                    <button 
                      onClick={handleClear}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 transition-colors text-neutral-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      <span className="text-[11px] font-bold">Limpar Todas as Lives</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-start gap-2 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                      <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[8px] text-blue-400/60 leading-tight">
                        Seus dados são salvos localmente no navegador.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-100 mb-1 ml-1">ID ZMULTILIVE</h3>
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

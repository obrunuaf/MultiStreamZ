import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Platform = 'twitch' | 'kick' | 'youtube' | 'custom';

export interface Stream {
  id: string;
  channelName: string;
  platform: Platform;
  url: string;
  isMuted: boolean;
  volume: number;
  reloadKey: number;
  metadata?: {
    isLive: boolean;
    viewerCount: number;
    gameName?: string;
    title?: string;
    profileImage?: string;
    lastUpdated: number;
  };
}

interface GridProportions {
  columns: number[]; // percentages
  rows: number[];    // percentages
}

interface StreamState {
  streams: Stream[];
  sidebarVisible: boolean;
  chatVisible: boolean;
  mapVisible: boolean;
  sidebarWidth: number;
  mapHeight: number;
  featuredStreamId: string | null;
  activeChatStreamId: string | null;
  customMapUrl: string;
  layoutType: 'grid' | 'featured' | 'sidebar' | 'columns' | 'interactive';
  gridProportions: GridProportions;
  streamRects: Record<string, { top: number; left: number; width: number; height: number }>;
  flexLayoutState: string | null;
  auth: {
    twitch: { username: string; profileImage: string; token: string } | null;
    kick: { username: string; profileImage: string; token: string } | null;
  };
  customClientId: string;
  kickClientId: string;
  
  addStream: (urlOrName: string) => void;
  removeStream: (id: string) => void;
  reorderStreams: (streams: Stream[]) => void;
  updateGridProportion: (type: 'columns' | 'rows', index: number, value: number) => void;
  setFeaturedStream: (id: string | null) => void;
  setActiveChatStream: (id: string | null) => void;
  setCustomMapUrl: (url: string) => void;
  setLayoutType: (layout: 'grid' | 'featured' | 'sidebar' | 'columns' | 'interactive') => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
  toggleMap: () => void;
  setStreamVolume: (id: string, volume: number) => void;
  toggleStreamMute: (id: string) => void;
  reloadStream: (id: string) => void;
  resetLayout: () => void;
  setSidebarWidth: (width: number) => void;
  setMapHeight: (height: number) => void;
  setStreamRect: (id: string, rect: { top: number; left: number; width: number; height: number } | null) => void;
  setFlexLayoutState: (state: string) => void;
  loginTwitch: (data: { username: string; profileImage: string; token: string }) => void;
  logoutTwitch: () => void;
  loginKick: (data: { username: string; profileImage: string; token: string }) => void;
  logoutKick: () => void;
  setCustomClientId: (id: string) => void;
  setKickClientId: (id: string) => void;
  updateStreamMetadata: (id: string, metadata: Partial<Stream['metadata']>) => void;
  validateAndAddStream: (input: string) => Promise<boolean>;
}

const isValidStreamInput = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 100) return false;
  // Allow URLs or simple channel names (alphanumeric, underscore, hyphen)
  const urlPattern = /^https?:\/\/(www\.)?(twitch\.tv|kick\.com)\/[a-zA-Z0-9_-]+/;
  const namePattern = /^[a-zA-Z0-9_-]{2,25}$/;
  return urlPattern.test(trimmed) || namePattern.test(trimmed);
};

const parseStreamInput = (input: string): { channelName: string; platform: Platform; url: string } | null => {
  const trimmed = input.trim();
  
  if (!isValidStreamInput(trimmed)) return null;
  
  if (trimmed.includes('twitch.tv/')) {
    const name = trimmed.split('twitch.tv/')[1].split('?')[0].split('/')[0];
    return { channelName: name, platform: 'twitch', url: `https://player.twitch.tv/?channel=${name}&parent=${window.location.hostname}` };
  }
  
  if (trimmed.includes('kick.com/')) {
    const name = trimmed.split('kick.com/')[1].split('?')[0].split('/')[0];
    return { channelName: name, platform: 'kick', url: `https://player.kick.com/${name}` };
  }
  
  // Default to Twitch if just a name is provided
  return { channelName: trimmed, platform: 'twitch', url: `https://player.twitch.tv/?channel=${trimmed}&parent=${window.location.hostname}` };
};

export const useStreamStore = create<StreamState>()(
  persist(
    (set) => ({
      streams: [],
      sidebarVisible: true,
      chatVisible: true,
      mapVisible: true,
      sidebarWidth: 360,
      mapHeight: 300,
      featuredStreamId: null,
      activeChatStreamId: null,
      customMapUrl: '',
      layoutType: 'grid',
      gridProportions: {
        columns: [50, 50],
        rows: [50, 50]
      },
      streamRects: {},
      flexLayoutState: null,
      auth: {
        twitch: null,
        kick: null,
      },
      customClientId: '6gu4wf1zdyfcxcgmedhazg3sswibof',
      kickClientId: '01KEJ794H7E71R2YZKFYZCYDDV',

      addStream: (urlOrName) => set((state) => {
        const parsed = parseStreamInput(urlOrName);
        
        // Validation failed
        if (!parsed) return state;
        
        const { channelName, platform, url } = parsed;
        
        // Check for duplicate (same channel + platform)
        const isDuplicate = state.streams.some(
          s => s.channelName.toLowerCase() === channelName.toLowerCase() && s.platform === platform
        );
        if (isDuplicate) return state;
        
        const newStream: Stream = {
          id: uuidv4(),
          channelName,
          platform,
          url,
          isMuted: false,
          volume: 0.5,
          reloadKey: 0,
        };
        const nextStreams = [...state.streams, newStream];
        return { 
          streams: nextStreams,
          featuredStreamId: state.featuredStreamId || newStream.id,
          activeChatStreamId: state.activeChatStreamId || newStream.id
        };
      }),

      removeStream: (id) => set((state) => {
        const nextStreams = state.streams.filter((s) => s.id !== id);
        let nextChatId = state.activeChatStreamId;
        
        if (state.activeChatStreamId === id) {
          nextChatId = nextStreams[0]?.id || null;
        }

        return {
          streams: nextStreams,
          featuredStreamId: state.featuredStreamId === id ? (nextStreams[0]?.id || null) : state.featuredStreamId,
          activeChatStreamId: nextChatId
        };
      }),

      reorderStreams: (streams) => set({ streams }),

      updateGridProportion: (type, index, value) => set((state) => {
        const next = [...state.gridProportions[type]];
        next[index] = value;
        // Adjust adjacent proportion to keep sum 100
        if (index < next.length - 1) {
          const diff = value - state.gridProportions[type][index];
          next[index + 1] = Math.max(10, next[index + 1] - diff);
        }
        return {
          gridProportions: {
            ...state.gridProportions,
            [type]: next
          }
        };
      }),
      
      setFeaturedStream: (id) => set((state) => {
        if (!id) return { featuredStreamId: null };
        
        // Auto-mute others, unmute featured
        const updatedStreams = state.streams.map(s => ({
          ...s,
          isMuted: s.id !== id
        }));
        
        const index = updatedStreams.findIndex(s => s.id === id);
        if (index > -1) {
          const [stream] = updatedStreams.splice(index, 1);
          updatedStreams.unshift(stream);
        }
        
        return { 
          featuredStreamId: id, 
          activeChatStreamId: id,
          streams: updatedStreams,
          layoutType: state.layoutType === 'grid' ? 'featured' : state.layoutType 
        };
      }),

      setActiveChatStream: (id) => set({ activeChatStreamId: id }),

      setCustomMapUrl: (customMapUrl) => set({ customMapUrl }),

      setLayoutType: (layoutType) => set({ layoutType }),

      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      toggleChat: () => set((state) => ({ chatVisible: !state.chatVisible })),
      toggleMap: () => set((state) => ({ mapVisible: !state.mapVisible })),
      
      setStreamVolume: (id, volume) => set((state) => ({
        streams: state.streams.map((s) => s.id === id ? { ...s, volume } : s),
      })),

      toggleStreamMute: (id) => set((state) => ({
        streams: state.streams.map((s) => s.id === id ? { ...s, isMuted: !s.isMuted } : s),
      })),

      reloadStream: (id) => set((state) => ({
        streams: state.streams.map((s) => s.id === id ? { ...s, reloadKey: s.reloadKey + 1 } : s),
      })),

      resetLayout: () => set({
        gridProportions: {
          columns: [50, 50],
          rows: [50, 50]
        },
        layoutType: 'grid'
      }),

      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setMapHeight: (mapHeight) => set({ mapHeight }),
      setStreamRect: (id, rect) => set((state) => {
        const next = { ...state.streamRects };
        if (rect === null) {
          delete next[id];
        } else {
          next[id] = rect;
        }
        return { streamRects: next };
      }),

      setFlexLayoutState: (flexLayoutState) => set({ flexLayoutState }),

      loginTwitch: (data) => set((state) => ({ auth: { ...state.auth, twitch: data } })),
      logoutTwitch: () => set((state) => ({ auth: { ...state.auth, twitch: null } })),
      loginKick: (data) => set((state) => ({ auth: { ...state.auth, kick: data } })),
      logoutKick: () => set((state) => ({ auth: { ...state.auth, kick: null } })),
      setCustomClientId: (id) => set({ customClientId: id }),
      setKickClientId: (id) => set({ kickClientId: id }),
      updateStreamMetadata: (id, metadata) => set((state) => ({
        streams: state.streams.map(s => s.id === id ? { 
          ...s, 
          metadata: { ...(s.metadata || { isLive: false, viewerCount: 0, lastUpdated: 0 }), ...metadata, lastUpdated: Date.now() } 
        } : s)
      })),
      validateAndAddStream: async (input) => {
        const parsed = parseStreamInput(input);
        if (!parsed) return false;

        const { channelName, platform } = parsed;
        
        // Basic check: avoid duplicates
        const currentStreams = useStreamStore.getState().streams;
        if (currentStreams.some(s => s.channelName.toLowerCase() === channelName.toLowerCase() && s.platform === platform)) {
            return false;
        }

        // Real-time Validation (Market Standard)
        try {
            if (platform === 'twitch') {
                const clientId = useStreamStore.getState().customClientId;
                const token = useStreamStore.getState().auth.twitch?.token;
                const res = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
                    headers: { 'Client-Id': clientId, 'Authorization': `Bearer ${token || ''}` }
                });
                const data = await res.json();
                if (!data.data || data.data.length === 0) return false;
            } else if (platform === 'kick') {
                const res = await fetch(`https://kick.com/api/v1/channels/${channelName}`);
                if (!res.ok) return false;
            }
            
            useStreamStore.getState().addStream(input);
            return true;
        } catch (e) {
            console.error('Validation failed', e);
            useStreamStore.getState().addStream(input); // Fallback to add anyway if API fails
            return true;
        }
      }
    }),
    {
      name: 'stream-panel-storage',
      partialize: (state) => ({
        streams: state.streams,
        sidebarVisible: state.sidebarVisible,
        chatVisible: state.chatVisible,
        mapVisible: state.mapVisible,
        sidebarWidth: state.sidebarWidth,
        mapHeight: state.mapHeight,
        featuredStreamId: state.featuredStreamId,
        activeChatStreamId: state.activeChatStreamId,
        customMapUrl: state.customMapUrl,
        layoutType: state.layoutType,
        gridProportions: state.gridProportions,
        flexLayoutState: state.flexLayoutState,
        auth: state.auth,
        customClientId: state.customClientId,
        kickClientId: state.kickClientId,
      }),
    }
  )
);

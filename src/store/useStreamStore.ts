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
}

interface StreamState {
  streams: Stream[];
  sidebarVisible: boolean;
  chatVisible: boolean;
  mapVisible: boolean;
  sidebarWidth: number;
  mapHeight: number;
  featuredStreamId: string | null;
  layoutType: 'grid' | 'featured' | 'sidebar' | 'columns';
  
  addStream: (urlOrName: string) => void;
  removeStream: (id: string) => void;
  reorderStreams: (streams: Stream[]) => void;
  setFeaturedStream: (id: string | null) => void;
  setLayoutType: (layout: 'grid' | 'featured' | 'sidebar' | 'columns') => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
  toggleMap: () => void;
  setStreamVolume: (id: string, volume: number) => void;
  toggleStreamMute: (id: string) => void;
  setSidebarWidth: (width: number) => void;
  setMapHeight: (height: number) => void;
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
      layoutType: 'grid',

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
        };
        const nextStreams = [...state.streams, newStream];
        return { 
          streams: nextStreams,
          featuredStreamId: state.featuredStreamId || newStream.id 
        };
      }),

      removeStream: (id) => set((state) => {
        const nextStreams = state.streams.filter((s) => s.id !== id);
        return {
          streams: nextStreams,
          featuredStreamId: state.featuredStreamId === id ? (nextStreams[0]?.id || null) : state.featuredStreamId
        };
      }),

      reorderStreams: (streams) => set({ streams }),
      
      setFeaturedStream: (id) => set((state) => {
        if (!id) return { featuredStreamId: null };
        const newStreams = [...state.streams];
        const index = newStreams.findIndex(s => s.id === id);
        if (index > -1) {
          const [stream] = newStreams.splice(index, 1);
          newStreams.unshift(stream);
        }
        return { 
          featuredStreamId: id, 
          streams: newStreams,
          layoutType: state.layoutType === 'grid' ? 'featured' : state.layoutType 
        };
      }),

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

      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setMapHeight: (mapHeight) => set({ mapHeight }),
    }),
    {
      name: 'stream-panel-storage',
    }
  )
);

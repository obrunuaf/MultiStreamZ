import { useState, useEffect, useCallback } from 'react';
import { useStreamStore } from '../store/useStreamStore';

export interface Suggestion {
  id: string;
  login: string;
  display_name: string;
  profile_image: string;
  is_live: boolean;
  game_name: string;
  platform: 'twitch' | 'kick';
}

export const useAutocomplete = (query: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { auth, customClientId } = useStreamStore();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const allSuggestions: Suggestion[] = [];

      // Twitch Search
      const twitchToken = auth.twitch?.token;
      if (twitchToken) {
        try {
          const res = await fetch(`https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(q)}&first=5`, {
            headers: {
              'Client-Id': customClientId,
              'Authorization': `Bearer ${twitchToken}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            const twitchSuggestions: Suggestion[] = (data.data || []).map((channel: { id: string; broadcaster_login: string; display_name: string; thumbnail_url: string; is_live: boolean; game_name: string }) => ({
              id: `twitch-${channel.id}`,
              login: channel.broadcaster_login,
              display_name: channel.display_name,
              profile_image: channel.thumbnail_url?.replace('{width}', '50').replace('{height}', '50'),
              is_live: channel.is_live,
              game_name: channel.game_name,
              platform: 'twitch'
            }));
            allSuggestions.push(...twitchSuggestions);
          }
        } catch (e) {
          console.error('Twitch search failed:', e);
        }
      }

      // Kick Search (Experimental - might be blocked by CORS/Cloudflare)
      try {
        // We use the same q but limiting results
        const kickRes = await fetch(`https://kick.com/api/v1/channels/search?q=${encodeURIComponent(q)}`);
        if (kickRes.ok) {
          const kickData = await kickRes.json();
          // Adjust based on typical Kick API response structure
          // Note: Structure might vary, this is based on common open-source Kick integrations
          const kickSuggestions: Suggestion[] = (kickData.data || kickData || []).slice(0, 3).map((item: { id?: string | number; slug?: string; username?: string; profile_pic?: string; is_live?: boolean; category?: { name: string }; user?: { profile_pic: string } }) => ({
            id: `kick-${item.id || item.slug}`,
            login: item.slug || item.username || '',
            display_name: item.username || item.slug || '',
            profile_image: item.profile_pic || item.user?.profile_pic || 'https://kick.com/favicon.ico',
            is_live: item.is_live || false,
            game_name: item.category?.name || '',
            platform: 'kick'
          }));
          allSuggestions.push(...kickSuggestions);
        }
      } catch {
        // Silently fail Kick search
      }

      if (q && q.length >= 2) {
        allSuggestions.push({
          id: `manual-${q}`,
          login: q,
          display_name: `Adicionar "${q}" manualmente`,
          profile_image: 'https://vignette.wikia.nocookie.net/logopedia/images/8/83/Twitch_Glitch.svg',
          is_live: false,
          game_name: 'Link direto ou nome',
          platform: q.includes('kick.com') ? 'kick' : 'twitch'
        });
      }

      setSuggestions(allSuggestions);
    } catch (err) {
      console.error('Autocomplete fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [auth.twitch?.token, customClientId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  return { suggestions, isLoading, setSuggestions };
};


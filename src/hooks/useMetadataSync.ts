import { useEffect } from 'react';
import { useStreamStore } from '../store/useStreamStore';

const REFRESH_INTERVAL = 30000; // 30 seconds

export const useMetadataSync = () => {
    const { streams, updateStreamMetadata, auth, customClientId } = useStreamStore();

    useEffect(() => {
        const syncMetadata = async () => {
            if (streams.length === 0) return;

            // 1. Twitch Sync (Batch)
            const twitchStreams = streams.filter(s => s.platform === 'twitch');
            if (twitchStreams.length > 0) {
                const query = twitchStreams.map(s => `user_login=${s.channelName}`).join('&');
                const token = auth.twitch?.token;
                
                // Helix endpoint for live status and viewers
                fetch(`https://api.twitch.tv/helix/streams?${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                        'Client-Id': customClientId
                    }
                })
                .then(res => res.json())
                .then(data => {
                    const liveData = data.data || [];
                    twitchStreams.forEach(s => {
                        const info = liveData.find((l: { user_login: string; viewer_count: number; game_name: string; title: string }) => 
                            l.user_login.toLowerCase() === s.channelName.toLowerCase()
                        );
                        if (info) {
                            updateStreamMetadata(s.id, {
                                isLive: true,
                                viewerCount: info.viewer_count,
                                gameName: info.game_name,
                                title: info.title
                            });
                        } else {
                            updateStreamMetadata(s.id, { isLive: false, viewerCount: 0 });
                        }
                    });
                })
                .catch(err => console.error('Twitch Sync Error:', err));
            }

            // 2. Kick Sync (Individual for now, as no batch API is easily available)
            const kickStreams = streams.filter(s => s.platform === 'kick');
            kickStreams.forEach(s => {
                fetch(`https://kick.com/api/v1/channels/${s.channelName}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.livestream) {
                        updateStreamMetadata(s.id, {
                            isLive: true,
                            viewerCount: data.livestream.viewer_count,
                            gameName: data.livestream.categories?.[0]?.name,
                            title: data.livestream.session_title,
                            profileImage: data.user?.profile_pic
                        });
                    } else {
                        updateStreamMetadata(s.id, { 
                            isLive: false, 
                            viewerCount: 0,
                            profileImage: data.user?.profile_pic 
                        });
                    }
                })
                .catch(err => console.error('Kick Sync Error:', err));
            });
        };

        syncMetadata();
        const interval = setInterval(syncMetadata, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [streams, auth.twitch?.token, customClientId, updateStreamMetadata]);
};

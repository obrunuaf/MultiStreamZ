import { useEffect } from 'react';
import { useStreamStore, type Stream } from '../store/useStreamStore';
const REFRESH_INTERVAL = 30000; // 30 seconds

export const useMetadataSync = () => {
    const { updateStreamMetadata, auth, customClientId } = useStreamStore();

    useEffect(() => {
        const syncMetadata = async () => {
            const currentStreams = useStreamStore.getState().streams;
            if (currentStreams.length === 0) return;

            // 1. Twitch Sync (Batch)
            const twitchStreams = currentStreams.filter(s => s.platform === 'twitch');
            if (twitchStreams.length > 0) {
                const streamQuery = twitchStreams.map(s => `user_login=${s.channelName}`).join('&');
                const userQuery = twitchStreams.map(s => `login=${s.channelName}`).join('&');
                const token = auth.twitch?.token;
                const headers: Record<string, string> = {
                    'Client-Id': customClientId
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Fetch both stream status and user info (for profile images)
                // We use individual .then/catch to ensure one failure doesn't kill the other
                Promise.all([
                    fetch(`https://api.twitch.tv/helix/streams?${streamQuery}`, { headers })
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null),
                    fetch(`https://api.twitch.tv/helix/users?${userQuery}`, { headers })
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null)
                ])
                .then(([streamsData, usersData]) => {
                    twitchStreams.forEach(s => {
                        const updates: Partial<Stream['metadata']> = {};
                        
                        // Update Live Status if streams fetch succeeded
                        if (streamsData && streamsData.data) {
                            const info = streamsData.data.find((l: { user_login: string; viewer_count: number; game_name: string; title: string }) => 
                                l.user_login.toLowerCase() === s.channelName.toLowerCase()
                            );
                            updates.isLive = !!info;
                            updates.viewerCount = info?.viewer_count || 0;
                            updates.gameName = info?.game_name;
                            updates.title = info?.title;
                        }

                        // Update Profile Image if users fetch succeeded
                        if (usersData && usersData.data) {
                            const user = usersData.data.find((u: { login: string; profile_image_url: string }) => 
                                u.login.toLowerCase() === s.channelName.toLowerCase()
                            );
                            if (user?.profile_image_url) {
                                updates.profileImage = user.profile_image_url;
                            }
                        }

                        // Only call update if we actually have data to sync
                        if (Object.keys(updates).length > 0) {
                            updateStreamMetadata(s.id, updates);
                        }
                    });
                });
            }

            // 2. Kick Sync
            const kickStreams = currentStreams.filter(s => s.platform === 'kick');
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
    }, [auth.twitch?.token, customClientId, updateStreamMetadata]);
};

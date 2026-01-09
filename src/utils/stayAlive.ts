interface WakeLockSentinel {
    release(): Promise<void>;
}

export class StayAliveManager {
    private wakeLock: WakeLockSentinel | null = null;
    private audioContext: AudioContext | null = null;

    /**
     * Prevents the screen from dimming/sleeping and the tab from being throttled.
     */
    async enable() {
        try {
            // 1. Screen Wake Lock (prevents OS sleep)
            if ('wakeLock' in navigator) {
                const nav = navigator as unknown as { wakeLock: { request(type: string): Promise<WakeLockSentinel> } };
                this.wakeLock = await nav.wakeLock.request('screen');
                console.log('StayAlive: Wake Lock active');
                
                // Re-acquire if visibility changes
                document.addEventListener('visibilitychange', async () => {
                    if (this.wakeLock !== null && document.visibilityState === 'visible') {
                        this.wakeLock = await nav.wakeLock.request('screen');
                    }
                });
            }

            // 2. Silent Audio Loop (prevents tab throttling)
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = this.audioContext.createBuffer(1, 1, 44100);
            const silentSource = this.audioContext.createBufferSource();
            silentSource.buffer = buffer;
            silentSource.loop = true;
            silentSource.connect(this.audioContext.destination);
            silentSource.start();
            
            // Critical: Resume context on first user gesture
            const resume = async () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    console.log('StayAlive: Audio heartbeat resumed via gesture');
                    document.removeEventListener('click', resume);
                    document.removeEventListener('keydown', resume);
                }
            };
            document.addEventListener('click', resume);
            document.addEventListener('keydown', resume);

            console.log('StayAlive: Background protection standby (waiting for gesture)');

        } catch (err) {
            console.warn('StayAlive: Failed to enable background features:', err);
        }
    }

    disable() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        console.log('StayAlive: Disabled');
    }
}

export const stayAlive = new StayAliveManager();

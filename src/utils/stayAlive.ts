interface WakeLockSentinel {
    release(): Promise<void>;
}

export class StayAliveManager {
    private wakeLock: WakeLockSentinel | null = null;
    private audioContext: AudioContext | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private oscillator: OscillatorNode | null = null;

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
                
                document.addEventListener('visibilitychange', async () => {
                    if (this.wakeLock !== null && document.visibilityState === 'visible') {
                        this.wakeLock = await nav.wakeLock.request('screen');
                    }
                });
            }

            // 2. Video Heartbeat (A 1x1 hidden video keeps CPU priority high)
            // Using a tiny base64 silent mp4 to trick the browser into "Media Playing" state
            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.width = 1;
                this.videoElement.height = 1;
                this.videoElement.style.position = 'fixed';
                this.videoElement.style.top = '-100px';
                this.videoElement.style.opacity = '0';
                this.videoElement.style.pointerEvents = 'none';
                this.videoElement.loop = true;
                this.videoElement.muted = true;
                this.videoElement.setAttribute('playsinline', '');
                // Minimal silent mp4
                this.videoElement.src = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAAAAGlzb21pc28yYXZjMQAAAAhtZGF0AAAAAWZyZWUAAAAmbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAABaAABAAHAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAGWlvZHMAAAAAEAAfQC8AAABAAAgAAAAnYXZjMQAAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAAAAAAA';
                document.body.appendChild(this.videoElement);
                this.videoElement.play().catch(() => {
                    console.log('StayAlive: Video wait for interaction');
                });
            }

            // 3. Audio Oscillator Heartbeat (Continuous noise-free signal)
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(1, this.audioContext.currentTime); // 1Hz (Inaudible)
            gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime); // Ultra low gain
            
            this.oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            this.oscillator.start();

            // Critical: Resume context and video on first user gesture
            const resume = async () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                if (this.videoElement && this.videoElement.paused) {
                    this.videoElement.play().catch(() => {});
                }
                
                if (this.audioContext?.state === 'running') {
                    console.log('StayAlive: Heartbeat fully operational');
                    document.removeEventListener('click', resume);
                    document.removeEventListener('keydown', resume);
                }
            };
            document.addEventListener('click', resume);
            document.addEventListener('keydown', resume);

        } catch (err) {
            console.warn('StayAlive: Failed to enable background features:', err);
        }
    }

    disable() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.remove();
            this.videoElement = null;
        }
        console.log('StayAlive: Disabled');
    }
}

export const stayAlive = new StayAliveManager();

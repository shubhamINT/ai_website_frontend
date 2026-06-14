import { useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';

/**
 * useSpeechGate — browser VAD mic gate.
 *
 * Runs Silero VAD in-browser (@ricky0123/vad-web) and opens the published LiveKit mic
 * only while the user is actually speaking, holding it muted during silence. Fewer
 * non-speech frames reach STT → less background noise, fewer false turns, lower cost.
 * Always active in voice mode (see [[vad-always-gate]]).
 *
 * Fail-OPEN: if the VAD model can't load, the mic is left enabled so voice never
 * silently breaks. Conservative timings so an utterance's onset is never clipped.
 */
export function useSpeechGate(active: boolean) {
    const { localParticipant } = useLocalParticipant();

    useEffect(() => {
        if (!active || !localParticipant) return;

        let vad: { start: () => void; pause: () => void; destroy: () => void } | null = null;
        let cancelled = false;

        // Start held (muted); VAD opens the mic the moment speech begins.
        localParticipant.setMicrophoneEnabled(false);

        (async () => {
            try {
                const { MicVAD } = await import('@ricky0123/vad-web');
                if (cancelled) return;
                vad = await MicVAD.new({
                    positiveSpeechThreshold: 0.82,
                    negativeSpeechThreshold: 0.5,
                    redemptionMs: 800,    // keep mic hot ~0.8s after speech stops
                    preSpeechPadMs: 320,  // cover utterance onset
                    minSpeechMs: 100,
                    onSpeechStart: () => { localParticipant.setMicrophoneEnabled(true); },
                    onSpeechEnd: () => { localParticipant.setMicrophoneEnabled(false); },
                    onVADMisfire: () => { localParticipant.setMicrophoneEnabled(false); },
                });
                if (cancelled) { vad.destroy(); return; }
                vad.start();
            } catch (e) {
                console.warn('[useSpeechGate] VAD unavailable — leaving mic open', e);
                if (!cancelled) localParticipant.setMicrophoneEnabled(true); // fail open
            }
        })();

        return () => {
            cancelled = true;
            try { vad?.destroy(); } catch { /* noop */ }
        };
    }, [active, localParticipant]);
}

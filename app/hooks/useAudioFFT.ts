import { useEffect, useRef, useState } from "react";

export interface AudioFFTOptions {
    fftSize?: number;
    smoothingTimeConstant?: number;
    minVolumeThreshold?: number;
    barCount?: number;
}

export const useAudioFFT = (track?: MediaStreamTrack | null, options: AudioFFTOptions = {}) => {
    const {
        fftSize = 128,
        smoothingTimeConstant = 0.8,
        minVolumeThreshold = 10,
        barCount,
    } = options;

    const [data, setData] = useState<Uint8Array | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!track) {
            const resetHandle = requestAnimationFrame(() => {
                setData(null);
                setIsSpeaking(false);
            });

            return () => cancelAnimationFrame(resetHandle);
        }

        const setupAudio = async () => {
            try {
                if (audioContextRef.current?.state !== "closed") {
                    audioContextRef.current?.close();
                }

                const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
                audioContextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = fftSize;
                analyser.smoothingTimeConstant = smoothingTimeConstant;
                analyserRef.current = analyser;

                const source = ctx.createMediaStreamSource(new MediaStream([track]));
                source.connect(analyser);
                sourceRef.current = source;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const update = () => {
                    if (!analyserRef.current) {
                        return;
                    }

                    analyserRef.current.getByteFrequencyData(dataArray);

                    let sum = 0;
                    const range = Math.min(dataArray.length, 32);

                    for (let index = 0; index < range; index += 1) {
                        sum += dataArray[index];
                    }

                    const averageVolume = sum / range;
                    setIsSpeaking(averageVolume > minVolumeThreshold);

                    if (barCount) {
                        const sampled = new Uint8Array(barCount);

                        for (let index = 0; index < barCount; index += 1) {
                            const binIndex = Math.floor(index * (range / barCount));
                            sampled[index] = dataArray[binIndex];
                        }

                        setData(sampled);
                    } else {
                        setData(new Uint8Array(dataArray));
                    }

                    rafRef.current = requestAnimationFrame(update);
                };

                update();
            } catch (error) {
                console.error("Error setting up audio FFT:", error);
            }
        };

        void setupAudio();

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }

            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }

            if (analyserRef.current) {
                analyserRef.current.disconnect();
            }

            if (audioContextRef.current?.state !== "closed") {
                audioContextRef.current?.close();
            }
        };
    }, [track, fftSize, smoothingTimeConstant, minVolumeThreshold, barCount]);

    return { data, isSpeaking };
};

import { useEffect } from 'react';

import { LIVEKIT_TOPICS } from '@/app/hooks/topics';
import { publishJsonData } from '@/app/hooks/_lib/livekit/publish';

type LocalPublisher = {
    publishData: (payload: Uint8Array, options?: { topic?: string; reliable?: boolean }) => Promise<void> | void;
};

export function useLocationPublishing(locationRequestId: string | undefined, localParticipant: LocalPublisher | null | undefined) {
    useEffect(() => {
        if (!locationRequestId || !localParticipant) {
            return;
        }

        if (!navigator.geolocation) {
            void publishJsonData(localParticipant, { status: 'unsupported' }, { topic: LIVEKIT_TOPICS.userLocation });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                void publishJsonData(
                    localParticipant,
                    {
                        status: 'success',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    },
                    { topic: LIVEKIT_TOPICS.userLocation }
                );
            },
            (error) => {
                void publishJsonData(
                    localParticipant,
                    {
                        status: 'denied',
                        error: error.message,
                    },
                    { topic: LIVEKIT_TOPICS.userLocation }
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, [locationRequestId, localParticipant]);
}

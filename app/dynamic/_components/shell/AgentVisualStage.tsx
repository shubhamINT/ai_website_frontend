import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import type { ChatMessage } from '@/app/hooks/agentTypes';
import { CardDisplay } from '@/app/dynamic/_components/shell/CardDisplay';
import { ContactForm } from '@/app/dynamic/_components/forms/contact/ContactForm';
import { ContactFormSubmit } from '@/app/dynamic/_components/forms/contact/ContactFormSubmit';
import { JobApplicationForm } from '@/app/dynamic/_components/forms/job-application/JobApplicationForm';
import { JobApplicationSubmit } from '@/app/dynamic/_components/forms/job-application/JobApplicationSubmit';
import { MeetingForm } from '@/app/dynamic/_components/forms/meeting/MeetingForm';
import { MeetingFormSubmit } from '@/app/dynamic/_components/forms/meeting/MeetingFormSubmit';
import { StarterScreen } from '@/app/dynamic/_components/shell/StarterScreen';

const MapDisplay = dynamic(() => import('@/app/dynamic/_components/maps/MapDisplay').then((mod) => mod.MapDisplay), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-100/50 backdrop-blur-md md:h-[450px]" />,
});

const GlobalPresenceMap = dynamic(() => import('@/app/dynamic/_components/maps/GlobalPresenceMap').then((mod) => mod.GlobalPresenceMap), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-900/50 backdrop-blur-md md:h-[450px]" />,
});

const NearbyOffices = dynamic(() => import('@/app/dynamic/_components/maps/NearbyOffices').then((mod) => mod.NearbyOffices), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-100/50 backdrop-blur-md md:h-[450px]" />,
});

interface AgentVisualStageProps {
    messages: ChatMessage[];
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void;
    isThinking: boolean;
}

const visualMessageTypes = new Set<ChatMessage['type']>([
    'flashcard',
    'contact_form',
    'contact_form_submit',
    'meeting_form',
    'meeting_form_submit',
    'map_polyline',
    'global_presence',
    'nearby_offices',
    'job_application_preview',
    'job_application_submit',
]);

export const AgentVisualStage: React.FC<AgentVisualStageProps> = ({ messages, updateMessages, isThinking }) => {
    const flashcards = useMemo(() => messages.filter((message) => message.type === 'flashcard'), [messages]);
    const latestVisualMessage = useMemo(() => {
        return [...messages].reverse().find((message) => visualMessageTypes.has(message.type)) || null;
    }, [messages]);

    return (
        <div className={`absolute inset-0 z-0 flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto p-4 pb-40 pt-20 scrollbar-hide transition-all duration-500 md:justify-center md:p-12 md:pb-32 ${isThinking ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100 blur-0'}`}>
            {latestVisualMessage?.type === 'contact_form_submit' && latestVisualMessage.contactFormData ? (
                <div className="flex w-full justify-center">
                    <ContactFormSubmit key={latestVisualMessage.id} data={latestVisualMessage.contactFormData} />
                </div>
            ) : latestVisualMessage?.type === 'contact_form' && latestVisualMessage.contactFormData ? (
                <div className="flex w-full justify-center">
                    <ContactForm key={latestVisualMessage.id} data={latestVisualMessage.contactFormData} />
                </div>
            ) : latestVisualMessage?.type === 'meeting_form_submit' && latestVisualMessage.meetingInviteSubmitData ? (
                <div className="flex w-full justify-center">
                    <MeetingFormSubmit key={latestVisualMessage.id} data={latestVisualMessage.meetingInviteSubmitData} />
                </div>
            ) : latestVisualMessage?.type === 'meeting_form' && latestVisualMessage.meetingFormData ? (
                <div className="flex w-full justify-center">
                    <MeetingForm key={latestVisualMessage.id} data={latestVisualMessage.meetingFormData} />
                </div>
            ) : latestVisualMessage?.type === 'map_polyline' && latestVisualMessage.mapPolylineData ? (
                <div className="flex w-full max-w-4xl justify-center">
                    <MapDisplay
                        key={latestVisualMessage.id}
                        polyline={latestVisualMessage.mapPolylineData.polyline}
                        origin={latestVisualMessage.mapPolylineData.origin}
                        destination={latestVisualMessage.mapPolylineData.destination}
                        travelMode={latestVisualMessage.mapPolylineData.travelMode}
                        distance={latestVisualMessage.mapPolylineData.distance}
                        duration={latestVisualMessage.mapPolylineData.duration}
                    />
                </div>
            ) : latestVisualMessage?.type === 'global_presence' && latestVisualMessage.globalPresenceData ? (
                <div className="flex w-full max-w-5xl justify-center">
                    <GlobalPresenceMap key={latestVisualMessage.id} data={latestVisualMessage.globalPresenceData} />
                </div>
            ) : latestVisualMessage?.type === 'nearby_offices' && latestVisualMessage.nearbyOfficesData ? (
                <div className="flex w-full max-w-7xl justify-center">
                    <NearbyOffices key={latestVisualMessage.id} data={latestVisualMessage.nearbyOfficesData} />
                </div>
            ) : latestVisualMessage?.type === 'job_application_submit' && latestVisualMessage.jobApplicationData ? (
                <div className="flex w-full justify-center">
                    <JobApplicationSubmit key={latestVisualMessage.id} data={latestVisualMessage.jobApplicationData} />
                </div>
            ) : latestVisualMessage?.type === 'job_application_preview' && latestVisualMessage.jobApplicationData ? (
                <div className="flex w-full justify-center">
                    <JobApplicationForm
                        key={latestVisualMessage.id}
                        data={latestVisualMessage.jobApplicationData}
                        updateMessages={updateMessages}
                    />
                </div>
            ) : flashcards.length > 0 ? (
                <CardDisplay cards={flashcards} />
            ) : (
                <StarterScreen />
            )}
        </div>
    );
};

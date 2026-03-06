import type {
    ChatMessage,
    FlashcardStyle,
    MapPolylineData,
    MeetingInviteSubmitData,
    MeetingFormData,
    NearbyOfficesData,
    UserInfo,
} from '@/app/hooks/agentTypes';

type Payload = Record<string, unknown> & {
    data?: Record<string, unknown>;
};

function createMessageId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function unwrapData(payload: Payload) {
    return isRecord(payload.data) ? payload.data : payload;
}

function getString(value: unknown, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}

function getOptionalString(value: unknown) {
    return typeof value === 'string' ? value : undefined;
}

function getNumber(value: unknown, fallback = 0) {
    return typeof value === 'number' ? value : fallback;
}

function getStringArray(value: unknown) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
}

function getRecord(value: unknown) {
    return isRecord(value) ? value : undefined;
}

function getTravelMode(value: unknown): MapPolylineData['travelMode'] {
    return value === 'driving' || value === 'walking' || value === 'bicycling' || value === 'transit'
        ? value
        : undefined;
}

function getSmartIcon(icon: unknown): FlashcardStyle['smartIcon'] {
    if (typeof icon === 'string') {
        return { type: 'static', ref: icon };
    }

    if (!isRecord(icon) || typeof icon.ref !== 'string') {
        return undefined;
    }

    return {
        type: icon.type === 'animated' ? 'animated' : 'static',
        ref: icon.ref,
        fallback: getOptionalString(icon.fallback),
    };
}

function getDynamicMedia(payload: Record<string, unknown>): FlashcardStyle['dynamicMedia'] {
    const media = getRecord(payload.media);

    if (!media) {
        return undefined;
    }

    return {
        query: getOptionalString(media.query),
        source: media.source === 'unsplash' || media.source === 'pexels' ? media.source : undefined,
        aspectRatio:
            media.aspectRatio === 'auto' || media.aspectRatio === 'video' || media.aspectRatio === 'square' || media.aspectRatio === 'portrait'
                ? media.aspectRatio
                : undefined,
        mediaType: media.mediaType === 'image' || media.mediaType === 'video' ? media.mediaType : undefined,
        urls: getStringArray(payload.urls) ?? getStringArray(media.urls),
    };
}

export function getFlashcardStreamId(data: Payload) {
    return getOptionalString(data.stream_id) || null;
}

export function createFlashcardMessage(data: Payload): ChatMessage {
    const image = getRecord(data.image);

    return {
        id: createMessageId('card'),
        type: 'flashcard',
        cardData: {
            title: getString(data.title, 'Information'),
            value: getString(data.value, JSON.stringify(data)),
            accentColor: getOptionalString(data.accentColor),
            icon: typeof data.icon === 'string' || isRecord(data.icon) ? (data.icon as FlashcardStyle['icon']) : undefined,
            theme:
                data.theme === 'glass' || data.theme === 'solid' || data.theme === 'gradient' || data.theme === 'neon' || data.theme === 'highlight' || data.theme === 'info' || data.theme === 'light'
                    ? data.theme
                    : undefined,
            size:
                data.size === 'tiny' || data.size === 'extra-small' || data.size === 'small' || data.size === 'medium' || data.size === 'large' || data.size === 'sm' || data.size === 'md' || data.size === 'lg' || data.size === 'bento'
                    ? data.size
                    : undefined,
            layout:
                data.layout === 'default' || data.layout === 'horizontal' || data.layout === 'centered' || data.layout === 'media-top'
                    ? data.layout
                    : undefined,
            image: image && typeof image.url === 'string' && typeof image.alt === 'string'
                ? {
                      url: image.url,
                      alt: image.alt,
                      aspectRatio: getOptionalString(image.aspectRatio),
                  }
                : undefined,
            stream_id: getOptionalString(data.stream_id),
            card_index: typeof data.card_index === 'number' ? data.card_index : undefined,
            visual_intent:
                data.visual_intent === 'neutral' || data.visual_intent === 'urgent' || data.visual_intent === 'success' || data.visual_intent === 'warning' || data.visual_intent === 'processing' || data.visual_intent === 'cyberpunk'
                    ? data.visual_intent
                    : undefined,
            animation_style:
                data.animation_style === 'slide' || data.animation_style === 'pop' || data.animation_style === 'fade' || data.animation_style === 'flip' || data.animation_style === 'scale'
                    ? data.animation_style
                    : undefined,
            smartIcon: getSmartIcon(data.icon),
            dynamicMedia: getDynamicMedia(data),
        },
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
    };
}

export function createAgentTextMessage(data: Payload, fallbackText: string): ChatMessage {
    return {
        id: createMessageId('agent'),
        type: 'text',
        text: getString(data.text, getString(data.message, fallbackText)),
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
    };
}

export function extractUserInfoPatch(data: Payload): Partial<UserInfo> {
    return {
        ...(getOptionalString(data.user_name) && { user_name: getString(data.user_name) }),
        ...(getOptionalString(data.user_email) && { user_email: getString(data.user_email) }),
        ...(getOptionalString(data.user_phone) && { user_phone: getString(data.user_phone) }),
        ...(getOptionalString(data.user_id) && { user_id: getString(data.user_id) }),
    };
}

export function isMapPolylinePayload(data: Payload) {
    const payload = unwrapData(data);

    return Boolean(
        getOptionalString(payload.polyline) ||
            getOptionalString(data.polyline) ||
            getString(payload.type) === 'map.polyline' ||
            getString(data.type) === 'map.polyline'
    );
}

function extractMapPolylineData(data: Payload): MapPolylineData {
    const payload = unwrapData(data);

    return {
        polyline: getString(payload.polyline),
        origin: getOptionalString(payload.origin),
        destination: getOptionalString(payload.destination),
        travelMode: getTravelMode(payload.travelMode),
        distance: getOptionalString(payload.distance),
        duration: getOptionalString(payload.duration),
    };
}

export function createMapPolylineMessage(data: Payload): ChatMessage {
    return {
        id: createMessageId('map-polyline'),
        type: 'map_polyline',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        mapPolylineData: extractMapPolylineData(data),
    };
}

export function createLocationRequestMessage(data: Payload): ChatMessage {
    return {
        id: createMessageId('location-req'),
        type: 'location_request',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        locationRequestData: {
            reason: getOptionalString(data.reason),
        },
    };
}

export function createContactFormMessage(data: Payload, isSubmit: boolean): ChatMessage {
    const payload = unwrapData(data);

    return {
        id: createMessageId(isSubmit ? 'contact-form-submit' : 'contact-form'),
        type: isSubmit ? 'contact_form_submit' : 'contact_form',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        contactFormData: {
            user_name: getOptionalString(payload.user_name),
            user_email: getOptionalString(payload.user_email),
            user_phone: getOptionalString(payload.user_phone),
            contact_details: getOptionalString(payload.contact_details),
        },
    };
}

function extractMeetingFormData(data: Payload): MeetingFormData {
    const payload = unwrapData(data);

    return {
        recipient_email: getString(payload.recipient_email),
        subject: getString(payload.subject),
        description: getString(payload.description),
        location: getString(payload.location),
        start_time: getString(payload.start_time),
        duration_hours: getNumber(payload.duration_hours),
    };
}

function extractMeetingSubmitData(data: Payload): MeetingInviteSubmitData {
    const payload = unwrapData(data);

    return {
        recipient_email: getString(payload.recipient_email),
        subject: getString(payload.subject),
        start_time: getString(payload.start_time),
        status: getString(payload.status),
    };
}

export function createMeetingMessage(data: Payload, isSubmit: boolean): ChatMessage {
    return {
        id: createMessageId(isSubmit ? 'meeting-submit' : 'meeting-form'),
        type: isSubmit ? 'meeting_form_submit' : 'meeting_form',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        meetingFormData: isSubmit ? undefined : extractMeetingFormData(data),
        meetingInviteSubmitData: isSubmit ? extractMeetingSubmitData(data) : undefined,
    };
}

export function createGlobalPresenceMessage(data: Payload): ChatMessage {
    const payload = unwrapData(data);

    return {
        id: createMessageId('global-presence'),
        type: 'global_presence',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        globalPresenceData: {
            regions: (getRecord(payload.regions) as Record<string, string>) || {},
            headquarters: (getRecord(payload.headquarters) as Record<string, string>) || {},
        },
    };
}

export function createNearbyOfficesMessage(data: Payload): ChatMessage {
    const payload = unwrapData(data);

    return {
        id: createMessageId('nearby-offices'),
        type: 'nearby_offices',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        nearbyOfficesData: {
            offices: Array.isArray(payload.offices) ? (payload.offices as NearbyOfficesData['offices']) : [],
        },
    };
}

export function createJobApplicationMessage(data: Payload, isSubmit: boolean): ChatMessage {
    const payload = unwrapData(data);

    return {
        id: createMessageId(isSubmit ? 'job-application-submit' : 'job-application-preview'),
        type: isSubmit ? 'job_application_submit' : 'job_application_preview',
        sender: 'agent',
        timestamp: Date.now(),
        isInterim: false,
        jobApplicationData: {
            user_name: getOptionalString(payload.user_name),
            user_email: getOptionalString(payload.user_email),
            user_phone: getOptionalString(payload.user_phone),
            job_details: getOptionalString(payload.job_details),
            resume: getOptionalString(payload.resume),
            github: getOptionalString(payload.github),
            linkedin: getOptionalString(payload.linkedin),
            portfolio: getOptionalString(payload.portfolio),
        },
    };
}

export function removeMessagesByType(
    messages: Map<string, ChatMessage>,
    messageTypes: ChatMessage['type'] | ChatMessage['type'][]
) {
    const types = new Set(Array.isArray(messageTypes) ? messageTypes : [messageTypes]);

    for (const [key, message] of messages.entries()) {
        if (types.has(message.type)) {
            messages.delete(key);
        }
    }
}

export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

export interface FlashcardStyle {
    accentColor?: string;
    icon?: string | { type: 'static'; ref: string; fallback?: string };
    theme?: 'glass' | 'solid' | 'gradient' | 'neon' | 'highlight' | 'info' | 'light';
    size?: 'tiny' | 'extra-small' | 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    layout?: 'default' | 'horizontal' | 'centered' | 'media-top';
    image?: {
        url: string;
        alt: string;
        aspectRatio?: string;
    };
    // [NEW] Dynamic UI Extensions
    visual_intent?: 'neutral' | 'urgent' | 'success' | 'warning' | 'processing' | 'cyberpunk';
    animation_style?: 'slide' | 'pop' | 'fade' | 'flip' | 'scale';
    smartIcon?: {
        type: 'animated' | 'static';
        ref: string; // e.g. "shield-check" (Lucide) or "lottie-shield" (slug)
        fallback?: string;
    };
    dynamicMedia?: {
        urls?: string[];
        query?: string;
        source?: 'unsplash' | 'pexels';
        aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
        mediaType?: 'image' | 'video';
    };
}



export interface UserInfo {
    user_name: string;
    user_email: string;
    user_phone: string;
    user_id: string;
}

export interface ContactFormData {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    contact_details?: string;
}

export interface LocationRequestData {
    reason?: string; // e.g. "finding nearby offices" — shown to the user
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    type: 'text' | 'flashcard' | 'contact_form' | 'contact_form_submit' | 'location_request';
    text?: string;
    cardData?: {
        title: string;
        value: string;
        stream_id?: string;
        card_index?: number;
    } & FlashcardStyle;
    contactFormData?: ContactFormData;
    locationRequestData?: LocationRequestData;
    isInterim?: boolean;
    timestamp: number;
}

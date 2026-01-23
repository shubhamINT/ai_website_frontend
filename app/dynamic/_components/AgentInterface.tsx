import React, { useState, useRef, useEffect } from 'react';
import { useAgentInteraction } from '../_hooks/useAgentInteraction';
import { AudioVisualizer } from './AudioVisualizer';
import { Flashcard } from './Flashcard';
import { RoomAudioRenderer } from '@livekit/components-react';

interface AgentInterfaceProps {
    onDisconnect: () => void;
}

export const AgentInterface: React.FC<AgentInterfaceProps> = ({ onDisconnect }) => {
    const {
        agentState,
        messages,
        activeTrack,
        userTrack,
        toggleMic,
        sendText
    } = useAgentInteraction();

    const [inputText, setInputText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendText(inputText);
        setInputText('');
    };

    const handleMicToggle = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        toggleMic(newState); // Hook currently expects "mute" boolean? let's check hook definition. 
        // Hook def: toggleMic(mute: boolean)
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-zinc-900/80 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">

            {/* Essential Audio Renderer for LiveKit */}
            <RoomAudioRenderer />

            {/* Header / Status Bar */}
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className={`relative flex h-3 w-3 items-center justify-center`}>
                        <span className={`absolute h-full w-full animate-ping rounded-full opacity-75 ${agentState === 'speaking' ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
                        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${agentState === 'speaking' ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
                    </div>
                    <span className="text-sm font-medium tracking-wide text-zinc-300">
                        {agentState === 'speaking' ? 'Speaking...' : agentState === 'listening' ? 'Listening...' : 'Online'}
                    </span>
                </div>

                {/* Visualizer centered in header or small? Let's put it here for now if user speaks */}
                {/* Actually, user wants "beautifully represent both user speaking and agent speaking" */}
                {/* Let's put a small visualizer here for the AGENT */}
                <div className="flex items-center gap-4">
                    {agentState === 'speaking' && (
                        <AudioVisualizer trackRef={activeTrack} color="bg-indigo-400" />
                    )}
                    <button
                        onClick={onDisconnect}
                        className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
                    >
                        End Session
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

                {/* Messages & Flashcards Scroll Area */}
                <div className="relative z-10 h-full overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
                    <div className="flex flex-col gap-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.type === 'flashcard' && msg.cardData ? (
                                    <Flashcard title={msg.cardData.title} value={msg.cardData.value} />
                                ) : (
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ring-1 ring-inset ${msg.sender === 'user'
                                                ? 'bg-zinc-800 text-zinc-100 ring-white/10 rounded-br-none'
                                                : 'bg-indigo-600/10 text-indigo-100 ring-indigo-500/20 rounded-bl-none'
                                            } ${(msg.isInterim) ? 'opacity-60 animate-pulse' : ''}`}
                                    >
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* User Controls Area */}
            <div className="border-t border-white/5 bg-zinc-950/50 p-6 backdrop-blur-xl">
                <div className="mx-auto flex max-w-2xl flex-col gap-4">

                    {/* Dynamic Visualizer for User */}
                    <div className="flex h-12 w-full items-center justify-center rounded-xl bg-black/20 ring-1 ring-white/5">
                        {isMuted ? (
                            <span className="text-xs text-zinc-600">Microphone Muted</span>
                        ) : (
                            <AudioVisualizer trackRef={userTrack} color="bg-emerald-500" barCount={20} />
                        )}
                    </div>

                    {/* Input Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMicToggle}
                            className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-all duration-300 ${isMuted
                                    ? 'bg-red-500/10 text-red-400 ring-red-500/20 hover:bg-red-500/20'
                                    : 'bg-white/5 text-white ring-white/10 hover:bg-white/10'
                                }`}
                        >
                            {/* Mic Icon */}
                            {isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.045 2.47a.75.75 0 0 1 1.06 1.06l-1.06-1.06ZM12 2.25a.75.75 0 0 1 .75.75v5.69l-1.5-1.5V3a.75.75 0 0 1 .75-.75ZM4.5 12c0-1.23.29-2.39.805-3.415L3.498 6.78A7.478 7.478 0 0 0 3 12a.75.75 0 0 0 1.5 0Zm15 0a.75.75 0 0 0-1.5 0c0 .9-.2 1.76-.565 2.545l-1.12-1.12a5.975 5.975 0 0 1 1.685-1.425ZM12 15.75c-1.353 0-2.614-.367-3.692-1l-1.09 1.09a7.47 7.47 0 0 0 4.032 1.408v2.252h-2.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-2.25v-2.252a7.48 7.48 0 0 0 1.948-.48l-1.091-1.091a5.974 5.974 0 0 1-1.599.073Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                    <path d="M12 14.25a5.25 5.25 0 0 0 5.25-5.25v-1.5a.75.75 0 0 0-1.5 0v1.5a3.75 3.75 0 1 1-7.5 0v-1.5a.75.75 0 0 0-1.5 0v1.5a5.25 5.25 0 0 0 5.25 5.25Z" />
                                    <path d="M9 17.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
                                    <path d="M12.75 15.75v2.25h-1.5v-2.25a.75.75 0 0 1 1.5 0Z" />
                                    <path d="M12 15.75a.75.75 0 0 1 .75.75v2.25H12v-2.25a.75.75 0 0 1 0-.75Z" />
                                </svg>
                            )}
                        </button>

                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full rounded-full border-0 bg-white/5 py-3 pl-5 pr-12 text-sm text-white shadow-inner ring-1 ring-white/10 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-indigo-500 focus:outline-none"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

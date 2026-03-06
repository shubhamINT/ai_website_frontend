import React from 'react';
import { motion } from 'framer-motion';

import type { MeetingFormData } from '@/app/hooks/agentTypes';

interface MeetingFormProps {
    data: MeetingFormData;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ data }) => {
    const formattedDate = new Date(data.start_time).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = new Date(data.start_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60 backdrop-blur-2xl"
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[100px]" />
                <div className="absolute -right-[10%] top-[30%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            <div className="relative z-10 flex min-h-[500px] flex-col md:flex-row">
                <div className="relative flex w-full items-center justify-center overflow-hidden border-b border-black/5 bg-zinc-50/50 p-8 md:w-[40%] md:border-b-0 md:border-r">
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, -1, 1, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-full max-w-[200px] drop-shadow-2xl"
                        >
                            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </motion.div>
                        <div className="mt-8 text-center">
                            <h3 className="text-xl font-bold text-zinc-900">Meeting Preview</h3>
                            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-zinc-500">Review Details</p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col justify-center space-y-8 p-8 md:w-[60%] md:p-12">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/80">Calendar Invite</span>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 md:text-4xl">
                            {data.subject || 'Untitled Meeting'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-zinc-100/80 p-3 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-900">{formattedDate}</p>
                                <p className="text-sm text-zinc-500">{formattedTime} - {data.duration_hours} hour{data.duration_hours !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-zinc-100/80 p-3 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Location</p>
                                <p className="text-sm font-semibold text-zinc-800">{data.location}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-zinc-100/80 p-3 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Recipient</p>
                                <p className="text-sm font-semibold text-zinc-800">{data.recipient_email}</p>
                            </div>
                        </div>

                        {data.description && (
                            <div className="border-t border-zinc-100 pt-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">Description</p>
                                <p className="text-sm italic leading-relaxed text-zinc-600">
                                    &quot;{data.description}&quot;
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-600/60">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                            Awaiting your confirmation to send...
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';

import type { MeetingInviteSubmitData } from '@/app/hooks/agentTypes';

interface MeetingFormSubmitProps {
    data: MeetingInviteSubmitData;
}

export const MeetingFormSubmit: React.FC<MeetingFormSubmitProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white/95 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60 backdrop-blur-2xl"
        >
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-white via-white to-green-50/50" />
                <div className="absolute -left-[50%] -top-[50%] h-[100%] w-[100%] rounded-full bg-green-500/10 blur-[80px]" />
            </div>

            <div className="relative z-10 flex min-h-[380px] flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 rounded-full border-2 border-green-500/30"
                    />
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Meeting Scheduled!</h3>
                    <p className="mx-auto max-w-[200px] text-sm font-medium leading-relaxed text-zinc-500">
                        Calendar invite sent successfully to {data.recipient_email}.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 w-full rounded-2xl border border-white bg-white/50 p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-2 text-left">
                        <div className="flex items-center gap-2.5">
                            <span className="rounded-full bg-green-100 p-1.5 text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <span className="truncate text-xs font-semibold text-zinc-700">{data.subject}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="rounded-full bg-green-100 p-1.5 text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <span className="truncate text-xs font-semibold text-zinc-700">{new Date(data.start_time).toLocaleString()}</span>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-6 flex gap-1">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-green-500" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-green-500 delay-75" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-green-500 delay-150" />
                </div>
            </div>
        </motion.div>
    );
};

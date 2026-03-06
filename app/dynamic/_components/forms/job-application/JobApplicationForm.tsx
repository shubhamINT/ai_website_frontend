import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalParticipant } from '@livekit/components-react';

import type { JobApplicationData, ChatMessage } from '@/app/hooks/agentTypes';
import { LIVEKIT_TOPICS } from '@/app/hooks/topics';
import { publishJsonData } from '@/app/hooks/_lib/livekit/publish';

interface JobApplicationFormProps {
    data: JobApplicationData;
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ data, updateMessages }) => {
    const { localParticipant } = useLocalParticipant();
    const [formData, setFormData] = useState({
        user_name: data.user_name || '',
        user_email: data.user_email || '',
        user_phone: data.user_phone || '',
        job_details: data.job_details || '',
        github: '',
        linkedin: '',
        portfolio: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        await publishJsonData(
            localParticipant,
            {
                type: 'job_application_submit',
                data: formData,
            },
            { topic: LIVEKIT_TOPICS.jobApplication }
        );

        const msgType = 'job_application_submit';
        const id = `${msgType}-${Date.now()}`;

        updateMessages((prev) => {
            const next = new Map(prev);

            for (const [key, message] of next.entries()) {
                if (message.type === 'job_application_preview') {
                    next.delete(key);
                }
            }

            next.set(id, {
                id,
                type: msgType,
                sender: 'agent',
                timestamp: Date.now(),
                isInterim: false,
                jobApplicationData: formData,
            });

            return next;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60 backdrop-blur-2xl"
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full bg-indigo-500/5 blur-[100px]" />
                <div className="absolute -right-[10%] top-[30%] h-[50%] w-[50%] rounded-full bg-emerald-500/5 blur-[100px]" />
            </div>

            <div className="relative z-10 flex min-h-[550px] flex-col md:flex-row">
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-b border-black/5 bg-zinc-50/50 p-8 md:w-[35%] md:border-b-0 md:border-r">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="mb-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </motion.div>
                        <h3 className="text-xl font-bold text-zinc-900">Career Portal</h3>
                        <p className="mt-2 text-sm font-medium text-zinc-500">Join our world-class team and shape the future of AI.</p>
                    </div>
                </div>

                <div className="flex w-full flex-col justify-center p-8 md:w-[65%] md:p-12">
                    <div className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/80">Job Application</span>
                        <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                            Review &amp; Submit
                        </h2>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Applying For</label>
                                <div className="w-full rounded-2xl border border-zinc-200/50 bg-zinc-50/80 px-5 py-3.5 text-sm font-semibold italic text-zinc-700 shadow-sm">
                                    {formData.job_details || 'General Position'}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.user_name}
                                    onChange={(event) => setFormData({ ...formData, user_name: event.target.value })}
                                    placeholder="Your Name"
                                    className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Email</label>
                                <input
                                    type="email"
                                    value={formData.user_email}
                                    onChange={(event) => setFormData({ ...formData, user_email: event.target.value })}
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Phone</label>
                                <input
                                    type="text"
                                    value={formData.user_phone}
                                    onChange={(event) => setFormData({ ...formData, user_phone: event.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-zinc-100 pt-4">
                            <h4 className="ml-1 text-xs font-black uppercase tracking-widest text-zinc-400">Professional Links</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="GitHub Profile"
                                        value={formData.github}
                                        onChange={(event) => setFormData({ ...formData, github: event.target.value })}
                                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-5 text-xs text-zinc-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="LinkedIn URL"
                                        value={formData.linkedin}
                                        onChange={(event) => setFormData({ ...formData, linkedin: event.target.value })}
                                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-5 text-xs text-zinc-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 transition-all hover:border-indigo-300 hover:bg-indigo-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm font-semibold text-indigo-600">Upload Resume / Portfolio (PDF)</span>
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                                </label>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-bold tracking-wide text-white shadow-xl shadow-zinc-900/10 transition-all hover:bg-zinc-800 active:scale-[0.98] ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit Application
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import type { ContactFormData } from '@/app/hooks/agentTypes';

interface ContactFormProps {
    data: ContactFormData;
}

export const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
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
                            animate={{ y: [0, -12, 0], rotate: [0, -2, 2, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative w-full max-w-[240px] drop-shadow-xl"
                        >
                            <Image
                                src="https://intglobal.com/wp-content/uploads/2025/01/image-1226x1511-1.png"
                                alt="Paper Airplane"
                                width={1226}
                                height={1511}
                                className="h-auto w-full scale-110 object-contain"
                            />
                        </motion.div>
                    </div>
                </div>

                <div className="flex w-full flex-col justify-center space-y-8 p-8 md:w-[60%] md:p-12">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/80">Contact Us</span>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
                            Let&apos;s connect!
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Name</label>
                                <input
                                    type="text"
                                    defaultValue={data.user_name}
                                    placeholder="Your Name"
                                    className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    defaultValue={data.user_email}
                                    placeholder="name@company.com"
                                    className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Phone number <span className="text-red-500">*</span></label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                            <option>India (Bharat)</option>
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-40 text-zinc-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-[160px]">
                                        <input
                                            type="text"
                                            defaultValue={data.user_phone || '+91'}
                                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="ml-1 text-xs font-bold uppercase tracking-wide text-zinc-500">Message</label>
                                <textarea
                                    rows={3}
                                    defaultValue={data.contact_details}
                                    placeholder="Tell us about your project..."
                                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-900 shadow-sm transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

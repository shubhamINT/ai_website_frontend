
import React from 'react';
import { motion } from 'framer-motion';
import { ContactFormData } from '../../hooks/agentTypes';

interface ContactFormSubmitProps {
    data: ContactFormData;
}

export const ContactFormSubmit: React.FC<ContactFormSubmitProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        >
            <div className="flex flex-col items-center justify-center p-10 md:p-14 min-h-[340px]">
                {/* Decorative background glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                {/* Animated spinner */}
                <div className="relative z-10 mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="w-14 h-14 rounded-full border-[3px] border-white/10 border-t-white/80"
                    />
                    {/* Inner pulse */}
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    </motion.div>
                </div>

                {/* Status text */}
                <div className="relative z-10 text-center space-y-3">
                    <motion.h3
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent"
                    >
                        Submitting your details
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-zinc-500"
                    >
                        Sending to our team...
                    </motion.p>

                    {/* Animated dots */}
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                                className="block w-1.5 h-1.5 rounded-full bg-white/60"
                            />
                        ))}
                    </div>
                </div>

                {/* Mini summary of what's being submitted */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative z-10 mt-8 w-full max-w-xs space-y-2 rounded-2xl bg-white/5 border border-white/5 px-5 py-4"
                >
                    {data.user_name && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500 shrink-0">
                                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                            </svg>
                            <span className="truncate">{data.user_name}</span>
                        </div>
                    )}
                    {data.user_email && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500 shrink-0">
                                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                            </svg>
                            <span className="truncate">{data.user_email}</span>
                        </div>
                    )}
                    {data.user_phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500 shrink-0">
                                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{data.user_phone}</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

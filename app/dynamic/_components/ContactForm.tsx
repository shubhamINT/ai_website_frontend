
import React from 'react';
import { motion } from 'framer-motion';
import { ContactFormData } from '../../hooks/agentTypes';

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
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        >
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side: Visual / Paper Plane */}
                <div className="relative w-full md:w-[45%] bg-[#0a0a0a] flex items-center justify-center p-8 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, -2, 2, 0]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-full max-w-[280px] drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                             <img 
                                src="https://intglobal.com/wp-content/uploads/2025/01/image-1226x1511-1.png" 
                                alt="Paper Airplane" 
                                className="w-full h-auto object-contain scale-110"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Form Fields */}
                <div className="w-full md:w-[55%] p-8 md:p-12 space-y-8 flex flex-col justify-center">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contact Us</span>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Let's connect!
                        </h2>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 ml-1">Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={data.user_name}
                                    placeholder="Name"
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 ml-1">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    defaultValue={data.user_email}
                                    placeholder="Company Email*"
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Phone and Country */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 ml-1">Phone number <span className="text-red-500">*</span></label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select className="w-full appearance-none bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-zinc-300">
                                            <option>India (भारत)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-[100px]">
                                        <input 
                                            type="text" 
                                            defaultValue="+91"
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-zinc-300"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Project Details */}
                            <div className="space-y-2">
                                <textarea 
                                    rows={3}
                                    defaultValue={data.contact_details}
                                    placeholder="Anything that you would like to add about the project?"
                                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600 resize-none"
                                />
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </motion.div>
    );
};

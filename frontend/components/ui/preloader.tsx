"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc } from "lucide-react";

export const Preloader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = "hidden";

    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500); // Wait a bit at 100%
          return 100;
        }
        // Random increment for "realistic" loading feel
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = "auto";
    }
  }, [loading]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
          
          <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center gap-8">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-16 h-16 flex items-center justify-center border border-white/20 bg-black/50 backdrop-blur-md rounded-sm overflow-hidden"
            >
               <div className="absolute inset-0 bg-white/10 animate-pulse" />
               <Disc className="w-8 h-8 animate-[spin_3s_linear_infinite]" />
            </motion.div>

            {/* Text & Progress */}
            <div className="w-full space-y-4 font-mono">
                <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500">
                    <span>System Initialization</span>
                    <span>{Math.min(100, progress)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-0.5 w-full bg-zinc-900 relative overflow-hidden">
                    <motion.div 
                        className="absolute inset-0 bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>

                <div className="h-4 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
                    {progress < 30 && "Loading Core Modules..."}
                    {progress >= 30 && progress < 70 && "Establishing Secure Connection..."}
                    {progress >= 70 && progress < 100 && "Decrypting User Interface..."}
                    {progress === 100 && "Access Granted"}
                </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-8 text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em]">
            PathOS v2.4
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

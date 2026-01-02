"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Activity, Disc, Zap, Layers, Cpu, Code2, Globe, Lock } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useRef, MouseEvent, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-black text-white selection:bg-amber-500/30 selection:text-amber-50">
      
      {/* Ticker Tape */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/5 overflow-hidden py-2">
        <div className="animate-ticker whitespace-nowrap flex gap-12 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          {Array(8).fill("/// SYSTEM ONLINE /// OPTIMIZING TRAJECTORY /// WEALTH PROTOCOL /// EXECUTION MODE").map((text, i) => (
            <span key={i} className="flex items-center gap-4">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              {text}
            </span>
          ))}
        </div>
      </div>

      <Header />

      <main className="relative">
        {/* Hero Section */}
        <div className="h-screen sticky top-0 flex flex-col justify-center px-4 sm:px-8 overflow-hidden">
           <SpotlightBackground />

          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} 
            className="max-w-[1400px] mx-auto w-full relative z-10 pt-40"
          >
            <div className="space-y-4 mb-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
               >
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                 </span>
                 <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">v2.4 System Operational</span>
               </motion.div>
            </div>

            <h1 className="text-[10vw] leading-[0.85] font-bold tracking-tighter text-white relative z-20 font-mono">
                <div className="flex flex-col items-start gap-2">
                    <DecryptedText 
                        text="ENGINEER" 
                        className="stroke-text-bold hover:text-white transition-colors duration-500" 
                        speed={50}
                        maxIterations={15}
                    />
                    <DecryptedText 
                        text="YOUR_WEALTH" 
                        className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        speed={50}
                        maxIterations={25}
                        revealDelay={500}
                    />
                </div>
            </h1>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-white/10 pt-8 relative z-20">
              <div className="md:col-span-5 space-y-6">
                <p className="text-xl text-zinc-400 leading-relaxed font-light text-balance">
                  Stop guessing. We reverse-engineer the market's highest-paying roles into a granular, week-by-week execution protocol tailored to your constraints.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border border-black bg-zinc-800 flex items-center justify-center text-[8px] text-white">
                                {["G","M","A"][i-1]}
                            </div>
                        ))}
                    </div>
                    <span>Trusted by 12,000+ Engineers</span>
                </div>
              </div>
              <div className="md:col-span-7 flex flex-col items-end gap-4">
                <Link href="/profile" className="group relative inline-flex items-center justify-center w-full sm:w-auto">
                   <div className="absolute inset-0 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <Button size="lg" className="relative h-20 px-12 bg-white text-black hover:bg-zinc-200 text-lg tracking-widest font-bold uppercase rounded-none border border-transparent w-full sm:w-auto transition-all duration-300 transform group-hover:-translate-y-1">
                      Initiate Protocol <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </Link>
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                    Free Tier Available // No Credit Card Required
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="relative z-20 bg-black min-h-screen border-t border-white/20">
           
           <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-32">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl"
                >
                  SYSTEM <span className="text-zinc-800">ARCHITECTURE</span>
                </motion.h2>
                <div className="font-mono text-sm text-zinc-500 text-right">
                   // SCROLL FOR ANALYSIS<br/>
                   // DATA SOURCES: 14,000+
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <BentoCard 
                    title="Reverse Engineered"
                    desc="We parse thousands of job descriptions to extract the exact signal-to-noise ratio of skills."
                    icon={<Cpu className="w-8 h-8" />}
                    delay={0.1}
                 />
                 <BentoCard 
                    title="Adaptive Velocity"
                    desc="Miss a week? The system recalibrates. Ahead of schedule? The difficulty ramps up."
                    icon={<Activity className="w-8 h-8" />}
                    delay={0.2}
                    className="md:col-span-1 lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black border-zinc-800"
                 />
                 <BentoCard 
                    title="Brutal Feasibility"
                    desc="Reality checks against your timeline. No false promises."
                    icon={<Zap className="w-8 h-8 text-black" />}
                    delay={0.3}
                    className="md:col-span-1 lg:col-span-2 bg-white text-black border-transparent hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    iconClass="text-black"
                 />
                 <BentoCard 
                    title="Market Context"
                    desc="Real-time salary data integrated into your decision matrix."
                    icon={<Layers className="w-8 h-8" />}
                    delay={0.4}
                 />
                 <BentoCard 
                    title="Global Reach"
                    desc="Remote-first opportunities prioritized for maximum leverage."
                    icon={<Globe className="w-8 h-8" />}
                    delay={0.5}
                 />
                  <BentoCard 
                    title="Encrypted Core"
                    desc="Your career data is sensitive. We treat it like state secrets."
                    icon={<Lock className="w-8 h-8" />}
                    delay={0.6}
                 />
              </div>
           </div>
           
           {/* CTA Section */}
            <div className="py-32 border-t border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
                <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
                        READY TO <br/><span className="text-amber-500">EXECUTE?</span>
                    </h2>
                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                        The market waits for no one. Initialize your career operating system today.
                    </p>
                    <Link href="/register">
                        <Button data-cursor="emerald" size="lg" className="h-16 px-12 bg-white text-black hover:bg-amber-400 hover:text-black text-lg font-bold tracking-widest uppercase transition-all duration-300">
                            Create Account
                        </Button>
                    </Link>
                </div>
            </div>

           {/* Footer */}
           <footer className="border-t border-white/10 bg-black py-24 px-6 sm:px-12">
              <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                 <div>
                    <div className="flex items-center gap-2 font-mono text-lg font-bold tracking-tighter mb-4">
                      <Disc className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
                      <span>PATH_OS</span>
                    </div>
                    <p className="text-zinc-500 max-w-xs text-sm mb-8">
                       Designed for engineers who value execution over theory.
                    </p>
                    <div className="text-[10px] text-zinc-700 font-mono">
                        © 2026 PathOS INC. // ALL RIGHTS RESERVED
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-12 text-sm font-mono text-zinc-500 uppercase tracking-widest">
                    <div className="flex flex-col gap-4">
                       <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
                       <Link href="/access" className="hover:text-white transition-colors">Pricing</Link>
                       <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                       <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                       <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
                       <Link href="#" className="hover:text-white transition-colors">Discord</Link>
                    </div>
                 </div>
              </div>
           </footer>
        </div>
      </main>
    </div>
  );
}

// --- Components ---

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        
        // Check Auth
        const token = localStorage.getItem("accessToken");
        if (token) setIsAuthenticated(true);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <header className={cn(
          "fixed top-12 left-0 right-0 z-40 px-6 sm:px-12 transition-all duration-300 pointer-events-none",
          scrolled ? "pt-4" : "pt-8"
      )}>
        <div className={cn(
            "max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto transition-all duration-300 p-4 rounded-full",
            scrolled ? "bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl" : "bg-transparent"
        )}>
          <div className="flex items-center gap-3 font-mono text-xl font-bold tracking-tighter mix-blend-difference pl-2">
            <div className="relative w-8 h-8 flex items-center justify-center border border-white/20 bg-black/50 backdrop-blur-md rounded-sm overflow-hidden group">
               <div className="absolute inset-0 bg-white/10 group-hover:bg-amber-500/20 transition-colors duration-300" />
               <Disc className="w-5 h-5 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite]" />
            </div>
            <span>PATH_OS</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 p-1 rounded-full">
            <Link href="/manifesto" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Manifesto
            </Link>
            <Link href="/protocol" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Protocol
            </Link>
            <Link href="/about" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              About
            </Link>
            <Link href="/access" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Access
            </Link>
          </nav>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
                <Link href="/profile" className="pointer-events-auto">
                    <Button variant="outline" size="sm" className="font-mono text-xs h-9 bg-white text-black border-transparent hover:bg-amber-400 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold">
                    Dashboard
                    </Button>
                </Link>
            ) : (
                <>
                    <Link href="/login" className="pointer-events-auto">
                        <Button variant="ghost" size="sm" className="font-mono text-xs h-9 hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest">
                        Login
                        </Button>
                    </Link>
                    <Link href="/register" className="pointer-events-auto hidden sm:block">
                        <Button data-cursor="emerald" variant="outline" size="sm" className="font-mono text-xs h-9 bg-white text-black border-transparent hover:bg-amber-400 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold">
                        Get Started
                        </Button>
                    </Link>
                </>
            )}
          </div>
        </div>
      </header>
    )
}

function SpotlightBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        mouseX.set(clientX);
        mouseY.set(clientY);
    }

    return (
        <div 
            className="absolute inset-0 overflow-hidden pointer-events-auto" 
            onMouseMove={handleMouseMove}
        >
           {/* Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
           
           {/* Spotlight */}
           <motion.div
             className="absolute inset-0 pointer-events-none opacity-40"
             style={{
               background: useMotionTemplate`
                 radial-gradient(
                   800px circle at ${mouseX}px ${mouseY}px,
                   rgba(251, 191, 36, 0.05),
                   transparent 80%
                 )
               `,
             }}
           />
        </div>
    )
}

function DecryptedText({ 
    text, 
    className, 
    speed = 50, 
    maxIterations = 10,
    revealDelay = 0 
}: { 
    text: string, 
    className?: string, 
    speed?: number, 
    maxIterations?: number,
    revealDelay?: number
}) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovered, setIsHovered] = useState(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

    const scramble = () => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(prev => 
                prev.split("").map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / (maxIterations / text.length); 
        }, speed);
    };

    useEffect(() => {
        // Initial reveal
        const timeout = setTimeout(() => {
            scramble();
        }, revealDelay);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <motion.span
            className={cn("inline-block cursor-default font-mono", className)}
            onMouseEnter={() => scramble()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: revealDelay / 1000 }}
        >
            {displayText}
        </motion.span>
    );
}

function BentoCard({ title, desc, icon, delay, className, iconClass }: { title: string, desc: string, icon: React.ReactNode, delay: number, className?: string, iconClass?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative p-10 h-80 flex flex-col justify-between border border-white/10 overflow-hidden bg-zinc-900/20 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.05),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10">
         <div className={cn("mb-6 opacity-80 p-3 bg-white/5 w-fit rounded-lg border border-white/5", iconClass)}>{icon}</div>
         <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
         <p className="opacity-60 leading-relaxed max-w-sm text-sm">{desc}</p>
      </div>

      <div className="absolute bottom-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
         <ArrowRight className="w-6 h-6 -rotate-45" />
      </div>
    </motion.div>
  )
}
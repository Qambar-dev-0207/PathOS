"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Activity, Disc, Zap, Layers, Cpu, Code2, Globe, Lock, Play, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { useRef, MouseEvent, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-black text-white selection:bg-amber-500/30 selection:text-amber-50 font-mono">
      
      {/* Global Scanline Overlay - Refined */}
      <div className="fixed inset-0 pointer-events-none z-[60] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] pointer-events-none" />
      
      {/* High-Fidelity Noise Texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-[60] opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
        }} 
      />

      {/* Top Warning/Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 h-8 flex items-center justify-between px-4 text-[9px] uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>System: Online</span>
        </div>
        <div className="hidden sm:flex animate-pulse">
            /// WAITING FOR INPUT ///
        </div>
        <div>
            V2.4.0-BETA
        </div>
      </div>

      <Header />

      <main className="relative">
        {/* Hero Section */}
        <div className="min-h-screen sticky top-0 flex flex-col justify-center px-4 sm:px-8 overflow-hidden bg-black perspective-1000">
           <ComplexBackground />

          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} 
            className="max-w-[1600px] mx-auto w-full relative z-10 pt-32 pb-12 sm:pt-40 flex flex-col items-center text-center"
          >
            <div className="space-y-6 mb-8 flex flex-col items-center">
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, ease: "circOut" }}
                 className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md hover:bg-amber-500/10 transition-colors cursor-crosshair group"
               >
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 group-hover:scale-125 transition-transform"></span>
                 </span>
                 <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/80 group-hover:text-amber-500 transition-colors">Protocol Initiated</span>
               </motion.div>
            </div>

            <h1 className="text-[10vw] md:text-[8vw] leading-[0.8] font-bold tracking-tighter text-white relative z-20 font-sans mix-blend-lighten uppercase select-none">
                <div className="flex flex-col items-center gap-0">
                    <div className="relative group">
                        <DecryptedText 
                            text="ENGINEER" 
                            className="stroke-text-bold hover:text-white transition-colors duration-200" 
                            speed={40}
                            maxIterations={20}
                        />
                         <div className="absolute inset-0 blur-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="relative">
                        <span className="absolute -inset-2 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 opacity-0 animate-pulse blur-xl" />
                        <DecryptedText 
                            text="YOUR_WEALTH" 
                            className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                            speed={60}
                            maxIterations={30}
                            revealDelay={400}
                        />
                    </div>
                </div>
            </h1>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-8 text-sm md:text-lg text-zinc-400 max-w-xl mx-auto font-mono leading-relaxed text-balance"
            >
                <span className="text-amber-500">Warning:</span> Traditional career paths detected as inefficient. 
                We reverse-engineer high-frequency opportunities into an executable kernel.
            </motion.p>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 relative z-30">
                <Link href="/register" className="group relative">
                   <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
                   <Button size="lg" className="relative h-14 px-10 bg-white text-black hover:bg-amber-400 hover:text-black text-sm md:text-base tracking-widest font-bold uppercase rounded-none border-2 border-transparent hover:border-black/10 w-full sm:w-auto transition-all duration-300 transform group-hover:-translate-y-1 overflow-hidden">
                      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 mix-blend-difference" />
                      <span className="relative z-10 flex items-center gap-2">
                        Initialize <Terminal className="w-4 h-4" />
                      </span>
                   </Button>
                </Link>
                
                <Link href="/about" className="group">
                   <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-zinc-700 group-hover:w-8 group-hover:bg-white transition-all" />
                      Read The Manifesto
                   </span>
                </Link>
            </div>
            
            {/* Scroll Indicator */}
            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Scroll to Decrypt</span>
            </motion.div>

          </motion.div>
        </div>

        {/* Content Section */}
        <motion.div 
            style={{ y: contentY }}
            className="relative z-20 bg-black min-h-screen border-t border-white/10 shadow-[0_-50px_100px_rgba(0,0,0,1)]"
        >
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07] pointer-events-none" />
           
           <div className="max-w-[1600px] mx-auto px-6 sm:px-12 py-32">
              <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-8 border-b border-white/10 pb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4" /> System Analysis
                    </div>
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-7xl font-bold tracking-tighter uppercase font-sans"
                    >
                        Core <span className="text-zinc-800 stroke-text">Architecture</span>
                    </motion.h2>
                </div>
                <div className="font-mono text-xs text-zinc-600 text-right space-y-1">
                   <div>[STATUS]: OPTIMAL</div>
                   <div>[UPTIME]: 99.99%</div>
                   <div>[NODES]: 14,002</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[350px] gap-6">
                 {/* Card 1: Large Feature (Reverse Engineered) */}
                 <BentoCard 
                    title="Reverse Engineered"
                    desc="We parse thousands of job descriptions to extract the exact signal-to-noise ratio of skills."
                    icon={<Cpu className="w-6 h-6 text-white" />}
                    delay={0.1}
                    className="md:col-span-2 md:row-span-2 bg-zinc-900/30 border-zinc-800"
                 >
                    {/* Visual Mockup: Skills Graph */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute bottom-0 left-0 right-0 h-3/4 flex items-end justify-between px-8 pb-8 gap-2 opacity-50">
                            {[40, 70, 45, 90, 60, 80, 50, 95, 30, 60].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ duration: 1.5, delay: 0.2 + (i * 0.05), ease: "circOut" }}
                                    className="w-full bg-gradient-to-t from-zinc-800 to-zinc-600 hover:from-amber-600 hover:to-amber-400 transition-colors rounded-t-sm relative group"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-amber-500 bg-black/80 px-2 py-1 border border-amber-500/20 rounded">
                                        {h}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>
                 </BentoCard>

                 {/* Card 2: Tall Feature (Adaptive Velocity) */}
                 <BentoCard 
                    title="Adaptive Velocity"
                    desc="Miss a week? The system recalibrates. Ahead of schedule? The difficulty ramps up."
                    icon={<Activity className="w-6 h-6 text-amber-500" />}
                    delay={0.2}
                    className="md:col-span-1 md:row-span-2 bg-zinc-950 border-amber-500/20"
                 >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                         <div className="w-56 h-56 border border-dashed border-zinc-700 rounded-full animate-[spin_60s_linear_infinite]" />
                         <div className="absolute w-40 h-40 border-2 border-amber-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse] border-t-amber-500" />
                         <div className="absolute w-24 h-24 bg-amber-500/10 blur-2xl rounded-full animate-pulse" />
                    </div>
                 </BentoCard>

                 {/* Card 3: Standard (Brutal Feasibility) */}
                 <BentoCard 
                    title="Brutal Feasibility"
                    desc="Reality checks against your timeline. No false promises."
                    icon={<Zap className="w-6 h-6 text-black" />}
                    delay={0.3}
                    className="md:col-span-1 md:row-span-1 bg-white text-black border-transparent hover:scale-[1.02] transition-transform duration-500"
                    iconClass="text-black bg-black/10"
                    titleClass="text-black"
                    descClass="text-zinc-600"
                 />

                 {/* Card 4: Standard (Global Reach) */}
                 <BentoCard 
                    title="Global Reach"
                    desc="Remote-first opportunities prioritized for maximum leverage."
                    icon={<Globe className="w-6 h-6 text-white" />}
                    delay={0.5}
                    className="md:col-span-1 md:row-span-1 bg-zinc-900/50"
                 >
                     <div className="absolute top-4 right-4 animate-pulse">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                     </div>
                 </BentoCard>

                 {/* Card 5: Wide Feature (Market Context) */}
                 <BentoCard 
                    title="Market Context"
                    desc="Real-time salary data integrated into your decision matrix."
                    icon={<Layers className="w-6 h-6 text-white" />}
                    delay={0.4}
                    className="md:col-span-2 md:row-span-1 bg-zinc-900/50"
                 >
                    <div className="absolute right-8 top-8 flex gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-500 font-mono flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            MARKET: BULLISH
                        </div>
                    </div>
                 </BentoCard>

                  {/* Card 6: Wide Feature (Encrypted Core) */}
                  <BentoCard 
                    title="Encrypted Core"
                    desc="Your career data is sensitive. We treat it like state secrets."
                    icon={<Lock className="w-6 h-6 text-amber-500" />}
                    delay={0.6}
                    className="md:col-span-2 md:row-span-1 bg-zinc-900/50 border-zinc-800"
                 >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                    <div className="absolute bottom-6 right-8 font-mono text-xs text-zinc-600 flex flex-col items-end">
                        <span>AES-256-GCM</span>
                        <span className="text-[10px] opacity-50">0x4F2A...9B1C</span>
                    </div>
                 </BentoCard>
              </div>
           </div>
           
           {/* CTA Section */}
            <div className="py-40 border-t border-white/10 relative overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
                <div 
                    className="absolute inset-0 opacity-10 mix-blend-soft-light"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    }} 
                />
                
                <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-9xl font-bold tracking-tighter mb-12 mix-blend-lighten text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                            READY TO <span className="text-amber-500/90 block md:inline">EXECUTE?</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-zinc-400 mb-16 max-w-2xl mx-auto font-light">
                            The market waits for no one. Initialize your career operating system today.
                        </p>
                        <Link href="/register">
                            <Button data-cursor="emerald" size="lg" className="h-20 px-16 bg-white text-black hover:bg-amber-400 hover:text-black text-xl font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(251,191,36,0.3)] rounded-full">
                                Create Account
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

           {/* Footer */}
           <footer className="border-t border-white/10 bg-black py-24 px-6 sm:px-12 relative z-20">
              <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
                 <div className="space-y-8">
                    <div className="flex items-center gap-3 font-mono text-2xl font-bold tracking-tighter text-white">
                      <div className="w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center border border-zinc-700">
                        <Disc className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
                      </div>
                      <span>PATH_OS</span>
                    </div>
                    <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
                       Designed for engineers who value execution over theory. <br/>
                       London // New York // Tokyo
                    </p>
                    <div className="text-[10px] text-zinc-700 font-mono pt-4 border-t border-white/5 w-fit">
                        © 2026 PathOS INC. // SYSTEM ID: 882-1
                    </div>
                 </div>
                 
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-sm font-mono text-zinc-500 uppercase tracking-widest">
                 
                                     <div className="flex flex-col gap-4">
                 
                                        <span className="text-white text-xs mb-2 border-b border-white/10 pb-2 w-fit">Module</span>
                 
                                        <Link href="/manifesto" className="hover:text-amber-500 transition-colors">Manifesto</Link>
                 
                                        <Link href="/protocol" className="hover:text-amber-500 transition-colors">Protocol</Link>
                 
                                        <Link href="/access" className="hover:text-amber-500 transition-colors">Pricing</Link>
                 
                                        <Link href="/contact" className="hover:text-amber-500 transition-colors text-amber-500/80 font-bold">Contact Us</Link>
                 
                                     </div>
                 
                                     <div className="flex flex-col gap-4">
                 
                                        <span className="text-white text-xs mb-2 border-b border-white/10 pb-2 w-fit">Connect</span>
                 
                                        <Link href="https://x.com/__Qambar__" target="_blank" className="hover:text-amber-500 transition-colors">Twitter</Link>
                 
                                        <Link href="https://github.com/Qambar-dev-0207" target="_blank" className="hover:text-amber-500 transition-colors">GitHub</Link>
                 
                                        <Link href="https://linkedin.com/in/mohammed-qambar-0466132b9" target="_blank" className="hover:text-amber-500 transition-colors">LinkedIn</Link>
                 
                                        <Link href="https://qambars-portfolio.netlify.app" target="_blank" className="hover:text-amber-500 transition-colors text-amber-500 font-bold">Portfolio</Link>
                 
                                     </div>                    <div className="flex flex-col gap-4">
                       <span className="text-white text-xs mb-2 border-b border-white/10 pb-2 w-fit">Legal</span>
                       <Link href="#" className="hover:text-amber-500 transition-colors">Terms</Link>
                       <Link href="#" className="hover:text-amber-500 transition-colors">Privacy</Link>
                    </div>
                 </div>
              </div>
           </footer>
        </motion.div>
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
          "fixed top-12 left-0 right-0 z-40 px-6 sm:px-12 transition-all duration-500 pointer-events-none",
          scrolled ? "pt-4" : "pt-8"
      )}>
        <div className={cn(
            "max-w-[1600px] mx-auto flex items-center justify-between pointer-events-auto transition-all duration-500 p-4 pl-6 rounded-full border",
            scrolled ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" : "bg-transparent border-transparent"
        )}>
          <div className="flex items-center gap-3 font-mono text-xl font-bold tracking-tighter pl-2">
            <div className="relative w-8 h-8 flex items-center justify-center border border-white/20 bg-zinc-900/50 backdrop-blur-md rounded-sm overflow-hidden group">
               <div className="absolute inset-0 bg-white/10 group-hover:bg-amber-500/20 transition-colors duration-300" />
               <Disc className="w-5 h-5 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite] group-hover:text-amber-500 transition-colors" />
            </div>
            <span className="mix-blend-difference">PATH_OS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-1.5 rounded-full shadow-inner">
            {['Manifesto', 'Protocol', 'About', 'Access'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="px-5 py-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-white rounded-full transition-all duration-300">
                    {item}
                </Link>
            ))}
          </nav>
          
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
                <div className="flex gap-2">
                    <Link href="/profile" className="pointer-events-auto">
                        <Button variant="outline" size="sm" className="font-mono text-xs h-9 bg-zinc-900 text-white border-white/10 hover:bg-amber-400 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold rounded-full px-6">
                        Dashboard
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <Link href="/login" className="pointer-events-auto">
                        <Button variant="ghost" size="sm" className="font-mono text-xs h-9 text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 uppercase tracking-widest rounded-full">
                        Login
                        </Button>
                    </Link>
                    <Link href="/register" className="pointer-events-auto hidden sm:block">
                        <Button data-cursor="emerald" variant="outline" size="sm" className="font-mono text-xs h-9 bg-white text-black border-transparent hover:bg-amber-400 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold rounded-full px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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

function ComplexBackground() {
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
           {/* Complex Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-20" />
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#303030_1px,transparent_1px),linear-gradient(to_bottom,#303030_1px,transparent_1px)] bg-[size:160px_160px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-10" />

           {/* Floating Particles (Simulated with div) */}
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
           
           {/* Spotlight */}
           <motion.div
             className="absolute inset-0 pointer-events-none"
             style={{
               background: useMotionTemplate`
                 radial-gradient(
                   600px circle at ${mouseX}px ${mouseY}px,
                   rgba(255, 255, 255, 0.03),
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

function BentoCard({ title, desc, icon, delay, className, iconClass, titleClass, descClass, children }: { title: string, desc: string, icon: React.ReactNode, delay: number, className?: string, iconClass?: string, titleClass?: string, descClass?: string, children?: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative p-8 flex flex-col justify-between border border-white/10 overflow-hidden bg-zinc-900/20 backdrop-blur-sm hover:border-white/30 transition-all duration-500 rounded-3xl",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.05),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Background/Visual Content */}
      <div className="absolute inset-0 z-0">
          {children}
      </div>

      <div className="relative z-10 pointer-events-none mt-auto">
         <div className={cn("mb-4 opacity-80 p-3 bg-white/5 w-fit rounded-xl border border-white/5 backdrop-blur-md shadow-lg", iconClass)}>{icon}</div>
         <h3 className={cn("text-2xl font-bold tracking-tight mb-2 font-sans", titleClass)}>{title}</h3>
         <p className={cn("opacity-60 leading-relaxed text-sm max-w-[90%] text-balance font-mono", descClass)}>{desc}</p>
      </div>

      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-2 group-hover:translate-y-0 z-20">
         <div className="p-2 bg-white rounded-full text-black">
            <ArrowRight className="w-4 h-4 -rotate-45" />
         </div>
      </div>
    </motion.div>
  )
}
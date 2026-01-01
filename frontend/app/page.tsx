"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Activity, Disc, Zap, Layers, Cpu } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { useRef, MouseEvent } from "react";
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
    <div ref={containerRef} className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* Ticker Tape */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 overflow-hidden py-1.5">
        <div className="animate-ticker whitespace-nowrap flex gap-12 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {Array(8).fill("/// SYSTEM ONLINE /// OPTIMIZING TRAJECTORY /// WEALTH PROTOCOL /// EXECUTION MODE").map((text, i) => (
            <span key={i} className="flex items-center gap-4">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              {text}
            </span>
          ))}
        </div>
      </div>

      <header className="fixed top-10 left-0 right-0 z-40 px-6 sm:px-12 pointer-events-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 font-mono text-xl font-bold tracking-tighter mix-blend-difference">
            <div className="relative w-8 h-8 flex items-center justify-center border border-white/20 bg-black/50 backdrop-blur-md rounded-sm overflow-hidden">
               <div className="absolute inset-0 bg-white/10 animate-pulse" />
               <Disc className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
            </div>
            <span>CAREER_OS</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 p-1 rounded-full">
            <Link href="/manifesto" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Manifesto
            </Link>
            <Link href="/protocol" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Protocol
            </Link>
            <Link href="/access" className="px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black rounded-full transition-all duration-300">
              Access
            </Link>
          </nav>
          <Link href="/login" className="pointer-events-auto">
            <Button variant="outline" size="sm" className="font-mono text-xs h-9 bg-black/50 backdrop-blur-md border-white/20 hover:bg-white hover:text-black transition-all duration-500">
              [ LOGIN ]
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <div className="h-screen sticky top-0 flex flex-col justify-center px-4 sm:px-8 overflow-hidden">
           {/* Animated Grid Background */}
           <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
           </div>

          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} 
            className="max-w-[1400px] mx-auto w-full relative z-10 pt-20"
          >
            <div className="space-y-2 mb-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
               >
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">v2.0 System Online</span>
               </motion.div>
            </div>

            <h1 className="text-[11vw] leading-[0.8] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mix-blend-difference">
              <RevealText text="ENGINEER" delay={0} />
              <br />
              <RevealText text="YOUR_WEALTH" delay={0.2} />
            </h1>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-white/10 pt-8">
              <div className="md:col-span-5">
                <p className="text-xl text-zinc-400 leading-relaxed font-light text-balance">
                  Stop guessing. We reverse-engineer the market's highest-paying roles into a granular, week-by-week execution protocol tailored to your constraints.
                </p>
              </div>
              <div className="md:col-span-7 flex justify-end">
                <Link href="/profile" className="group relative inline-flex items-center justify-center">
                   <div className="absolute inset-0 bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                   <Button size="lg" className="relative h-20 px-12 bg-white text-black hover:bg-zinc-200 text-lg tracking-widest font-bold uppercase rounded-none border border-transparent">
                      Initiate Protocol <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section (Overlays the sticky hero) */}
        <div className="relative z-20 bg-black min-h-screen border-t border-white/20">
           <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-32">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl">
                  SYSTEM <span className="text-zinc-600">ARCHITECTURE</span>
                </h2>
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
                    className="md:col-span-1 lg:col-span-2 bg-zinc-900/50"
                 />
                 <BentoCard 
                    title="Brutal Feasibility"
                    desc="Reality checks against your timeline. No false promises."
                    icon={<Zap className="w-8 h-8" />}
                    delay={0.3}
                    className="md:col-span-1 lg:col-span-2 bg-white text-black"
                 />
                 <BentoCard 
                    title="Market Context"
                    desc="Real-time salary data integrated into your decision matrix."
                    icon={<Layers className="w-8 h-8" />}
                    delay={0.4}
                 />
              </div>
           </div>
           
           {/* Footer */}
           <footer className="border-t border-white/10 bg-zinc-950 py-24 px-6 sm:px-12">
              <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                 <div>
                    <div className="flex items-center gap-2 font-mono text-lg font-bold tracking-tighter mb-4">
                      <Disc className="w-5 h-5" />
                      <span>CAREER_OS</span>
                    </div>
                    <p className="text-zinc-500 max-w-xs text-sm">
                       Designed for engineers who value execution over theory.
                    </p>
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

function RevealText({ text, delay }: { text: string, delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {text}
    </motion.span>
  )
}

function BentoCard({ title, desc, icon, delay, className }: { title: string, desc: string, icon: React.ReactNode, delay: number, className?: string }) {
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
        "group relative p-10 h-80 flex flex-col justify-between border border-white/10 overflow-hidden",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10">
         <div className="mb-6 opacity-80">{icon}</div>
         <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
         <p className="opacity-60 leading-relaxed max-w-sm">{desc}</p>
      </div>

      <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <ArrowRight className="w-6 h-6 -rotate-45" />
      </div>
    </motion.div>
  )
}
"use client";

import Link from "next/link";
import { ArrowLeft, Github, Linkedin, Mail, Globe, Terminal, Cpu, Zap, Binary } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-x-hidden flex flex-col font-mono selection:bg-amber-500 selection:text-black">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none fixed" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="z-10 mb-20">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white group">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETURN_TO_BASE
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full relative z-10 space-y-24 pb-32">
        {/* Profile Hero */}
        <section className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] tracking-[0.2em] uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            System Architect Identified
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-none">
              MOHAMMED <span className="text-zinc-800 outline-text">QAMBAR</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-amber-500 font-bold tracking-widest uppercase flex items-center gap-3">
              <Terminal className="w-6 h-6" /> AI ENGINEER // ML DEVELOPER
            </h2>
          </div>

          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl font-sans">
            Aspiring Machine Learning and XR Developer with hands-on experience in building intelligent systems, automation workflows, and full-stack AI applications. Skilled in Python, computer vision, deep learning, backend engineering, and browser automation.
          </p>
        </section>

        {/* Technical Stack */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-xs">
              <Cpu className="w-4 h-4" /> Neural_Engines
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              TensorFlow, PyTorch, Scikit-learn, NLP, OpenCV, NumPy, Pandas. Expert in CNN architectures and transfer learning.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-xs">
              <Binary className="w-4 h-4" /> Core_Logic
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              FastAPI, Node.js, Python, Java, JavaScript. Specialized in high-performance backend systems and LLM integration.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-xs">
              <Zap className="w-4 h-4" /> Automation_Grid
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Playwright, Docker, Git, MongoDB, React.js. Building autonomous agents and scalable deployment pipelines.
            </p>
          </div>
        </section>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
          <SocialLink 
            href="https://github.com/Qambar-dev-0207" 
            icon={<Github className="w-5 h-5" />} 
            label="GITHUB" 
          />
          <SocialLink 
            href="https://qambars-portfolio.netlify.app" 
            icon={<Globe className="w-5 h-5" />} 
            label="PORTFOLIO" 
          />
          <SocialLink 
            href="https://linkedin.com/in/mohammed-qambar-0466132b9" 
            icon={<Linkedin className="w-5 h-5" />} 
            label="LINKEDIN" 
          />
          <SocialLink 
            href="mailto:work.qambar@gmail.com" 
            icon={<Mail className="w-5 h-5" />} 
            label="EMAIL" 
          />
        </div>

        <div className="pt-24 text-center">
            <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em]">
                PathOS v1.0 // Built for the next era of technical excellence
            </p>
        </div>
      </main>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center p-8 border border-white/5 bg-zinc-900/20 backdrop-blur-sm rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group relative overflow-hidden"
    >
      <div className="mb-3 text-zinc-500 group-hover:text-amber-500 transition-colors z-10">{icon}</div>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-hover:text-white transition-colors z-10">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  )
}
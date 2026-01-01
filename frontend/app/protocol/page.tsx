"use client";

import Link from "next/link";
import { ArrowLeft, Cpu, Activity, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      <header className="flex justify-between items-center mb-24 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> RETURN
          </Button>
        </Link>
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          System Architecture v2.0
        </div>
      </header>

      <main className="max-w-5xl mx-auto relative z-10">
        <div className="mb-24">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6">
            THE <br/>PROTOCOL
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            How we turn raw market data into your personal execution strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProtocolCard 
            icon={<Cpu className="w-8 h-8" />}
            title="01 / Signal Extraction"
            description="Our engine scans thousands of job postings for your target role in real-time. We filter out 'nice-to-haves' to identify the critical 20% of skills that drive 80% of hiring decisions."
          />
          <ProtocolCard 
            icon={<Activity className="w-8 h-8" />}
            title="02 / Gap Analysis"
            description="We compare your current verified skill set against the market signal. The difference creates your 'Delta'—the exact distance between you and your target salary."
          />
          <ProtocolCard 
            icon={<Zap className="w-8 h-8" />}
            title="03 / Velocity Planning"
            description="We apply your time constraints (hours/week) to calculate the optimal learning velocity. The system prevents burnout by enforcing realistic milestones based on cognitive load theory."
          />
          <ProtocolCard 
            icon={<Layers className="w-8 h-8" />}
            title="04 / Recursive Adaptation"
            description="The roadmap isn't static. As you complete modules, the system re-evaluates your trajectory. Faster progress unlocks advanced modules; slower progress triggers reinforcement loops."
          />
        </div>
      </main>
    </div>
  );
}

function ProtocolCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors group">
      <div className="mb-6 text-zinc-500 group-hover:text-white transition-colors">{icon}</div>
      <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
        {description}
      </p>
    </div>
  )
}

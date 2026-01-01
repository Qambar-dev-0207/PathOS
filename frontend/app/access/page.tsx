"use client";

import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      <header className="flex justify-between items-center mb-12 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> RETURN
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono uppercase tracking-widest mb-6 text-white">
            Early Access
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            SECURE YOUR <br/>POSITION
          </h1>
          <p className="text-xl text-zinc-400 max-w-xl mx-auto">
            Join the elite cohort of engineers executing on data-driven career protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
          {/* Free Tier */}
          <div className="p-8 border border-white/10 bg-zinc-900/20 rounded-lg">
            <h3 className="font-mono text-xl mb-2">Cadet</h3>
            <div className="text-4xl font-bold mb-6">$0</div>
            <ul className="space-y-4 text-sm text-zinc-400 mb-8">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Basic Roadmap Generation</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> 3 Profile Scans / Month</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Community Access</li>
            </ul>
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent">Current Plan</Button>
          </div>

          {/* Pro Tier - Featured */}
          <div className="p-10 border border-white bg-zinc-950 rounded-xl relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="font-mono text-xl mb-2">Operator</h3>
            <div className="text-5xl font-bold mb-6">$29<span className="text-lg font-normal text-zinc-500">/mo</span></div>
            <ul className="space-y-4 text-sm text-zinc-300 mb-8">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Unlimited AI Roadmaps</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Real-time Market Data Sync</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Resume Tailoring Module</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Priority Support</li>
            </ul>
            <Button className="w-full bg-white text-black hover:bg-zinc-200">Upgrade Access</Button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 border border-white/10 bg-zinc-900/20 rounded-lg">
            <h3 className="font-mono text-xl mb-2">Architect</h3>
            <div className="text-4xl font-bold mb-6">$199<span className="text-lg font-normal text-zinc-500">/mo</span></div>
            <ul className="space-y-4 text-sm text-zinc-400 mb-8">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> 1-on-1 Strategy Calls</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Mock Interview Access</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Custom Portfolio Review</li>
            </ul>
            <Button variant="outline" className="w-full">Contact Sales</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

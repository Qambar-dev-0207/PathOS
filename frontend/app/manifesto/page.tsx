"use client";

import Link from "next/link";
import { ArrowLeft, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      <header className="flex justify-between items-center mb-24 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> RETURN
          </Button>
        </Link>
        <Disc className="w-6 h-6 animate-spin" />
      </header>

      <main className="max-w-3xl mx-auto relative z-10">
        <div className="space-y-16">
          <div>
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono uppercase tracking-widest mb-6">
              Statement of Intent
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
              THE <br/>MANIFESTO
            </h1>
          </div>

          <div className="prose prose-invert prose-lg text-zinc-400 font-light leading-relaxed space-y-8 text-xl">
            <p>
              <strong className="text-white">The old playbook is dead.</strong> The era of generic degrees, passive learning, and "waiting your turn" is over. We live in a hyper-efficient market where skills—provable, high-impact capabilities—are the only currency that matters.
            </p>
            <p>
              Most career advice is noise. It's designed to keep you comfortable, not wealthy. It tells you to "follow your passion" while ignoring market realities. It encourages broad learning when depth is what commands a premium.
            </p>
            <p>
              <strong className="text-white">We built Career_OS to cut the noise.</strong>
            </p>
            <p>
              This isn't a course. It's a weapon. We reverse-engineer the specific requirements of high-paying roles and build a bridge backward to where you stand today. Every week is a sprint. Every resource is vetted. Every milestone is a step closer to leverage.
            </p>
            <p>
              We believe in:
              <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-white">
                <li><strong className="text-white">Outcome over Output:</strong> Don't just learn. Build.</li>
                <li><strong className="text-white">Market Reality:</strong> Align with what pays, not just what's popular.</li>
                <li><strong className="text-white">Speed of Execution:</strong> The faster you fail, the faster you win.</li>
              </ul>
            </p>
          </div>

          <div className="pt-12 border-t border-white/10">
            <p className="font-mono text-sm uppercase tracking-widest text-zinc-600">
              End of Transmission
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

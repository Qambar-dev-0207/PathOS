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
              Our Mission
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
              OUR <br/>MISSION
            </h1>
          </div>

          <div className="prose prose-invert prose-lg text-zinc-400 font-light leading-relaxed space-y-8 text-xl">
            <p>
              <strong className="text-white">The job market has changed.</strong> Generic advice and passive learning aren't enough anymore. To land the best roles, you need specific, high-impact skills that companies are actually looking for.
            </p>
            <p>
              Traditional career advice can often be overwhelming and disconnected from reality. It tells you to learn everything, instead of focusing on what truly matters for your career growth.
            </p>
            <p>
              <strong className="text-white">We built PathOS to provide clarity.</strong>
            </p>
            <p>
              We don't just give you a list of courses. We analyze real job descriptions to understand exactly what skills are in demand. Then, we create a personalized roadmap to help you bridge the gap between where you are and where you want to be.
            </p>
            <p>
              We believe in:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-white">
                <li><strong className="text-white">Focus on Results:</strong> Learn by building real projects, not just watching videos.</li>
                <li><strong className="text-white">Data-Driven Decisions:</strong> Focus on skills that employers are actively hiring for.</li>
                <li><strong className="text-white">Efficient Learning:</strong> Save time by focusing only on what you need to know.</li>
            </ul>
          </div>

          <div className="pt-12 border-t border-white/10">
            <p className="font-mono text-sm uppercase tracking-widest text-zinc-600">
              Start Your Journey
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

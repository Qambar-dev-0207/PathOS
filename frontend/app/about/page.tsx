"use client";

import Link from "next/link";
import { ArrowLeft, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      <header className="absolute top-8 left-8 z-10">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> RETURN
          </Button>
        </Link>
      </header>

      <main className="max-w-2xl w-full relative z-10 text-center space-y-12">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto border-2 border-white/10 flex items-center justify-center text-3xl font-mono text-zinc-500">
            {/* Placeholder for Profile Pic */}
            ME
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            THE BUILDER
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            I build systems that bridge the gap between human potential and market reality. Career_OS is my attempt to systematize success.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SocialLink 
            href="https://github.com/qambark" 
            icon={<Github className="w-5 h-5" />} 
            label="GitHub" 
          />
          <SocialLink 
            href="https://x.com/qambark" 
            icon={<Twitter className="w-5 h-5" />} 
            label="Twitter" 
          />
          <SocialLink 
            href="https://linkedin.com/in/qambark" 
            icon={<Linkedin className="w-5 h-5" />} 
            label="LinkedIn" 
          />
          <SocialLink 
            href="mailto:contact@example.com" 
            icon={<Mail className="w-5 h-5" />} 
            label="Email" 
          />
        </div>
      </main>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-lg hover:bg-white hover:text-black transition-all group"
    >
      <div className="mb-3 text-zinc-500 group-hover:text-black transition-colors">{icon}</div>
      <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
    </a>
  )
}

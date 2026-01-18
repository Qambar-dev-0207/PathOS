"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Shield, Terminal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-12 relative overflow-x-hidden flex flex-col font-mono selection:bg-amber-500 selection:text-black">
      {/* Global Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] pointer-events-none opacity-50" />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none fixed" />
      
      <header className="z-10 mb-12">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white group">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETURN_TO_BASE
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] tracking-[0.2em] uppercase"
            >
              We're Ready to Chat
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              Get in <span className="text-zinc-800 outline-text">Touch</span>
            </h1>

            <p className="text-zinc-400 leading-relaxed font-sans text-lg">
              Have a technical inquiry or protocol suggestion? Send an encrypted message to the system architect.
            </p>

            <div className="space-y-6 pt-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg border border-white/5 bg-zinc-900/50 flex items-center justify-center text-zinc-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Email_Address</div>
                  <div className="text-zinc-300">work.qambar@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg border border-white/5 bg-zinc-900/50 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Social Media</div>
                  <div className="text-zinc-300">@__Qambar__</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Message Sent</h3>
                <p className="text-zinc-400 text-sm font-sans">
                  We've received your message and will get back to you shortly.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline" 
                  className="mt-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                >
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 border border-white/10 bg-zinc-900/20 backdrop-blur-xl p-8 rounded-2xl relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Name</label>
                  <Input 
                    required 
                    placeholder="Your Name" 
                    className="bg-black/50 border-white/5 focus:border-amber-500/50 rounded-lg h-12 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Your Email</label>
                  <Input 
                    required 
                    type="email" 
                    placeholder="you@example.com" 
                    className="bg-black/50 border-white/5 focus:border-amber-500/50 rounded-lg h-12 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Your Message</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="How can we help you?" 
                    className="w-full bg-black/50 border border-white/5 focus:border-amber-500/50 outline-none p-4 rounded-lg font-mono text-sm resize-none transition-colors"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full h-14 bg-white text-black hover:bg-amber-500 hover:text-black font-bold uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-3"
                >
                  Send Message <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="pt-24 pb-8 text-center">
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em]">
              SECURE LINE // PATH_OS COMMS v1.0
          </p>
      </footer>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Disc, Share2, CheckCircle, Circle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaryonLoader } from "@/components/ui/baryon-loader";

interface PublicProfileData {
  name: string;
  role: string;
  stats: {
    total: number;
    completed: number;
    percent: number;
  };
  roadmap: any;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:8002/public/profile/${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Operator not found");
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <BaryonLoader className="scale-150 text-amber-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-mono font-bold text-zinc-500">404 // NOT_FOUND</h1>
        <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">{error || "Signal Lost"}</p>
        <Link href="/">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black mt-8">
            Return to Base
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-amber-500/30 selection:text-amber-50">
       <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
       
       <header className="p-8 flex justify-between items-center z-50 relative">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> PATH_OS
          </Button>
        </Link>
        <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Profile Link Copied to Clipboard");
            }}
            className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
        >
            <Share2 className="w-4 h-4 mr-2" /> SHARE
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
         {/* Profile Header */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 space-y-6"
         >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Public Operator Profile</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
                {data.name}
            </h1>
            <p className="text-xl text-zinc-500">
                Targeting: <span className="text-white">{data.role}</span>
            </p>
         </motion.div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <StatsCard label="Protocol Completion" value={`${data.stats.percent}%`} />
            <StatsCard label="Modules Mastered" value={`${data.stats.completed} / ${data.stats.total}`} />
            <StatsCard label="System Status" value={data.stats.percent === 100 ? "OPTIMIZED" : "EXECUTING"} />
         </div>

         {/* Roadmap Timeline */}
         <div className="space-y-12">
            <h2 className="text-2xl font-bold tracking-tight border-b border-white/10 pb-4">
                Execution Log
            </h2>
            
            <div className="space-y-4">
                {data.roadmap?.steps?.map((step: any, i: number) => (
                    <motion.div 
                        key={step.week}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                            "group flex gap-6 p-6 border rounded-lg transition-all duration-300",
                            step.completed 
                                ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" 
                                : "border-white/5 bg-zinc-900/20 opacity-50 hover:opacity-100"
                        )}
                    >
                        <div className="flex-shrink-0 pt-1">
                            {step.completed ? (
                                <CheckCircle className="w-6 h-6 text-amber-500" />
                            ) : (
                                <Circle className="w-6 h-6 text-zinc-600" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                                    Week {step.week < 10 ? `0${step.week}` : step.week}
                                </span>
                                {step.completed && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 rounded-full">
                                        COMPLETE
                                    </span>
                                )}
                            </div>
                            <h3 className={cn(
                                "text-lg font-bold",
                                step.completed ? "text-white" : "text-zinc-400"
                            )}>
                                {step.title}
                            </h3>
                            <p className="text-sm text-zinc-500 max-w-2xl">
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
         </div>
      </main>
    </div>
  );
}

function StatsCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-8 border border-white/10 bg-zinc-900/20 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                {label}
            </div>
            <div className="text-4xl font-bold tracking-tighter">
                {value}
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

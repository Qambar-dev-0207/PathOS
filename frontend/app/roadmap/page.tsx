"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, RefreshCw, ArrowUpRight, Target, Clock, Terminal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Resource {
  title: string;
  url?: string;
}

interface RoadmapStep {
  week: number;
  title: string;
  description: string;
  resources: Resource[];
  completed: boolean;
}

interface RoadmapData {
  role: string;
  steps: RoadmapStep[];
}

export default function RoadmapPage() {
  const router = useRouter();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [user, setUser] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch User Info
        const userRes = await fetch("http://localhost:8002/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
            setUser(await userRes.json());
        }

        const res = await fetch("http://localhost:8002/roadmap", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        
        if (res.ok) {
          const fetchedData = await res.json();
          // Backward compatibility check for old string-based resources
          fetchedData.steps.forEach((s: any) => {
            if (s.resources.length > 0 && typeof s.resources[0] === 'string') {
              s.resources = s.resources.map((str: string) => ({ title: str, url: "" }));
            }
          });
          
          setData(fetchedData);
          if (fetchedData.steps.length > 0) {
            setSelectedStep(fetchedData.steps[0]);
          }
        } else {
          // Fallback to local if backend fails or empty (new user)
          const stored = localStorage.getItem("generatedRoadmap");
          if (stored) {
             const parsed = JSON.parse(stored);
             // Backward compatibility
             parsed.steps.forEach((s: any) => {
                if (s.resources.length > 0 && typeof s.resources[0] === 'string') {
                  s.resources = s.resources.map((str: string) => ({ title: str, url: "" }));
                }
             });
             setData(parsed);
             setSelectedStep(parsed.steps[0]);
          } else {
            router.push("/profile");
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    if (typeof window !== "undefined") {
      fetchInitialData();
    }
  }, [router]);

  if (!data || !selectedStep) return null;

  const toggleComplete = async (week: number) => {
    const step = data.steps.find(s => s.week === week);
    if (!step) return;
    
    const newStatus = !step.completed;

    // Optimistic UI update
    const updatedSteps = data.steps.map(s => 
      s.week === week ? { ...s, completed: newStatus } : s
    );
    const updatedData = { ...data, steps: updatedSteps };
    setData(updatedData);
    
    if (selectedStep.week === week) {
      setSelectedStep(updatedSteps.find(s => s.week === week) || null);
    }

    // Backend Sync
    const token = localStorage.getItem("accessToken");
    try {
      await fetch("http://localhost:8002/roadmap/progress", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ week, completed: newStatus })
      });
    } catch (e) {
      console.error("Failed to sync progress", e);
      // Revert if failed (optional, keeping simple for now)
    }
  };

  const completedCount = data.steps.filter(s => s.completed).length;
  const totalCount = data.steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Top HUD */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} className="text-zinc-500 hover:text-white">
             <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-white" />
            <span className="font-mono text-sm font-bold tracking-tight uppercase">{data.role} Protocol</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {user && (
            <Link href={`/u/${user.id}`} target="_blank">
                <Button variant="outline" size="sm" className="hidden lg:flex font-mono text-[10px] h-8 border-white/10 text-zinc-500 hover:text-white hover:border-white/30">
                    VIEW PUBLIC PROFILE <ArrowUpRight className="ml-2 w-3 h-3" />
                </Button>
            </Link>
          )}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase text-zinc-500">
             <Clock className="w-3 h-3" />
             <span>Est. Completion: 12 Weeks</span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-full px-4 py-1.5">
             <span className="text-xs font-mono text-zinc-400">STATUS</span>
             <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
             <span className="text-xs font-mono font-bold">{progress}%</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Timeline */}
        <aside className="w-72 bg-black border-r border-white/10 flex flex-col z-20 flex-shrink-0 overflow-hidden h-[calc(100vh-4rem)] sticky top-16">
           <div className="p-4 border-b border-white/5 bg-zinc-900/50">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Execution Phase</h3>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {data.steps.map((step) => (
                <button
                  key={step.week}
                  onClick={() => setSelectedStep(step)}
                  className={cn(
                    "w-full text-left relative p-3 rounded-lg border transition-all duration-200 group",
                    selectedStep.week === step.week 
                      ? "bg-zinc-900 border-white/20 z-10" 
                      : "bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                     <div className={cn(
                       "w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-mono border transition-colors",
                       step.completed ? "bg-white text-black border-white" : "bg-zinc-950 text-zinc-500 border-zinc-800 group-hover:border-zinc-700"
                     )}>
                       {step.completed ? <CheckCircle2 className="w-3 h-3" /> : step.week}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate transition-colors",
                          selectedStep.week === step.week ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                        )}>
                          {step.title}
                        </div>
                     </div>
                  </div>
                  {/* Progress Line Connector (Visual only) */}
                  {step.week !== data.steps.length && (
                    <div className="absolute left-[23px] top-8 bottom-[-8px] w-px bg-zinc-800 -z-10" />
                  )}
                </button>
              ))}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative bg-zinc-950 flex flex-col overflow-y-auto h-[calc(100vh-4rem)]">
           {/* Background noise/grid */}
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none fixed" />
           
           <AnimatePresence mode="wait">
             <motion.div
               key={selectedStep.week}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="p-6 md:p-12 lg:p-16 max-w-6xl mx-auto w-full z-10"
             >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full mb-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                   <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      Week 0{selectedStep.week} Directive
                   </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 leading-tight">
                   {selectedStep.title}
                </h1>

                <div className="prose prose-invert prose-lg max-w-none mb-12">
                   <p className="text-zinc-400 font-light leading-relaxed text-lg md:text-xl">
                      {selectedStep.description}
                   </p>
                </div>

                {/* Interactive Action Module */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/10 pt-8 mt-8">
                   <div className="lg:col-span-2 space-y-6">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">
                         Recommended Resources
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                         {selectedStep.resources.map((res, i) => {
                           const hasUrl = res.url && res.url.length > 0;
                           const targetUrl = hasUrl ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.title)}`;
                           
                           return (
                             <a 
                               key={i} 
                               href={targetUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="group flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
                             >
                                <div className="flex items-center gap-3 overflow-hidden">
                                   {hasUrl ? (
                                      <Terminal className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                                   ) : (
                                      <Search className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                   )}
                                   <div className="flex flex-col min-w-0">
                                      <span className="text-sm text-zinc-300 font-mono truncate group-hover:text-white transition-colors">{res.title}</span>
                                      {!hasUrl && <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Search on Google</span>}
                                   </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0" />
                             </a>
                           );
                         })}
                      </div>
                   </div>

                   <div className="lg:col-span-1">
                      <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl lg:sticky lg:top-6">
                         <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
                            Action Required
                         </h3>
                         <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                            Mark this module as complete only after validating understanding of core concepts.
                         </p>
                         <Button 
                           onClick={() => toggleComplete(selectedStep.week)}
                           className={cn(
                             "w-full h-12 text-sm font-bold tracking-wider transition-all",
                             selectedStep.completed 
                               ? "bg-transparent border border-white text-white hover:bg-white hover:text-black" 
                               : "bg-white text-black hover:bg-zinc-200"
                           )}
                         >
                            {selectedStep.completed ? "REVOKE STATUS" : "COMPLETE MODULE"}
                         </Button>
                      </div>
                   </div>
                </div>

             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
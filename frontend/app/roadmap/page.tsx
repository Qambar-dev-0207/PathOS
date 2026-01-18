"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, RefreshCw, ArrowUpRight, Target, Clock, Terminal, Search, BrainCircuit, X, Check, AlertCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BaryonLoader } from "@/components/ui/baryon-loader";

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

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [user, setUser] = useState<{ id: string, name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quiz State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]); // Store selected indices
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (userRes.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("generatedRoadmap");
            router.push("/login");
            return;
        }

        if (userRes.ok) {
            setUser(await userRes.json());
        }

        const res = await fetch(`${API_BASE_URL}/roadmap`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        
        if (res.ok) {
          const fetchedData = await res.json();
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
          const stored = localStorage.getItem("generatedRoadmap");
          if (stored) {
             const parsed = JSON.parse(stored);
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

  // --- Quiz Logic ---
  
  const initiateCompletion = async (week: number) => {
    const step = data?.steps.find(s => s.week === week);
    if (!step) return;

    // If already complete, just toggle off (no quiz)
    if (step.completed) {
        await updateStepStatus(week, false);
        return;
    }

    // Start Quiz Flow
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizQuestions([]);
    setCurrentQIndex(0);
    setUserAnswers([]);
    setQuizResult(null);

    try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/generate-quiz`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                topic: step.title,
                role: data?.role || "Software Engineer",
                description: step.description
            })
        });

        if (!res.ok) throw new Error("Quiz generation failed");
        
        const quizData = await res.json();
        setQuizQuestions(quizData.questions);
    } catch (e) {
        console.error(e);
        setQuizOpen(false);
        alert("Failed to generate quiz. Please try again.");
    } finally {
        setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
    } else {
        submitQuiz();
    }
  };

  const submitQuiz = async () => {
      // Calculate Score
      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
          if (userAnswers[idx] === q.correct_index) correctCount++;
      });

      const percentage = correctCount / quizQuestions.length;
      const passed = percentage >= 0.7;

      setQuizResult({ passed, score: Math.round(percentage * 100) });

      if (passed && selectedStep) {
          await updateStepStatus(selectedStep.week, true);
      }
  };

  const updateStepStatus = async (week: number, status: boolean) => {
    if (!data) return;
    
    // Optimistic Update
    const updatedSteps = data.steps.map(s => 
        s.week === week ? { ...s, completed: status } : s
    );
    const updatedData = { ...data, steps: updatedSteps };
    setData(updatedData);
    
    if (selectedStep && selectedStep.week === week) {
        setSelectedStep(updatedSteps.find(s => s.week === week) || null);
    }

    const token = localStorage.getItem("accessToken");
    try {
        await fetch(`${API_BASE_URL}/roadmap/progress`, {
            method: "PUT",
            headers: {  
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ week, completed: status })
        });
    } catch (e) {
        console.error("Sync failed", e);
    }
  };

  // ------------------

  if (!data || !selectedStep) return null;

  const completedCount = data.steps.filter(s => s.completed).length;
  const totalCount = data.steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Top HUD */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-black/50 backdrop-blur-md z-40">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} className="text-zinc-500 hover:text-white shrink-0">
             <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-zinc-500 hover:text-white shrink-0">
             <Menu className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-4 h-4 text-white shrink-0" />
            <span className="font-mono text-sm font-bold tracking-tight uppercase truncate">{data.role} Protocol</span>
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
        
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:flex w-72 bg-black border-r border-white/10 flex-col z-20 flex-shrink-0 overflow-hidden h-[calc(100vh-4rem)] sticky top-16">
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
                  {step.week !== data.steps.length && (
                    <div className="absolute left-[23px] top-8 bottom-[-8px] w-px bg-zinc-800 -z-10" />
                  )}
                </button>
              ))}
           </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                    />
                    <motion.aside 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-black border-r border-white/10 z-50 flex flex-col md:hidden"
                    >
                        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Execution Phase</h3>
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="h-6 w-6">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {data.steps.map((step) => (
                                <button
                                key={step.week}
                                onClick={() => { setSelectedStep(step); setMobileMenuOpen(false); }}
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
                                {step.week !== data.steps.length && (
                                    <div className="absolute left-[23px] top-8 bottom-[-8px] w-px bg-zinc-800 -z-10" />
                                )}
                                </button>
                            ))}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 relative bg-zinc-950 flex flex-col overflow-y-auto h-[calc(100vh-4rem)]">
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
                            {selectedStep.completed 
                              ? "Module successfully verified. You may proceed or review." 
                              : "Complete the verification quiz to mark this module as complete."}
                         </p>
                         <Button 
                           onClick={() => initiateCompletion(selectedStep.week)}
                           className={cn(
                             "w-full h-12 text-sm font-bold tracking-wider transition-all",
                             selectedStep.completed 
                               ? "bg-transparent border border-white text-white hover:bg-white hover:text-black" 
                               : "bg-white text-black hover:bg-zinc-200"
                           )}
                         >
                            {selectedStep.completed ? "REVOKE STATUS" : "START QUIZ & COMPLETE"}
                         </Button>
                      </div>
                   </div>
                </div>
             </motion.div>
           </AnimatePresence>
        </main>

        {/* QUIZ MODAL */}
        <AnimatePresence>
          {quizOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-zinc-900 border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
              >
                 {quizLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-12 min-h-[400px]">
                       <BaryonLoader className="scale-150 text-white" />
                       <div className="text-center space-y-2">
                          <p className="text-lg font-bold tracking-tight text-white animate-pulse">GENERATING ASSESSMENT</p>
                          <p className="text-zinc-500 text-sm font-mono">Analyzing module content...</p>
                       </div>
                    </div>
                 ) : quizResult ? (
                    // RESULT VIEW
                    <div className="flex flex-col min-h-0 h-full overflow-hidden relative bg-zinc-900">
                       {/* Header */}
                       <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 z-20 shrink-0">
                          <div className="flex items-center gap-3">
                             <div className={cn("p-2 rounded-lg", quizResult.passed ? "bg-emerald-500/10" : "bg-red-500/10")}>
                                {quizResult.passed ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Assessment Complete</span>
                                <span className={cn("font-bold text-sm", quizResult.passed ? "text-emerald-500" : "text-red-500")}>
                                   {quizResult.passed ? "VERIFICATION SUCCESSFUL" : "VERIFICATION FAILED"}
                                </span>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setQuizOpen(false)} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full">
                             <X className="w-5 h-5" />
                          </Button>
                       </div>

                       {/* Scrollable Content */}
                       <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 min-h-0 bg-zinc-950/30 custom-scrollbar relative z-0">
                          {/* Score Summary */}
                          <div className="text-center space-y-4 mb-8">
                             <div className="inline-flex items-center justify-center p-6 rounded-full border border-white/5 bg-white/5 mb-2">
                                <span className="text-4xl font-bold text-white">{quizResult.score}%</span>
                             </div>
                             <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                                {quizResult.passed 
                                   ? "Excellent work. You have demonstrated mastery of this module's core concepts." 
                                   : "You did not meet the 70% threshold. Review the material below and try again."}
                             </p>
                          </div>

                          {/* Detailed Review */}
                          <div className="space-y-6">
                             <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-2">
                                Performance Analysis
                             </h3>
                             
                             {quizQuestions.map((q, qIdx) => {
                                const userAnswer = userAnswers[qIdx];
                                const isCorrect = userAnswer === q.correct_index;
                                
                                return (
                                   <div key={q.id} className="space-y-3">
                                      <div className="flex gap-3">
                                         <span className="text-xs font-mono text-zinc-500 pt-1">0{qIdx + 1}</span>
                                         <p className="text-sm font-bold text-white leading-snug">{q.question}</p>
                                      </div>
                                      
                                      <div className="pl-8 space-y-2">
                                         {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswer === optIdx;
                                            const isTarget = q.correct_index === optIdx;
                                            
                                            // Determine styling
                                            let styleClass = "border-zinc-800 text-zinc-500 opacity-50"; // Default dimmed
                                            let icon = null;

                                            if (isTarget) {
                                               styleClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 opacity-100";
                                               icon = <Check className="w-3 h-3 ml-auto" />;
                                            } else if (isSelected && !isCorrect) {
                                               styleClass = "border-red-500/50 bg-red-500/10 text-red-500 opacity-100";
                                               icon = <X className="w-3 h-3 ml-auto" />;
                                            } else if (isSelected && isCorrect) {
                                                styleClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 opacity-100";
                                                icon = <Check className="w-3 h-3 ml-auto" />;
                                            }

                                            return (
                                               <div 
                                                  key={optIdx}
                                                  className={cn(
                                                     "text-xs p-3 rounded border flex items-center gap-2",
                                                     styleClass
                                                  )}
                                               >
                                                  <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                                  <span>{opt}</span>
                                                  {icon}
                                               </div>
                                            );
                                         })}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>

                       {/* Footer */}
                       <div className="p-6 border-t border-white/5 bg-zinc-900 z-20 shrink-0 relative">
                          <Button 
                             onClick={() => setQuizOpen(false)}
                             className={cn(
                                "w-full h-12 text-sm font-bold tracking-widest uppercase transition-all",
                                quizResult.passed ? "bg-white text-black hover:bg-zinc-200" : "bg-red-600 hover:bg-red-700 text-white"
                             )}
                          >
                             {quizResult.passed ? "COMPLETE & CONTINUE" : "CLOSE & RETRY"}
                          </Button>
                       </div>
                    </div>
                 ) : (
                    // QUESTION VIEW
                    <div className="flex flex-col min-h-0 h-full overflow-hidden relative">
                       {/* Header */}
                       <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 z-20 shrink-0">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-amber-500/10 rounded-lg">
                                <BrainCircuit className="w-5 h-5 text-amber-500" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Assessment Progress</span>
                                <span className="font-bold text-sm text-white">
                                   Question {currentQIndex + 1} <span className="text-zinc-600">/</span> {quizQuestions.length}
                                </span>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setQuizOpen(false)} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full">
                             <X className="w-5 h-5" />
                          </Button>
                       </div>

                       {/* Scrollable Content Area */}
                       <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 min-h-0 bg-zinc-950/30 custom-scrollbar relative z-0">
                          <div className="space-y-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                                {quizQuestions[currentQIndex]?.question}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 pb-4">
                                {quizQuestions[currentQIndex]?.options.map((option, idx) => (
                                    <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group relative overflow-hidden",
                                        userAnswers[currentQIndex] === idx 
                                            ? "bg-amber-500/10 border-amber-500" 
                                            : "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900"
                                    )}
                                    >
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-colors shrink-0 mt-0.5",
                                        userAnswers[currentQIndex] === idx 
                                            ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                                            : "border-zinc-700 text-zinc-600 group-hover:border-zinc-500 group-hover:text-zinc-400 bg-black/20"
                                    )}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={cn(
                                        "text-sm sm:text-base font-medium leading-relaxed transition-colors",
                                        userAnswers[currentQIndex] === idx ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                    )}>
                                        {option}
                                    </span>
                                    </button>
                                ))}
                            </div>
                          </div>
                       </div>

                       {/* Footer */}
                       <div className="px-6 py-5 border-t border-white/5 bg-zinc-900 z-20 shrink-0 flex justify-between items-center relative">
                          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
                             <AlertCircle className="w-3 h-3" />
                             <span>70% REQUIRED TO PASS</span>
                          </div>
                          <Button 
                             onClick={handleNextQuestion}
                             disabled={userAnswers[currentQIndex] === undefined}
                             className={cn(
                                "ml-auto px-8 h-12 text-sm font-bold tracking-widest transition-all",
                                userAnswers[currentQIndex] === undefined 
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                                    : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                             )}
                          >
                             {currentQIndex === quizQuestions.length - 1 ? "FINALIZE ASSESSMENT" : "NEXT QUESTION"}
                             <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper component for the Next button icon
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

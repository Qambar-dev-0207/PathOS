"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Disc, Command, User, Shield, Terminal, Activity, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BaryonLoader } from "@/components/ui/baryon-loader";

// --- Types ---
interface UserProfile {
  target_role: string;
  salary_range: string;
  timeline: string;
  current_skills: string[];
  hours_per_week: number;
}

interface UserData {
    id: string;
    name: string;
    email: string;
}

// --- Shared Header Component ---
function ProfileHeader() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("generatedRoadmap");
        router.push("/");
    };

    return (
        <header className="p-8 flex justify-between items-center z-50 relative bg-zinc-950/80 backdrop-blur-sm sticky top-0 border-b border-white/5">
            <div className="flex items-center gap-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
                        <ArrowLeft className="mr-2 w-4 h-4" /> PATH_OS
                    </Button>
                </Link>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-xs text-zinc-400">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    SECURE CONNECTION
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 font-bold tracking-widest text-xs"
                >
                    LOGOUT <LogOut className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}

// --- Main Page Component ---
export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [hasRoadmap, setHasRoadmap] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const userRes = await fetch("https://pathos.onrender.com/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (!userRes.ok) throw new Error("Auth failed");
                const userData = await userRes.json();
                setUser(userData);

                const roadmapRes = await fetch("https://pathos.onrender.com/roadmap", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (roadmapRes.ok) {
                    setHasRoadmap(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <BaryonLoader className="scale-150 text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-amber-500/30 selection:text-amber-50">
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <ProfileHeader />
            {hasRoadmap ? <UserProfileDashboard user={user} /> : <OnboardingWizard />}
        </div>
    );
}

// --- Sub-Component: User Profile Dashboard (Private) ---
function UserProfileDashboard({ user }: { user: UserData | null }) {
    const router = useRouter();

    return (
        <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Operator Dashboard</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
                    WELCOME, {user?.name || "OPERATOR"}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {/* Status Card */}
                    <div className="p-8 border border-white/10 bg-zinc-900/20 backdrop-blur-sm rounded-lg relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Activity className="w-6 h-6 text-zinc-600 group-hover:text-amber-500" />
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Current Status</div>
                        <div className="text-3xl font-bold text-white mb-6">PROTOCOL ACTIVE</div>
                        <Button 
                            onClick={() => router.push("/roadmap")}
                            className="w-full bg-white text-black hover:bg-amber-400 hover:text-black font-bold tracking-widest"
                        >
                            CONTINUE EXECUTION <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    {/* Identity Card */}
                    <div className="p-8 border border-white/10 bg-zinc-900/20 backdrop-blur-sm rounded-lg relative overflow-hidden group hover:border-white/20 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <User className="w-6 h-6 text-zinc-600 group-hover:text-white" />
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Operator Details</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-zinc-400">ID</span>
                                <span className="text-sm font-mono text-zinc-600 truncate max-w-[150px]">{user?.id || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-zinc-400">Email</span>
                                <span className="text-sm font-mono text-white">{user?.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-zinc-400">Access Level</span>
                                <span className="text-sm font-mono text-emerald-500">Tier 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}

// --- Sub-Component: Onboarding Wizard (Logic moved here) ---
const QUESTIONS = [
  {
    id: "role",
    label: "Target Role Designation",
    placeholder: "e.g. Senior Backend Engineer",
    sub: "Precision matters. The system tailors the stack based on exact role semantics.",
    key: "target_role"
  },
  {
    id: "salary",
    label: "Compensation Target",
    placeholder: "e.g. $160,000",
    sub: "Used to calibrate the seniority level and negotiation modules.",
    key: "salary_range"
  },
  {
    id: "timeline",
    label: "Execution Horizon",
    placeholder: "e.g. 6 months",
    sub: "Realistic timelines prevent burnout. Aggressive timelines require higher weekly hours.",
    key: "timeline"
  },
  {
    id: "hours",
    label: "Weekly Bandwidth",
    placeholder: "e.g. 20",
    type: "number",
    sub: "Honest assessment of available deep-work hours per week.",
    key: "hours_per_week"
  },
  {
    id: "skills",
    label: "Current Technical Assets",
    placeholder: "e.g. Python, AWS, Docker",
    sub: "Comma separated. We perform a gap analysis against your target.",
    key: "skillsInput"
  }
];

function OnboardingWizard() {
  const router = useRouter();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    target_role: "",
    salary_range: "",
    timeline: "",
    hours_per_week: "",
    skillsInput: ""
  });
  
  const currentQ = QUESTIONS[currentQIndex];
  const inputRef = useRef<HTMLInputElement>(null);

  if (!currentQ) return null;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [currentQIndex]);

  const handleNext = () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData[currentQ.key]) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    
    if (!token) {
      alert("Session expired. Please login.");
      router.push("/login");
      setLoading(false);
      return;
    }

    const skillsArray = formData.skillsInput.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const payload = { 
      target_role: formData.target_role,
      salary_range: formData.salary_range,
      timeline: formData.timeline,
      hours_per_week: parseInt(formData.hours_per_week) || 10,
      current_skills: skillsArray 
    };

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 120000); 

      const response = await fetch("https://pathos.onrender.com/generate-roadmap", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(id);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to generate: ${response.status} ${errText}`);
      }

      const data = await response.json();
      localStorage.setItem("generatedRoadmap", JSON.stringify(data)); 
      
      router.push("/roadmap");
    } catch (error: any) {
      console.error(error);
      if (error.name === 'AbortError') {
        alert("Request timed out. The AI is taking too long.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="flex flex-col flex-1 h-full relative">
       {/* Minimal Header for Wizard Step */}
       <div className="absolute top-0 right-0 p-8 flex items-center gap-2 font-mono text-sm text-zinc-500 z-40">
            {currentQIndex + 1} <span className="text-white">/</span> {QUESTIONS.length}
       </div>

       {/* Progress Bar */}
       <div className="fixed top-[88px] left-0 h-1 bg-zinc-900 w-full z-40">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
       </div>

       <main className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative min-h-[calc(100vh-100px)]">
          <div className="max-w-3xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                 <div className="space-y-2">
                    <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                       <Command className="w-3 h-3" /> {currentQ.label}
                    </label>
                    <Input 
                       ref={inputRef}
                       type={currentQ.type || "text"}
                       value={formData[currentQ.key]}
                       onChange={(e) => setFormData({...formData, [currentQ.key]: e.target.value})}
                       onKeyDown={handleKeyDown}
                       placeholder={currentQ.placeholder}
                       className="text-4xl md:text-6xl h-auto py-6 font-bold tracking-tight bg-transparent border-b-2 border-zinc-800 focus:border-white transition-all placeholder:text-zinc-800 text-white"
                    />
                 </div>
                 <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-xl">
                   {currentQ.sub}
                 </p>
              </motion.div>
            </AnimatePresence>

            <div className="fixed bottom-0 left-0 right-0 p-8 sm:p-12 flex justify-between items-end bg-zinc-950/80 backdrop-blur-sm border-t border-white/5">
               <Button 
                 variant="ghost" 
                 onClick={handleBack} 
                 disabled={currentQIndex === 0 || loading}
                 className="text-zinc-500 hover:text-white"
               >
                 <ArrowLeft className="mr-2 w-4 h-4" /> PREV
               </Button>
               
               <div className="flex flex-col items-end gap-2">
                 <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block mb-2">
                   Press Enter to continue
                 </span>
                 <Button 
                   onClick={handleNext} 
                   size="lg"
                   disabled={!formData[currentQ.key] || loading}
                   className="h-16 px-8 bg-white text-black hover:bg-zinc-200 rounded-none text-lg tracking-widest font-bold"
                 >
                   {loading ? (
                     <BaryonLoader />
                   ) : (
                     currentQIndex === QUESTIONS.length - 1 ? "INITIALIZE" : "NEXT"
                   )}
                   {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                 </Button>
               </div>
            </div>
          </div>
       </main>
    </div>
  );
}
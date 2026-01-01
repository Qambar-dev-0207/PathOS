"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Loader2, Disc, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  target_role: string;
  salary_range: string;
  timeline: string;
  current_skills: string[];
  hours_per_week: number;
}

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

export default function ProfileWizard() {
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

  useEffect(() => {
    // Auto focus on slide change
    setTimeout(() => inputRef.current?.focus(), 500);
  }, [currentQIndex]);

  const handleNext = () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
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
    
    // Fallback: If no token, allow generation as guest (backend falls back to mock if no token, but we should force login for this flow based on earlier request)
    // Actually, for better UX, let's allow guest generation but with mock data if we wanted, 
    // BUT the user specifically asked for DB storage. So let's redirect to login.
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
      // Add a timeout to the fetch
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 120000); // 120 second timeout for reasoning model

      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:8002/generate-roadmap", {
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
      console.log("Roadmap generated:", data);
      
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
    <div className="min-h-screen bg-black text-white flex flex-col noise-bg">
       {/* Minimal Header */}
       <header className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
          <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase text-zinc-500">
             <div className="w-2 h-2 bg-zinc-800 rounded-full" />
             System Configuration
          </div>
          <div className="font-mono text-sm text-zinc-600">
            {currentQIndex + 1} <span className="text-zinc-800">/</span> {QUESTIONS.length}
          </div>
       </header>

       {/* Progress Bar */}
       <div className="fixed top-0 left-0 h-1 bg-zinc-900 w-full z-50">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
       </div>

       <main className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative">
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
                       className="text-4xl md:text-6xl h-auto py-6 font-bold tracking-tight bg-transparent border-b-2 border-zinc-800 focus:border-white transition-all placeholder:text-zinc-800"
                    />
                 </div>
                 <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-xl">
                   {currentQ.sub}
                 </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-8 sm:p-12 flex justify-between items-end">
               <Button 
                 variant="ghost" 
                 onClick={handleBack} 
                 disabled={currentQIndex === 0 || loading}
                 className="text-zinc-500 hover:text-white"
               >
                 <ArrowLeft className="mr-2 w-4 h-4" /> PREV
               </Button>
               
               <div className="flex flex-col items-end gap-2">
                 <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:block mb-2">
                   Press Enter to continue
                 </span>
                 <Button 
                   onClick={handleNext} 
                   size="lg"
                   disabled={!formData[currentQ.key] || loading}
                   className="h-16 px-8 bg-white text-black hover:bg-zinc-200 rounded-none text-lg tracking-widest font-bold"
                 >
                   {loading ? (
                     <Loader2 className="animate-spin w-5 h-5" />
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

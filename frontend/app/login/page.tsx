"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Disc, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      window.location.href = "/profile";
    } catch (error) {
      console.error(error);
      alert("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col noise-bg">
      <header className="p-8 flex justify-between items-center z-50">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white">
            <ArrowLeft className="mr-2 w-4 h-4" /> RETURN
          </Button>
        </Link>
        <Disc className="w-6 h-6 animate-spin" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter uppercase">Access_OS</h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              Authenticate to resume deployment
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Identity (Email)</label>
              <Input 
                type="email" 
                placeholder="operator@system.io" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-white/10 focus:border-white h-14"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Security Key (Password)</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-white/10 focus:border-white h-14"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-white text-black hover:bg-zinc-200 text-lg font-bold tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : "AUTHENTICATE"}
            </Button>
          </form>

          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-zinc-500 text-sm">
              New Operator?{" "}
              <Link href="/register" className="text-white hover:underline underline-offset-4 font-bold uppercase tracking-widest text-xs">
                Request Access
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

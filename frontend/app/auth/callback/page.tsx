"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BaryonLoader } from "@/components/ui/baryon-loader";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("accessToken", token);
      // Brief delay to ensure storage sync
      setTimeout(() => {
        router.push("/profile");
      }, 500);
    } else if (error) {
      alert("Authentication Failed: " + error);
      router.push("/login");
    } else {
       // If accessed directly without params
       router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <BaryonLoader />
      <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Establishing Secure Uplink...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CallbackContent />
    </Suspense>
  );
}

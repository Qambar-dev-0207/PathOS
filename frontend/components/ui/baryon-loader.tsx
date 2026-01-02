"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BaryonLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="w-1.5 h-1.5 bg-current rounded-[1px]" // Square dots
        />
      ))}
    </div>
  );
};

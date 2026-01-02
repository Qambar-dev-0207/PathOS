"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isEmerald, setIsEmerald] = useState(false); // New state for special color
  const [isVisible, setIsVisible] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for the follower
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only show custom cursor on devices that support hover
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setIsVisible(true);
    }

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if target is clickable
      const isClickable = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" ||
        target.closest("a") || 
        target.closest("button") ||
        target.closest(".cursor-pointer") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA";
      
      setIsHovering(!!isClickable);

      // Check for emerald cursor trigger
      // We look for the data-cursor attribute on the target or its closest clickable parent
      const emeraldTarget = target.closest('[data-cursor="emerald"]');
      setIsEmerald(!!emeraldTarget);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main Dot */}
      <motion.div
        className={cn(
            "fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-colors duration-200",
            isEmerald ? "bg-emerald-500" : "bg-amber-500"
        )}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      {/* Follower Ring */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out flex items-center justify-center",
          isHovering ? "w-12 h-12" : "w-6 h-6 opacity-50",
          isEmerald 
            ? (isHovering ? "bg-emerald-500/10 border-emerald-400" : "border-emerald-500/50")
            : (isHovering ? "bg-amber-500/10 border-amber-400" : "border-amber-500/50")
        )}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Crosshair accents on hover */}
        <div className={cn(
            "relative w-full h-full transition-all duration-300",
            isHovering ? "opacity-100 rotate-90 scale-100" : "opacity-0 rotate-0 scale-50"
        )}>
             <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2", isEmerald ? "bg-emerald-500" : "bg-amber-500")} />
             <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2", isEmerald ? "bg-emerald-500" : "bg-amber-500")} />
             <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px]", isEmerald ? "bg-emerald-500" : "bg-amber-500")} />
             <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px]", isEmerald ? "bg-emerald-500" : "bg-amber-500")} />
        </div>
      </motion.div>
    </>
  );
};

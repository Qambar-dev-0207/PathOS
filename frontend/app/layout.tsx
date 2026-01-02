import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Preloader } from "@/components/ui/preloader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ["latin"], 
  variable: "--font-space-mono" 
});

export const metadata: Metadata = {
  title: "PathOS - AI Career Roadmap",
  description: "Plan your path to a high-paying tech career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.variable, spaceMono.variable, "antialiased bg-background text-foreground min-h-screen selection:bg-amber-500/30 selection:text-amber-50 transition-colors duration-300")}>
        <Preloader />
        <CustomCursor />
        {/* Global Grid - Opacity handled by dark class via Tailwind or CSS var? 
            Note: .dark .opacity-100 is handled by Tailwind if configured.
            In globals.css I defined css variables. 
            Tailwind 'dark:' prefix works if 'darkMode: "class"' is set (default in v4/late v3).
        */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-50 dark:opacity-100 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

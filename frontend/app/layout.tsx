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
    <html lang="en" className="dark">
      <body className={clsx(inter.variable, spaceMono.variable, "antialiased bg-black min-h-screen selection:bg-amber-500/30 selection:text-amber-50")}>
        <Preloader />
        <CustomCursor />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
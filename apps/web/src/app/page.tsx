'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Code, Zap, GitBranch, Terminal } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import logoImage from "../../public/logo.png";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logoImage} alt="DevFlow AI Logo" className="w-8 h-8 rounded" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">DevFlow AI</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-4">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#about" className="hover:text-foreground transition-colors">About</a>
            </nav>
            <ThemeToggle />

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard" className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity">
                  {initials}
                </Link>
              </div>
            ) : mounted ? (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          {/* Background gradient effects */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>

          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Your AI-Powered <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                Developer Workspace
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
              DevFlow AI brings your workspaces, projects, notes, and an intelligent AI assistant together into one seamless, blazingly fast environment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all gap-2"
              >
                Start Building Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold text-foreground border shadow-sm hover:bg-muted/50 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 sm:py-32 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to ship faster</h2>
              <p className="text-lg text-muted-foreground">
                A carefully crafted suite of tools designed to eliminate context switching and keep you in the flow state.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Project-Aware AI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chat with an AI that automatically reads your project's framework, description, and notes. No more explaining your stack.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <GitBranch className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Workspaces & Projects</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Organize your life. Group your repositories into logical workspaces and keep everything perfectly categorized.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cross-Platform Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access your dashboard on the Web or take it on the go with our fully featured Mobile application.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src={logoImage} alt="DevFlow AI Logo" className="w-6 h-6 rounded grayscale opacity-70" />
            <span className="font-semibold text-muted-foreground">DevFlow AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DevFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

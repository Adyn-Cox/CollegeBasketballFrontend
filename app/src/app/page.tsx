'use client'

import { LoginButton } from "@/components/auth/LoginButton";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import Image from "next/image";

function LoginContent() {
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Derive error message from search params directly during render
  const errorMessage = useMemo(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') return 'Authentication failed. Please try again.';
    if (error === 'backend_auth_failed') return 'Failed to connect to server. Please try again.';
    if (error === 'session_expired') return 'Your session has expired. Please sign in again.';
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (!supabase) return;

    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        // User is authenticated - redirect to dashboard
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-hoops border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream font-sans relative overflow-hidden dark:bg-black">
      {/* Background Texture - Light Mode Only */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:hidden" />

      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center p-8 text-center relative z-10">
        <div className="w-48 h-48 border-4 border-ink bg-white p-2 relative group transition-transform hover:scale-105 duration-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-cream dark:bg-black dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <Image 
            src="https://images.pexels.com/photos/220383/pexels-photo-220383.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Basketball Arena"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <h1 className="text-6xl font-display text-ink mb-2 tracking-tighter uppercase mt-8 dark:text-cream">
          Picks<span className="text-hoops">Predictor</span>
        </h1>
        <p className="text-ink/60 text-xl mb-12 max-w-xs font-serif italic dark:text-cream">
          Lock in your predictions.
        </p>

        {errorMessage && (
          <div className="w-full mb-6 p-4 border-2 border-red-500 bg-red-50 text-red-600 font-bold font-mono text-sm uppercase dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}
        
        <div className="w-full space-y-4">
          <LoginButton />
          <p className="text-xs text-ink/40 font-mono uppercase tracking-widest mt-8 dark:text-cream">
            EST. 2024 — CALL YOUR SHOT
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-hoops border-t-transparent animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

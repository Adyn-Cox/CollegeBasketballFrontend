'use client'

import { Dashboard } from "@/components/Dashboard";
import { LoginButton } from "@/components/auth/LoginButton";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

export default function Home() {
  const supabase = useSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans">
        <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center p-8 bg-zinc-950 text-center relative z-10">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-orange-500/20 rotate-3 border-2 border-zinc-800">
            <img 
              src="https://images.pexels.com/photos/220383/pexels-photo-220383.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Basketball Arena" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Hoops Predictor
          </h1>
          <p className="text-zinc-400 text-lg mb-12 max-w-xs leading-relaxed">
            AI-powered predictions for college basketball matchups.
          </p>
          
          <div className="w-full space-y-4">
            <LoginButton />
            <p className="text-xs text-zinc-600">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return <Dashboard user={session.user} />;
}

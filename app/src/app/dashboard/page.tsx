'use client'

import { Dashboard } from "@/components/Dashboard";
import { useSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { backendLogin, backendRefresh, isAuthError } from "@/lib/api/auth";

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect to login page
  const redirectToLogin = useCallback((error?: string) => {
    const params = error ? `?error=${error}` : '';
    router.push(`/${params}`);
  }, [router]);

  // Verify session with backend
  const verifyWithBackend = useCallback(async (accessToken: string, refreshToken: string): Promise<boolean> => {
    try {
      await backendLogin(accessToken, refreshToken);
      return true;
    } catch (error) {
      if (isAuthError(error)) {
        console.error('Backend verification failed:', error.error);
      }
      return false;
    }
  }, []);

  // Attempt to refresh tokens
  const attemptRefresh = useCallback(async (refreshToken: string): Promise<boolean> => {
    try {
      const newTokens = await backendRefresh(refreshToken);
      
      // Update Supabase session with new tokens
      if (supabase) {
        await supabase.auth.setSession({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
        });
      }
      
      return true;
    } catch (error) {
      if (isAuthError(error)) {
        console.error('Token refresh failed:', error.error);
      }
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session - redirect to login
        redirectToLogin();
        return;
      }

      setIsVerifying(true);

      // Verify with backend
      const verified = await verifyWithBackend(
        session.access_token,
        session.refresh_token
      );

      if (verified) {
        setUser(session.user);
        setIsLoading(false);
        setIsVerifying(false);
        return;
      }

      // Backend verification failed - try refresh
      const refreshed = await attemptRefresh(session.refresh_token);

      if (refreshed) {
        // Get updated session
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          setUser(newSession.user);
          setIsLoading(false);
          setIsVerifying(false);
          return;
        }
      }

      // All attempts failed - sign out and redirect
      await supabase.auth.signOut();
      redirectToLogin('session_expired');
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || !session) {
        redirectToLogin();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token was refreshed by Supabase - verify with backend
        const verified = await verifyWithBackend(
          session.access_token,
          session.refresh_token
        );
        
        if (!verified) {
          await supabase.auth.signOut();
          redirectToLogin('session_expired');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, attemptRefresh, redirectToLogin, verifyWithBackend]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          {isVerifying && (
            <p className="text-sm text-zinc-500">Verifying session...</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard user={user} />;
}


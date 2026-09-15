import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGoogleUser: boolean;
  displayName: string;
  avatarUrl: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isGoogleUser: false,
  displayName: 'Guest',
  avatarUrl: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error.message);
      throw error;
    }
  }, []);

  const isGoogleUser = !!user && user.app_metadata?.provider === 'google';

  // Extract display info from Google user metadata
  const displayName = isGoogleUser
    ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User')
    : 'Guest';

  const avatarUrl = isGoogleUser
    ? (user.user_metadata?.avatar_url || user.user_metadata?.picture || null)
    : null;

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isGoogleUser, displayName, avatarUrl, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

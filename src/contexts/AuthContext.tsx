import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Office } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  office: Office | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, officeName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshOffice: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOffice(userId: string) {
    const { data } = await supabase
      .from('offices')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setOffice(data);
  }

  async function refreshOffice() {
    if (user) await fetchOffice(user.id);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchOffice(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        (async () => { await fetchOffice(s.user.id); })();
      } else {
        setOffice(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  async function signUp(email: string, password: string, officeName: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Registration failed. Please try again.';

    const { error: officeError } = await supabase.from('offices').insert({
      name: officeName,
      user_id: data.user.id,
      account_status: 'Trial',
      plan_tier: 'Free-Trial',
    });

    return officeError ? officeError.message : null;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOffice(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, office, loading, signIn, signUp, signOut, refreshOffice }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

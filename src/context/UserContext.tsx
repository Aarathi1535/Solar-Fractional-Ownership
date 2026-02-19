import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string | number;
  email: string;
  name: string;
  balance: number;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeliosUser = async (supabaseUser: SupabaseUser) => {
    console.log('Syncing user with backend:', supabaseUser.email);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: supabaseUser.id, 
          email: supabaseUser.email, 
          isSupabase: true 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('User sync successful:', data);
        setUser(data);
      } else {
        const err = await res.json();
        console.error('User sync failed:', err);
        setError(err.error || 'Failed to sync user profile');
      }
    } catch (e) {
      console.error('Failed to sync user', e);
      setError('Network error during user sync');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email || 'No session');
        if (mounted) {
          if (session?.user) {
            await fetchHeliosUser(session.user);
          }
          setLoading(false);
        }
      } catch (e) {
        console.error('Session init error:', e);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, session?.user?.email);
      
      if (mounted) {
        if (session?.user) {
          setLoading(true);
          await fetchHeliosUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

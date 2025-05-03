import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  bypassAuth: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for testing with valid UUID
const mockUser: User = {
  id: uuidv4(), // Generate a valid UUID
  app_metadata: {},
  user_metadata: {
    name: 'Test User',
    role: 'admin'
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@paysurity.com',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock auth cookie
    const mockAuth = Cookies.get('mock_auth');
    if (mockAuth === 'true') {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove mock auth cookie if it exists
      Cookies.remove('mock_auth');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      // Refresh Supabase session
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  // Function to bypass authentication for testing
  const bypassAuth = () => {
    // Create a mock admin user
    const adminUser = {
      ...mockUser,
      user_metadata: {
        ...mockUser.user_metadata,
        role: 'admin'
      }
    };
    
    setUser(adminUser);
    Cookies.set('mock_auth', 'true', { expires: 1 }); // Expires in 1 day
  };

  // Function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!user || !user.user_metadata) return false;
    return user.user_metadata.role === role;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    bypassAuth,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
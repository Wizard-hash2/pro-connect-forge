import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
// Removed useNavigate import

type UserProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  logout: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  refresh: () => {},
  logout: async () => {},
});

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed useNavigate

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(data);
    setError(error?.message || null);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    // Removed navigate('/auth')
  };

  useEffect(() => {
    fetchProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loading, error, refresh: fetchProfile, logout }}>
      {children}
    </UserProfileContext.Provider>
  );
}; 
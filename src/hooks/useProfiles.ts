import { useEffect, useState, useCallback } from 'react';
import { getAllProfiles } from '@/services/profilesService';
import { Profile } from '@/types/supabase';

/**
 * useProfiles - React hook to fetch all profiles from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useProfiles();
 */
export function useProfiles() {
  const [data, setData] = useState<Profile[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllProfiles();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { data, loading, error, refetch: fetchProfiles };
} 
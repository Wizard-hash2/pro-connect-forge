import { useEffect, useState, useCallback } from 'react';
import { getAllFreelancerProfiles } from '@/services/freelancerProfilesService';
import { FreelancerProfile } from '@/types/supabase';

/**
 * useFreelancerProfiles - React hook to fetch all freelancer profiles from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useFreelancerProfiles();
 */
export function useFreelancerProfiles() {
  const [data, setData] = useState<FreelancerProfile[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancerProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllFreelancerProfiles();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFreelancerProfiles();
  }, [fetchFreelancerProfiles]);

  return { data, loading, error, refetch: fetchFreelancerProfiles };
} 
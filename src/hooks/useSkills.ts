import { useEffect, useState, useCallback } from 'react';
import { getAllSkills } from '@/services/skillsService';
import { Skill } from '@/types/supabase';

/**
 * useSkills - React hook to fetch all skills from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useSkills();
 */
export function useSkills() {
  const [data, setData] = useState<Skill[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllSkills();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { data, loading, error, refetch: fetchSkills };
} 
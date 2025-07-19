import { useEffect, useState, useCallback } from 'react';
import { getAllFreelancerSkills } from '@/services/freelancerSkillsService';
import { FreelancerSkill } from '@/types/supabase';

/**
 * useFreelancerSkills - React hook to fetch all freelancer skills from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useFreelancerSkills();
 */
export function useFreelancerSkills() {
  const [data, setData] = useState<FreelancerSkill[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancerSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllFreelancerSkills();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFreelancerSkills();
  }, [fetchFreelancerSkills]);

  return { data, loading, error, refetch: fetchFreelancerSkills };
} 
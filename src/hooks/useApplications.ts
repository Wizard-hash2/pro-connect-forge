import { useEffect, useState, useCallback } from 'react';
import { getAllApplications } from '@/services/applicationsService';
import { Application } from '@/types/supabase';

/**
 * useApplications - React hook to fetch all applications from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useApplications();
 */
export function useApplications() {
  const [data, setData] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllApplications();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { data, loading, error, refetch: fetchApplications };
} 
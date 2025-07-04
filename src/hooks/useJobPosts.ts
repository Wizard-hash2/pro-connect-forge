import { useEffect, useState, useCallback } from 'react';
import { getAllJobPosts } from '@/services/jobPostsService';
import { JobPost } from '@/types/supabase';

/**
 * useJobPosts - React hook to fetch all job posts from Supabase.
 * @returns { data, loading, error, refetch }
 *
 * Usage:
 * const { data, loading, error, refetch } = useJobPosts();
 */
export function useJobPosts() {
  const [data, setData] = useState<JobPost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllJobPosts();
    setData(data);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  return { data, loading, error, refetch: fetchJobPosts };
} 
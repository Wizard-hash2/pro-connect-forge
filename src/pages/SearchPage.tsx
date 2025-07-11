import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserProfile } from '@/context/UserProfileContext';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useFreelancerProfiles } from '@/hooks/useFreelancerProfiles';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const keyword = query.get('q')?.toLowerCase() || '';
  const { profile, loading: profileLoading } = useUserProfile();
  const { data: jobs, loading: jobsLoading } = useJobPosts();
  const { data: freelancers, loading: freelancersLoading } = useFreelancerProfiles();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!profile) return;
    if (profile.user_type === 'client') {
      // Search freelancers
      const filtered = (freelancers || []).filter(f =>
        (f.full_name && f.full_name.toLowerCase().includes(keyword)) ||
        (f.bio && f.bio.toLowerCase().includes(keyword))
      );
      setResults(filtered);
    } else {
      // Search jobs
      const filtered = (jobs || []).filter(j =>
        (j.title && j.title.toLowerCase().includes(keyword)) ||
        (j.description && j.description.toLowerCase().includes(keyword))
      );
      setResults(filtered);
    }
    setLoading(false);
  }, [profile, jobs, freelancers, keyword]);

  if (profileLoading || jobsLoading || freelancersLoading || loading) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-blue-600">Searching...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Search Results</h1>
      {results.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No data found for "{keyword}".</div>
      ) : (
        <div className="grid gap-6">
          {profile.user_type === 'client' ? (
            // Freelancer results
            results.map(f => (
              <Card key={f.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {f.full_name}
                    <Badge variant="secondary">Freelancer</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 mb-2">{f.bio}</div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Job results
            results.map(j => (
              <Card key={j.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {j.title}
                    <Badge variant="secondary">Job</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 mb-2">{j.description}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
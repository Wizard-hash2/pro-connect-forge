import React, { useState } from 'react';
import { useJobPosts } from '@/hooks/useJobPosts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/context/UserProfileContext';
import { useApplications } from '@/hooks/useApplications';
import { createApplication } from '@/services/applicationsService';
import { supabase } from '@/integrations/supabase/client';

export default function BrowseJobs() {
  const { data: jobs, loading, error } = useJobPosts();
  const { profile, loading: profileLoading } = useUserProfile();
  const { data: applications, loading: applicationsLoading, refetch } = useApplications();
  const [applyState, setApplyState] = useState({}); // { [jobId]: { loading, error, success } }

  const isFreelancer = profile?.user_type === 'freelancer';

  const myApplications = isFreelancer && applications
    ? applications.filter(app => app.freelancer_id === profile.id)
    : [];

  const hasApplied = (jobId) => myApplications.some(app => app.job_id === jobId);

  const handleApply = async (jobId) => {
    if (!profile || !profile.id) {
      alert('Profile not loaded. Please log in again.');
      console.log('Profile:', profile);
      return;
    }
    // Debug: log the current user id and freelancer_id
    const { data: { user } } = await supabase.auth.getUser();
    console.log('auth.uid:', user?.id);
    console.log('profile.id:', profile?.id);
    console.log('freelancer_id being sent:', profile?.id);
    if (!user || user.id !== profile.id) {
      alert('User authentication mismatch. Please log in again.');
      return;
    }
    setApplyState(s => ({ ...s, [jobId]: { loading: true, error: null, success: false } }));
    const { error } = await createApplication({
      job_id: jobId,
      freelancer_id: profile.id,
      proposed_rate: '', // Optionally prompt for this
      status: 'pending',
    });
    if (error) {
      setApplyState(s => ({ ...s, [jobId]: { loading: false, error, success: false } }));
    } else {
      // After successful application, create conversation if not exists
      const { data: job } = await supabase
        .from('job_posts')
        .select('client_id')
        .eq('id', jobId)
        .single();
      if (job && job.client_id) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('job_id', jobId)
          .eq('freelancer_id', profile.id)
          .eq('client_id', job.client_id)
          .single();
        if (!existing) {
          await supabase.from('conversations').insert([{
            job_id: jobId,
            freelancer_id: profile.id,
            client_id: job.client_id,
          }]);
        }
      }
      setApplyState(s => ({ ...s, [jobId]: { loading: false, error: null, success: true } }));
      refetch && refetch();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>
      {(loading || profileLoading || applicationsLoading) && <div>Loading jobs...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && jobs && jobs.length === 0 && (
        <div>No jobs available at the moment.</div>
      )}
      <div className="grid gap-6">
        {jobs && jobs.map(job => {
          const state = applyState[job.id] || {};
          const alreadyApplied = isFreelancer && hasApplied(job.id);
          return (
            <Card key={job.id} className="bg-gradient-card border-border/70 hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary text-lg mb-1">{job.title}</CardTitle>
                <div className="text-muted-foreground text-sm">Client: {job.client_id || 'N/A'}</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Budget: ${job.budget_min} - ${job.budget_max}</Badge>
                  {job.status && (
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="ml-2 capitalize">
                      {job.status}
                    </Badge>
                  )}
                </div>
                <p className="text-card-foreground/90 line-clamp-2">{job.description}</p>
                {isFreelancer && (
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={state.loading || alreadyApplied}
                      variant={alreadyApplied ? 'outline' : 'default'}
                    >
                      {alreadyApplied ? 'Applied' : state.loading ? 'Applying...' : 'Apply'}
                    </Button>
                    {state.error && <span className="text-red-500 text-xs ml-2">{state.error}</span>}
                    {state.success && <span className="text-green-600 text-xs ml-2">Applied!</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 
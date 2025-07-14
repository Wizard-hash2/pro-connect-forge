import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { getApplicationsByFreelancerId } from '@/services/applicationsService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function Applications() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any>({}); // job_id -> job
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!profile?.id) return;
      setLoading(true);
      const { data, error } = await getApplicationsByFreelancerId(profile.id);
      setApplications(data || []);
      setError(error);
      setLoading(false);
      // Fetch job details for all applications
      if (data && data.length > 0) {
        const jobIds = [...new Set(data.map(app => app.job_id))];
        const { data: jobsData } = await supabase
          .from('job_posts')
          .select('*')
          .in('id', jobIds);
        const jobsMap = {};
        (jobsData || []).forEach(job => { jobsMap[job.id] = job; });
        setJobs(jobsMap);
      }
    };
    if (profile?.id) fetchApplications();
  }, [profile?.id]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">My Applications</h1>
      {loading || profileLoading ? (
        <div className="text-center text-blue-600">Loading applications...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">You have not applied to any jobs yet.</div>
      ) : (
        <div className="grid gap-6">
          {applications.map(app => {
            const job = jobs[app.job_id];
            return (
              <Card key={app.id} className="overflow-hidden cursor-pointer hover:bg-blue-50" onClick={() => setSelectedJob(job)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {job?.title || 'Job'}
                    <Badge variant={app.status === 'accepted' ? 'success' : 'secondary'}>{app.status || 'Applied'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 mb-2">{job?.description || 'No description available.'}</div>
                  <div className="text-gray-500 text-sm">Applied on: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</div>
                  <div className="text-xs text-gray-400">Job ID: {app.job_id}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedJob(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">{selectedJob.title}</h3>
            <div className="mb-2"><strong>Description:</strong> {selectedJob.description}</div>
            <div className="mb-2"><strong>Budget:</strong> ${selectedJob.budget_min ?? '—'} - ${selectedJob.budget_max ?? '—'}</div>
            <div className="mb-2"><strong>Status:</strong> {selectedJob.status}</div>
            <div className="mb-2"><strong>Experience Level:</strong> {selectedJob.required_experience_level || '—'}</div>
            <div className="mb-2"><strong>Deadline:</strong> {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 
import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { getApplicationsByFreelancerId } from '@/services/applicationsService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Applications() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!profile?.id) return;
      setLoading(true);
      const { data, error } = await getApplicationsByFreelancerId(profile.id);
      setApplications(data || []);
      setError(error);
      setLoading(false);
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
          {applications.map(app => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Application
                  <Badge variant="secondary">Applied</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 mb-2">Job ID: {app.job_id}</div>
                <div className="text-gray-500 text-sm">Applied on: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
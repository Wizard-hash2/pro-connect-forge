import React from 'react';
import { useJobPosts } from '@/hooks/useJobPosts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BrowseJobs() {
  const { data: jobs, loading, error } = useJobPosts();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>
      {loading && <div>Loading jobs...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && jobs && jobs.length === 0 && (
        <div>No jobs available at the moment.</div>
      )}
      <div className="grid gap-6">
        {jobs && jobs.map(job => (
          <Card key={job.id} className="bg-gradient-card border-border/70 hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-lg mb-1">{job.title}</CardTitle>
              <div className="text-muted-foreground text-sm">Client: {job.client_id || 'N/A'}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Budget: ${job.budget_min} - ${job.budget_max}</Badge>
              </div>
              <p className="text-card-foreground/90 line-clamp-2">{job.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
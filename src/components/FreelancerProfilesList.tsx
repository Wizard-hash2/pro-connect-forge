import React from 'react';
import { useFreelancerProfiles } from '@/hooks/useFreelancerProfiles';

/**
 * FreelancerProfilesList - Displays a list of freelancer profiles from Supabase.
 *
 * Usage:
 * <FreelancerProfilesList />
 */
export function FreelancerProfilesList() {
  const { data, loading, error, refetch } = useFreelancerProfiles();

  if (loading) return <div>Loading freelancer profiles...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div>No freelancer profiles found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Freelancer Profiles</h2>
      <button onClick={refetch} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
      <ul className="space-y-4">
        {data.map(profile => (
          <li key={profile.id} className="p-4 border rounded">
            <div className="font-semibold">Hourly Rate: ${profile.hourly_rate}</div>
            <div className="text-gray-600">Experience: {profile.experience_level}</div>
            <div className="text-sm text-gray-500">Bio: {profile.bio}</div>
            <div className="text-sm text-gray-500">Rating: {profile.rating}</div>
            <div className="text-sm text-gray-500">Completed Projects: {profile.completed_projects}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FreelancerProfilesList; 
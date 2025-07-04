import React from 'react';
import { useProfiles } from '@/hooks/useProfiles';

/**
 * ProfilesList - Displays a list of user profiles from Supabase.
 *
 * Usage:
 * <ProfilesList />
 */
export function ProfilesList() {
  const { data, loading, error, refetch } = useProfiles();

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div>No profiles found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Profiles</h2>
      <button onClick={refetch} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
      <ul className="space-y-4">
        {data.map(profile => (
          <li key={profile.id} className="p-4 border rounded flex items-center space-x-4">
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-12 h-12 rounded-full object-cover" />
            )}
            <div>
              <div className="font-semibold">{profile.full_name}</div>
              <div className="text-gray-600">{profile.email}</div>
              <div className="text-sm text-gray-500">{profile.user_type}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilesList; 
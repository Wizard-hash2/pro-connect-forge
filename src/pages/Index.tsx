// Update this page (the content is just a fallback if you fail to update the page)

import React from 'react';
import { useUserProfile } from '@/context/UserProfileContext';

export default function Index() {
  const { profile, loading, error } = useUserProfile();

  if (loading) return <div>Loading your profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile) return <div>Please log in.</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-2">Welcome, {profile.full_name || profile.email}!</h2>
      <div className="mb-2">Email: {profile.email}</div>
      <div className="mb-2">Mode: <span className="font-semibold text-blue-600">{profile.user_type}</span></div>
      {/* You can add more profile details here */}
    </div>
  );
}

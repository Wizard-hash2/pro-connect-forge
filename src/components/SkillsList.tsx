import React from 'react';
import { useSkills } from '@/hooks/useSkills';

/**
 * SkillsList - Displays a list of skills from Supabase.
 *
 * Usage:
 * <SkillsList />
 */
export function SkillsList() {
  const { data, loading, error, refetch } = useSkills();

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div>No skills found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Skills</h2>
      <button onClick={refetch} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
      <ul className="space-y-4">
        {data.map(skill => (
          <li key={skill.id} className="p-4 border rounded">
            <div className="font-semibold">{skill.name}</div>
            <div className="text-gray-600">{skill.category}</div>
            <div className="text-sm text-gray-500">{skill.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SkillsList; 
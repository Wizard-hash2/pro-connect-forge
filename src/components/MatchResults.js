import React, { useState, useEffect } from 'react';
import { findMatches } from '../api/matching';

export default function MatchResults({ jobId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadMatches();
  }, [jobId]);
  
  const loadMatches = async () => {
    try {
      const results = await findMatches(jobId);
      setMatches(results);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-8">Finding matches...</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Top Matches</h2>
      {matches.map(match => (
        <div key={match.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{match.profiles.full_name}</h3>
              <p className="text-gray-600">{match.bio}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Rate: ${match.hourly_rate}/hour</span>
                <span className="ml-4 text-sm text-gray-500">Rating: {match.rating}/5</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {match.compatibility_score}%
              </div>
              <div className="text-sm text-gray-500">Match</div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium">Matching Skills:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {match.matching_skills.map(skill => (
                <span key={skill.skills.name} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill.skills.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
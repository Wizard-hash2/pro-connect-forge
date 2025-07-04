import { supabase } from '../lib/supabase';
import { MatchingService } from '../services/matchingService';

export async function findMatches(jobId) {
  try {
    // Get job details
    const { data: job } = await supabase
      .from('job_posts')
      .select(`
        *,
        job_skills (
          skills (name, category)
        )
      `)
      .eq('id', jobId)
      .single();
    
    // Get all freelancers
    const { data: freelancers } = await supabase
      .from('freelancer_profiles')
      .select(`
        *,
        profiles (full_name, email),
        freelancer_skills (
          skills (name, category),
          proficiency_level
        )
      `);
    
    // Calculate matches
    const matches = freelancers.map(freelancer => {
      const score = MatchingService.calculateCompatibilityScore(job, freelancer);
      return {
        ...freelancer,
        compatibility_score: score,
        matching_skills: getMatchingSkills(job.job_skills, freelancer.freelancer_skills)
      };
    });
    
    // Sort by compatibility score
    return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
    
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
}

function getMatchingSkills(jobSkills, freelancerSkills) {
  return jobSkills.filter(js => 
    freelancerSkills.some(fs => fs.skills.name === js.skills.name)
  );
}
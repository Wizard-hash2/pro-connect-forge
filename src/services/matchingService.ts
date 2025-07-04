interface JobSkill {
  name: string;
  is_required?: boolean;
}

interface FreelancerSkill {
  name: string;
  proficiency_level?: number;
  years_experience?: number;
}

interface Job {
  required_skills?: JobSkill[];
  budget_range?: { min: number; max: number } | number;
  required_experience?: 'junior' | 'mid' | 'senior' | 'expert';
}

interface Freelancer {
  skills?: FreelancerSkill[];
  hourly_rate?: number;
  experience_level?: 'junior' | 'mid' | 'senior' | 'expert';
  rating?: number;
}

export class MatchingService {
  static calculateCompatibilityScore(job: Job, freelancer: Freelancer): number {
    let totalScore = 0;
    let maxScore = 0;
    
    // Skill matching (40% weight)
    const skillScore = this.calculateSkillMatch(job.required_skills, freelancer.skills);
    totalScore += skillScore * 0.4;
    maxScore += 0.4;
    
    // Budget compatibility (30% weight)
    const budgetScore = this.calculateBudgetMatch(job.budget_range, freelancer.hourly_rate);
    totalScore += budgetScore * 0.3;
    maxScore += 0.3;
    
    // Experience level (20% weight)
    const experienceScore = this.calculateExperienceMatch(job.required_experience, freelancer.experience_level);
    totalScore += experienceScore * 0.2;
    maxScore += 0.2;
    
    // Rating (10% weight)
    const ratingScore = (freelancer.rating || 0) / 5;
    totalScore += ratingScore * 0.1;
    maxScore += 0.1;
    
    return Math.round((totalScore / maxScore) * 100);
  }
  
  static calculateSkillMatch(requiredSkills?: JobSkill[], freelancerSkills?: FreelancerSkill[]): number {
    if (!requiredSkills || !freelancerSkills || requiredSkills.length === 0) return 0;
    
    const matches = requiredSkills.filter(skill => 
      freelancerSkills.some(fSkill => fSkill.name.toLowerCase() === skill.name.toLowerCase())
    );
    
    return matches.length / requiredSkills.length;
  }
  
  static calculateBudgetMatch(jobBudget?: { min: number; max: number } | number, freelancerRate?: number): number {
    if (!jobBudget || !freelancerRate) return 0;
    
    const jobMaxBudget = typeof jobBudget === 'object' ? jobBudget.max : jobBudget;
    const jobMinBudget = typeof jobBudget === 'object' ? jobBudget.min : jobBudget * 0.8;
    
    if (freelancerRate >= jobMinBudget && freelancerRate <= jobMaxBudget) {
      return 1; // Perfect match
    } else if (freelancerRate < jobMinBudget) {
      return 0.8; // Below budget (might be good value)
    } else {
      return Math.max(0, 1 - (freelancerRate - jobMaxBudget) / jobMaxBudget);
    }
  }
  
  static calculateExperienceMatch(requiredLevel?: string, freelancerLevel?: string): number {
    const levels: Record<string, number> = { junior: 1, mid: 2, senior: 3, expert: 4 };
    const required = levels[requiredLevel || 'mid'] || 2;
    const freelancer = levels[freelancerLevel || 'mid'] || 2;
    
    if (freelancer >= required) {
      return 1; // Meets or exceeds requirement
    } else {
      return freelancer / required; // Partial match
    }
  }
}
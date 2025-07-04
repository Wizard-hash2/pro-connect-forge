import { supabase } from '@/integrations/supabase/client';
import { FreelancerSkill } from '@/types/supabase';

// --- Service: Freelancer Skills ---

// Get all freelancer skills
export async function getAllFreelancerSkills(): Promise<{ data: FreelancerSkill[] | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_skills').select('*');
  return { data, error: error?.message || null };
}

// Get a freelancer skill by ID
export async function getFreelancerSkillById(id: string): Promise<{ data: FreelancerSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_skills').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new freelancer skill
export async function createFreelancerSkill(skill: Omit<FreelancerSkill, 'id' | 'created_at'>): Promise<{ data: FreelancerSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_skills').insert([skill]).select().single();
  return { data, error: error?.message || null };
}

// Update a freelancer skill by ID
export async function updateFreelancerSkill(id: string, updates: Partial<Omit<FreelancerSkill, 'id' | 'created_at'>>): Promise<{ data: FreelancerSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_skills').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a freelancer skill by ID
export async function deleteFreelancerSkill(id: string): Promise<{ data: FreelancerSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_skills').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all freelancer skills
const { data, error } = await getAllFreelancerSkills();

// Get a freelancer skill by ID
const { data, error } = await getFreelancerSkillById('freelancer-skill-uuid');

// Create a new freelancer skill
const { data, error } = await createFreelancerSkill({
  freelancer_id: 'freelancer-profile-uuid',
  skill_id: 'skill-uuid',
  proficiency_level: 5,
  years_experience: 3,
});

// Update a freelancer skill
const { data, error } = await updateFreelancerSkill('freelancer-skill-uuid', { proficiency_level: 4 });

// Delete a freelancer skill
const { data, error } = await deleteFreelancerSkill('freelancer-skill-uuid');
*/ 
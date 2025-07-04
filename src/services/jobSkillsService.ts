import { supabase } from '@/integrations/supabase/client';
import { JobSkill } from '@/types/supabase';

// --- Service: Job Skills ---

// Get all job skills
export async function getAllJobSkills(): Promise<{ data: JobSkill[] | null; error: string | null }> {
  const { data, error } = await supabase.from('job_skills').select('*');
  return { data, error: error?.message || null };
}

// Get a job skill by ID
export async function getJobSkillById(id: string): Promise<{ data: JobSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('job_skills').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new job skill
export async function createJobSkill(skill: Omit<JobSkill, 'id' | 'created_at'>): Promise<{ data: JobSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('job_skills').insert([skill]).select().single();
  return { data, error: error?.message || null };
}

// Update a job skill by ID
export async function updateJobSkill(id: string, updates: Partial<Omit<JobSkill, 'id' | 'created_at'>>): Promise<{ data: JobSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('job_skills').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a job skill by ID
export async function deleteJobSkill(id: string): Promise<{ data: JobSkill | null; error: string | null }> {
  const { data, error } = await supabase.from('job_skills').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all job skills
const { data, error } = await getAllJobSkills();

// Get a job skill by ID
const { data, error } = await getJobSkillById('job-skill-uuid');

// Create a new job skill
const { data, error } = await createJobSkill({
  job_id: 'job-post-uuid',
  skill_id: 'skill-uuid',
  is_required: true,
  importance_weight: 5,
});

// Update a job skill
const { data, error } = await updateJobSkill('job-skill-uuid', { importance_weight: 4 });

// Delete a job skill
const { data, error } = await deleteJobSkill('job-skill-uuid');
*/ 
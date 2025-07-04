import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types/supabase';

// --- Service: Skills ---

// Get all skills
export async function getAllSkills(): Promise<{ data: Skill[] | null; error: string | null }> {
  const { data, error } = await supabase.from('skills').select('*');
  return { data, error: error?.message || null };
}

// Get a skill by ID
export async function getSkillById(id: string): Promise<{ data: Skill | null; error: string | null }> {
  const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new skill
export async function createSkill(skill: Omit<Skill, 'id' | 'created_at'>): Promise<{ data: Skill | null; error: string | null }> {
  const { data, error } = await supabase.from('skills').insert([skill]).select().single();
  return { data, error: error?.message || null };
}

// Update a skill by ID
export async function updateSkill(id: string, updates: Partial<Omit<Skill, 'id' | 'created_at'>>): Promise<{ data: Skill | null; error: string | null }> {
  const { data, error } = await supabase.from('skills').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a skill by ID
export async function deleteSkill(id: string): Promise<{ data: Skill | null; error: string | null }> {
  const { data, error } = await supabase.from('skills').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all skills
const { data, error } = await getAllSkills();

// Get a skill by ID
const { data, error } = await getSkillById('skill-uuid');

// Create a new skill
const { data, error } = await createSkill({
  name: 'React',
  category: 'Frontend',
  description: 'A JavaScript library for building user interfaces',
});

// Update a skill
const { data, error } = await updateSkill('skill-uuid', { name: 'ReactJS' });

// Delete a skill
const { data, error } = await deleteSkill('skill-uuid');
*/ 
import { supabase } from '@/integrations/supabase/client';
import { FreelancerProfile } from '@/types/supabase';

// --- Service: Freelancer Profiles ---

// Get all freelancer profiles
export async function getAllFreelancerProfiles(): Promise<{ data: FreelancerProfile[] | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_profiles').select('*');
  return { data, error: error?.message || null };
}

// Get a freelancer profile by ID
export async function getFreelancerProfileById(id: string): Promise<{ data: FreelancerProfile | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_profiles').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new freelancer profile
export async function createFreelancerProfile(profile: Omit<FreelancerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: FreelancerProfile | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_profiles').insert([profile]).select().single();
  return { data, error: error?.message || null };
}

// Update a freelancer profile by ID
export async function updateFreelancerProfile(id: string, updates: Partial<Omit<FreelancerProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: FreelancerProfile | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_profiles').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a freelancer profile by ID
export async function deleteFreelancerProfile(id: string): Promise<{ data: FreelancerProfile | null; error: string | null }> {
  const { data, error } = await supabase.from('freelancer_profiles').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all freelancer profiles
const { data, error } = await getAllFreelancerProfiles();

// Get a freelancer profile by ID
const { data, error } = await getFreelancerProfileById('freelancer-profile-uuid');

// Create a new freelancer profile
const { data, error } = await createFreelancerProfile({
  hourly_rate: 50,
  availability_hours_per_week: 40,
  experience_level: 'senior',
  bio: 'Experienced developer',
  portfolio_url: '',
  rating: 0,
  completed_projects: 0,
});

// Update a freelancer profile
const { data, error } = await updateFreelancerProfile('freelancer-profile-uuid', { hourly_rate: 60 });

// Delete a freelancer profile
const { data, error } = await deleteFreelancerProfile('freelancer-profile-uuid');
*/ 
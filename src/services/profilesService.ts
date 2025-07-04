import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';

// --- Service: Profiles ---

// Get all profiles
export async function getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').select('*');
  return { data, error: error?.message || null };
}

// Get a profile by ID
export async function getProfileById(id: string): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new profile
export async function createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').insert([profile]).select().single();
  return { data, error: error?.message || null };
}

// Update a profile by ID
export async function updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a profile by ID
export async function deleteProfile(id: string): Promise<{ data: Profile | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all profiles
const { data, error } = await getAllProfiles();

// Get a profile by ID
const { data, error } = await getProfileById('profile-uuid');

// Create a new profile
const { data, error } = await createProfile({
  user_type: 'freelancer',
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  avatar_url: '',
});

// Update a profile
const { data, error } = await updateProfile('profile-uuid', { full_name: 'Jane Smith' });

// Delete a profile
const { data, error } = await deleteProfile('profile-uuid');
*/ 
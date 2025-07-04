import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/supabase';

// --- Service: Matches ---

// Get all matches
export async function getAllMatches(): Promise<{ data: Match[] | null; error: string | null }> {
  const { data, error } = await supabase.from('matches').select('*');
  return { data, error: error?.message || null };
}

// Get a match by ID
export async function getMatchById(id: string): Promise<{ data: Match | null; error: string | null }> {
  const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new match
export async function createMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Match | null; error: string | null }> {
  const { data, error } = await supabase.from('matches').insert([match]).select().single();
  return { data, error: error?.message || null };
}

// Update a match by ID
export async function updateMatch(id: string, updates: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Match | null; error: string | null }> {
  const { data, error } = await supabase.from('matches').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a match by ID
export async function deleteMatch(id: string): Promise<{ data: Match | null; error: string | null }> {
  const { data, error } = await supabase.from('matches').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all matches
const { data, error } = await getAllMatches();

// Get a match by ID
const { data, error } = await getMatchById('match-uuid');

// Create a new match
const { data, error } = await createMatch({
  job_id: 'job-post-uuid',
  freelancer_id: 'freelancer-profile-uuid',
  compatibility_score: 0.95,
  status: 'pending',
});

// Update a match
const { data, error } = await updateMatch('match-uuid', { status: 'accepted' });

// Delete a match
const { data, error } = await deleteMatch('match-uuid');
*/ 
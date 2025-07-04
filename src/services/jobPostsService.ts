import { supabase } from '@/integrations/supabase/client';
import { JobPost } from '@/types/supabase';

// --- Service: Job Posts ---

// Get all job posts
export async function getAllJobPosts(): Promise<{ data: JobPost[] | null; error: string | null }> {
  const { data, error } = await supabase.from('job_posts').select('*');
  return { data, error: error?.message || null };
}

// Get a job post by ID
export async function getJobPostById(id: string): Promise<{ data: JobPost | null; error: string | null }> {
  const { data, error } = await supabase.from('job_posts').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new job post
export async function createJobPost(post: Omit<JobPost, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: JobPost | null; error: string | null }> {
  const { data, error } = await supabase.from('job_posts').insert([post]).select().single();
  return { data, error: error?.message || null };
}

// Update a job post by ID
export async function updateJobPost(id: string, updates: Partial<Omit<JobPost, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: JobPost | null; error: string | null }> {
  const { data, error } = await supabase.from('job_posts').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a job post by ID
export async function deleteJobPost(id: string): Promise<{ data: JobPost | null; error: string | null }> {
  const { data, error } = await supabase.from('job_posts').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all job posts
const { data, error } = await getAllJobPosts();

// Get a job post by ID
const { data, error } = await getJobPostById('job-post-uuid');

// Create a new job post
const { data, error } = await createJobPost({
  client_id: 'client-profile-uuid',
  title: 'Build a React App',
  description: 'Need a React developer for a new project',
  budget_min: 1000,
  budget_max: 2000,
  deadline: '2024-07-01',
  required_experience_level: 'mid',
  status: 'open',
});

// Update a job post
const { data, error } = await updateJobPost('job-post-uuid', { status: 'in_progress' });

// Delete a job post
const { data, error } = await deleteJobPost('job-post-uuid');
*/ 
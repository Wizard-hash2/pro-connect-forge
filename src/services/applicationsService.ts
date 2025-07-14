import { supabase } from '@/integrations/supabase/client';
// You may need to adjust the import path for Application type
import { Application } from '@/types/supabase';

// Get all applications
export async function getAllApplications(): Promise<{ data: Application[] | null; error: string | null }> {
  const { data, error } = await supabase.from('applications').select('*');
  return { data, error: error?.message || null };
}

// Get applications by job ID
export async function getApplicationsByJobId(jobId: string): Promise<{ data: Application[] | null; error: string | null }> {
  const { data, error } = await supabase.from('applications').select('*').eq('job_id', jobId);
  return { data, error: error?.message || null };
}

// Get applications by freelancer ID
export async function getApplicationsByFreelancerId(freelancerId: string): Promise<{ data: Application[] | null; error: string | null }> {
  const { data, error } = await supabase.from('applications').select('*').eq('freelancer_id', freelancerId);
  return { data, error: error?.message || null };
}

// Create a new application
export async function createApplication(application: Omit<Application, 'id' | 'created_at'>): Promise<{ data: Application | null; error: string | null }> {
  if (!application.freelancer_id) {
    return { data: null, error: 'freelancer_id is required and cannot be null.' };
  }
  const { data, error } = await supabase.from('applications').insert([application]).select().single();
  return { data, error: error?.message || null };
} 
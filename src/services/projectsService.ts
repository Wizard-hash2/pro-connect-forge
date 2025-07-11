import { supabase } from '@/integrations/supabase/client';

export async function getProjectsByProfile(profileId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  return { data, error: error?.message || null };
}

export async function addProjectWithImage(profileId: string, title: string, description: string, imageFile: File) {
  // 1. Upload image to Supabase Storage
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${profileId}-${Date.now()}.${fileExt}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('project-images')
    .upload(fileName, imageFile, { upsert: true });
  if (storageError) return { data: null, error: storageError.message };

  // 2. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('project-images')
    .getPublicUrl(fileName);
  const imageUrl = publicUrlData?.publicUrl || '';

  // 3. Insert project row
  const { data, error } = await supabase
    .from('projects')
    .insert([{ profile_id: profileId, title, description, image_url: imageUrl }])
    .select()
    .single();
  return { data, error: error?.message || null };
}

export async function deleteProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  return { data, error: error?.message || null };
} 
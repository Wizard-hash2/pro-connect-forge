import React, { useRef, useState, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { updateProfile } from '@/services/profilesService';
import { updateFreelancerProfile } from '@/services/freelancerProfilesService';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useFreelancerSkills } from '@/hooks/useFreelancerSkills';
import { useSkills } from '@/hooks/useSkills';

export default function Profile() {
  const { profile, loading, error, refresh } = useUserProfile();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [certification, setCertification] = useState(profile?.certification || '');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [projectUploading, setProjectUploading] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const { data: jobPosts } = useJobPosts();
  const { data: freelancerSkills, loading: skillsLoading, error: skillsError } = useFreelancerSkills();
  const { data: allSkills } = useSkills();

  // Handle profile save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
        ...(profile?.user_type === 'client' ? { country } : { education, certification }),
      });
      await refresh();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
    }
    setSaving(false);
  };

  // Handle project add (for freelancers)
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !projectTitle) return;
    setProjectUploading(true);
    setProjectError(null);
    setProjectSuccess(false);
    try {
      const newProjects = Array.isArray(profile.projects) ? [...profile.projects, { title: projectTitle, description: projectDescription }] : [{ title: projectTitle, description: projectDescription }];
      await updateFreelancerProfile(profile.id, {
        projects: newProjects,
      });
      await refresh();
      setProjectTitle('');
      setProjectDescription('');
      setProjectSuccess(true);
    } catch (err: any) {
      setProjectError(err.message || 'Failed to add project');
    }
    setProjectUploading(false);
  };

  // Handle avatar upload (for both client and freelancer)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    // Upload avatar to Supabase Storage (avatars bucket)
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    if (storageError) {
      setSaveError(storageError.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    const url = publicUrlData?.publicUrl || '';
    setAvatarUrl(url);
  };

  // Before rendering projects, normalize profile.projects to always be an array
  const projects = Array.isArray(profile?.projects)
    ? profile.projects
    : (typeof profile?.projects === 'string' && profile.projects.trim().startsWith('[')
        ? (() => { try { return JSON.parse(profile.projects); } catch { return []; } })()
        : []);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      {/* Freelancer Skills Section */}
      {profile?.user_type === 'freelancer' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Skills</h2>
          {skillsLoading ? (
            <div>Loading skills...</div>
          ) : skillsError ? (
            <div className="text-red-500">Error: {skillsError}</div>
          ) : (
            <ul className="space-y-2">
              {freelancerSkills?.filter(s => s.freelancer_id === profile.id).length === 0 ? (
                <li className="text-gray-500">No skills added yet.</li>
              ) : (
                freelancerSkills?.filter(s => s.freelancer_id === profile.id).map(skill => {
                  const skillMeta = allSkills?.find(meta => meta.id === skill.skill_id);
                  return (
                    <li key={skill.skill_id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="font-semibold">{skillMeta?.name || 'Skill'}</span>
                        {skillMeta?.category && <span className="ml-2 text-xs text-gray-500">({skillMeta.category})</span>}
                        <span className="ml-2 text-sm text-gray-600">Experience: {skill.years_experience} years</span>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="text-sm">Proficiency: </span>
                        <span className="font-bold">{skill.proficiency_level}</span>
                        <span className="text-xs text-gray-500 ml-1">/5</span>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-6 mb-10">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-2">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback>{fullName?.[0]}</AvatarFallback>
          </Avatar>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        {profile?.user_type === 'client' ? (
          <>
            <div>
              <label className="block font-semibold mb-1">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Joined</label>
              <input type="text" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block font-semibold mb-1">Education</label>
              <input type="text" value={education} onChange={e => setEducation(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Certification</label>
              <input type="text" value={certification} onChange={e => setCertification(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </>
        )}
        <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        {saveError && <div className="text-red-500 mt-2">{saveError}</div>}
      </form>

      {/* Projects/Jobs Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">{profile?.user_type === 'client' ? 'Job Posts' : 'Projects'}</h2>
        {profile?.user_type === 'freelancer' ? (
          <>
            <form onSubmit={handleProjectSubmit} className="mb-6 space-y-4 bg-gray-50 p-6 rounded shadow">
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <Button type="submit" className="w-full" disabled={projectUploading}>{projectUploading ? 'Saving...' : 'Add Project'}</Button>
              {projectError && <div className="text-red-500 mt-2">{projectError}</div>}
              {projectSuccess && <div className="text-green-600 mt-2">Project added!</div>}
            </form>
            <div className="grid gap-6 md:grid-cols-2">
              {projects.length === 0 ? (
                <div className="text-gray-500">No projects yet.</div>
              ) : (
                projects.map((project: any, idx: number) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {project.title}
                        <Badge variant="secondary">Project</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-2">{project.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(jobPosts?.filter(j => j.client_id === profile?.id) || []).length === 0 ? (
              <div className="text-gray-500">No job posts yet.</div>
            ) : (
              jobPosts?.filter(j => j.client_id === profile?.id).map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {job.title}
                      <Badge variant="secondary">Job Post</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 mb-2">{job.description}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
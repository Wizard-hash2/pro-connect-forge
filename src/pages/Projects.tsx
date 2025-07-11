import React, { useRef, useState } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { getProjectsByProfile, addProjectWithImage, deleteProject } from '@/services/projectsService';

export default function Projects() {
  const { profile } = useUserProfile();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchProjects = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data, error } = await getProjectsByProfile(profile.id);
    setProjects(data || []);
    setError(error);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !title || !image) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    const { error } = await addProjectWithImage(profile.id, title, description, image);
    if (error) setError(error);
    else {
      setSuccess(true);
      setTitle('');
      setDescription('');
      setImage(null);
      fetchProjects();
    }
    setUploading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Project Image</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Add Project'}</button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">Project added!</div>}
      </form>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div>No projects yet.</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="bg-white rounded shadow p-4 flex flex-col">
              {project.image_url && <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover rounded mb-2" />}
              <h2 className="font-bold text-lg mb-1">{project.title}</h2>
              <p className="text-gray-600 mb-2">{project.description}</p>
              <button onClick={async () => { await deleteProject(project.id); fetchProjects(); }} className="text-red-500 text-sm mt-auto">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
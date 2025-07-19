import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSkills } from '@/hooks/useSkills';
import { createSkill } from '@/services/skillsService';
import { createFreelancerSkill } from '@/services/freelancerSkillsService';

/**
 * SignUpForm - Sign up form for both client and freelancer.
 *
 * Usage:
 * <SignUpForm />
 */
export function SignUpForm({ onlySkillsStep = false, onComplete }: { onlySkillsStep?: boolean; onComplete?: () => void } = {}) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    user_type: 'client', // or 'freelancer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSkillStep, setShowSkillStep] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<{ name: string; id?: string; experience: string; isNew?: boolean; proficiency?: number }[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [proficiencyInput, setProficiencyInput] = useState('3');
  const [skillError, setSkillError] = useState<string | null>(null);
  const { data: skills, loading: skillsLoading, error: skillsError, refetch } = useSkills();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Create Supabase Auth user
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          user_type: form.user_type,
        },
      },
    });

    if (authError) {
      setError(authError.message || 'Sign up failed');
      setLoading(false);
      return;
    }

    // 2. Show skill step for freelancers
    if (form.user_type === 'freelancer') {
      setShowSkillStep(true);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // Add skill to selection
  const handleAddSkill = () => {
    setSkillError(null);
    if (!skillInput.trim() || !experienceInput.trim()) {
      setSkillError('Please enter both skill and experience.');
      return;
    }
    if (selectedSkills.length >= 6) {
      setSkillError('You can select up to 6 skills.');
      return;
    }
    if (selectedSkills.some(s => s.name.toLowerCase() === skillInput.trim().toLowerCase())) {
      setSkillError('Skill already selected.');
      return;
    }
    // Check if skill exists
    const existingSkill = skills?.find(s => s.name.toLowerCase() === skillInput.trim().toLowerCase());
    setSelectedSkills([...selectedSkills, {
      name: skillInput.trim(),
      id: existingSkill?.id,
      experience: experienceInput.trim(),
      proficiency: parseInt(proficiencyInput, 10) || 3,
      isNew: !existingSkill,
    }]);
    setSkillInput('');
    setExperienceInput('');
    setProficiencyInput('3');
  };

  // Remove skill from selection
  const handleRemoveSkill = (name: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.name !== name));
  };

  // Finalize freelancer skills
  const handleSkillsSubmit = async () => {
    setLoading(true);
    setSkillError(null);
    try {
      // Get user id from supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found.');
      for (const skill of selectedSkills) {
        let skillId = skill.id;
        // If new skill, add to skills table
        if (skill.isNew) {
          const { data: newSkill, error: skillErr } = await createSkill({ name: skill.name, category: 'Other', description: '' });
          if (skillErr || !newSkill) throw new Error(skillErr || 'Failed to add new skill.');
          skillId = newSkill.id;
        }
        // Add to freelancer_skills
        const { error: fsError } = await createFreelancerSkill({
          freelancer_id: user.id,
          skill_id: skillId,
          years_experience: parseInt(skill.experience, 10) || 0,
          proficiency_level: skill.proficiency,
        });
        if (fsError) throw new Error(fsError);
      }
      setSuccess(true);
      setShowSkillStep(false);
      if (onComplete) onComplete();
    } catch (err: any) {
      setSkillError(err.message || 'Failed to save skills.');
    }
    setLoading(false);
  };

  return (
    <>
      {success ? (
        <div className="max-w-md mx-auto p-4 border rounded space-y-4 bg-white shadow text-center">
          <h2 className="text-xl font-bold text-green-600 mb-2">Email Sent Successfully!</h2>
          <p className="mb-4">A confirmation email has been sent to <span className="font-semibold">{form.email}</span>.<br />Please check your inbox and follow the link to verify your account.</p>
        </div>
      ) : onlySkillsStep ? (
        <div className="max-w-md mx-auto p-4 border rounded space-y-4 bg-white shadow">
          <h2 className="text-xl font-bold mb-2">Select Your Skills (up to 6)</h2>
          <div>
            <label className="block mb-1 font-semibold">Skill</label>
            <input
              list="skills-list"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              placeholder="Type or select a skill"
              className="w-full p-2 border rounded mb-2"
            />
            <datalist id="skills-list">
              {skills?.map(skill => (
                <option key={skill.id} value={skill.name} />
              ))}
            </datalist>
            <label className="block mb-1 font-semibold">Experience (years)</label>
            <input
              type="number"
              min="0"
              value={experienceInput}
              onChange={e => setExperienceInput(e.target.value)}
              placeholder="e.g. 3"
              className="w-full p-2 border rounded mb-2"
            />
            <label className="block mb-1 font-semibold">Proficiency Level (1-5)</label>
            <select
              value={proficiencyInput}
              onChange={e => setProficiencyInput(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              {[1,2,3,4,5].map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <button type="button" onClick={handleAddSkill} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">Add Skill</button>
            {skillError && <div className="text-red-500 mb-2">{skillError}</div>}
            <ul className="mb-2">
              {selectedSkills.map(skill => (
                <li key={skill.name} className="flex items-center justify-between border p-2 rounded mb-1">
                  <span>{skill.name} ({skill.experience} years)</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill.name)} className="text-red-500 ml-2">Remove</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={handleSkillsSubmit} disabled={selectedSkills.length === 0 || loading} className="w-full bg-green-600 text-white p-2 rounded">
              {loading ? 'Saving...' : 'Finish'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded space-y-4 bg-white shadow">
          <h2 className="text-xl font-bold">Sign Up</h2>
          <input
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <select
            name="user_type"
            value={form.user_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
    </>
  );
}

export default SignUpForm; 
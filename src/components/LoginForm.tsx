import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/context/UserProfileContext';

/**
 * LoginForm - Login form for both client and freelancer.
 *
 * Usage:
 * <LoginForm />
 */
export function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useUserProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setProfileCreated(false);

    // Sign in with Supabase Auth
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    // After login, check if profile exists, create if not
    const { data: { user } } = await supabase.auth.getUser();
    let createdProfile = false;
    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!existingProfile) {
        // Create the profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email,
          user_type: user.user_metadata?.user_type || 'client',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
        if (profileError) {
          setError('Profile creation failed: ' + profileError.message);
          setLoading(false);
          return;
        }
        setProfileCreated(true);
        createdProfile = true;
      }
    }

    // Refresh the profile context to ensure latest data is loaded
    await refresh();

    setSuccess(true);
    setLoading(false);
    // Redirect to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded space-y-4 bg-white shadow">
      <h2 className="text-xl font-bold">Log In</h2>
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
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {profileCreated && <div className="text-green-600">Profile created for the first time!</div>}
      {success && <div className="text-green-600">Login successful! Redirecting...</div>}
    </form>
  );
}

export default LoginForm; 
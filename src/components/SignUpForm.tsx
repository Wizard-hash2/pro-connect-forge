import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * SignUpForm - Sign up form for both client and freelancer.
 *
 * Usage:
 * <SignUpForm />
 */
export function SignUpForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    user_type: 'client', // or 'freelancer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    // 2. Do NOT insert into profiles table here. Wait until after login.
    setSuccess(true);
    setLoading(false);
  };

  return (
    <>
      {success ? (
        <div className="max-w-md mx-auto p-4 border rounded space-y-4 bg-white shadow text-center">
          <h2 className="text-xl font-bold text-green-600 mb-2">Email Sent Successfully!</h2>
          <p className="mb-4">A confirmation email has been sent to <span className="font-semibold">{form.email}</span>.<br />Please check your inbox and follow the link to verify your account.</p>
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
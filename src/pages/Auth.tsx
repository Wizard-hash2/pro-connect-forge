import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('login')}
        >
          Log In
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('signup')}
        >
          Sign Up
        </button>
      </div>
      {mode === 'login' ? <LoginForm /> : <SignUpForm />}
    </div>
  );
} 
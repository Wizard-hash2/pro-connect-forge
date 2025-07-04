import React from 'react';
import SignUpForm from '@/components/SignUpForm';

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
      <p className="mb-6 text-gray-600">Sign up as a client or freelancer to get started.</p>
      <SignUpForm />
    </div>
  );
} 
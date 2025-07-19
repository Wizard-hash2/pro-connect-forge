import React from "react";

export default function Verified() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="flex flex-col items-center mb-6">
          <svg
            className="w-16 h-16 text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2l4-4"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-4">
            Your email has been successfully verified.<br />
            You can now log in to your account.
          </p>
        </div>
        <a
          href="https://kenwork.onrender.com/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
} 
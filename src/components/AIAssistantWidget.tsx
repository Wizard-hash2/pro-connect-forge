import React from 'react';
import { useNavigate } from 'react-router-dom';

const AIAssistantWidget: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      className="fixed bottom-6 right-6 z-[200] bg-blue-700 text-white rounded-full shadow-lg p-4 hover:bg-blue-800 transition-all"
      onClick={() => navigate('/ai-me')}
      aria-label="Open AI Assistant"
    >
      🤖 AI Assistant
    </button>
  );
};

export default AIAssistantWidget; 
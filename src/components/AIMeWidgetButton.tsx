import React from 'react';

const AIMeWidgetButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: '#1849b1',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      padding: '0.5rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      fontSize: '1.2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      gap: '0.7rem',
    }}
  >
    <img
      src="/KenworkLogo.png"
      alt="AI Me Logo"
      style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }}
    />
    <span>AI ME</span>
  </button>
);

export default AIMeWidgetButton; 
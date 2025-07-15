import React, { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import ReactMarkdown from 'react-markdown';

const suggestionButtons = [
  'AUTO JOB POST',
  'AUTO RECOMMEND CANDIDATE',
  'CREATE A JOB POST',
  'ADVISE ON THE JOB PLAN AND BUDGET',
  'ANALYZE SKILLS',
  'Write a first draft',
 
];

const specialFlows = {
  'AUTO JOB POST': [
    { question: 'What is the job title?' },
    { question: 'Describe the job you want to post.' },
    { question: 'What skills are required? (comma separated)' },
    { question: 'What is your budget for this job?' },
    { question: 'What is the deadline for this job?' },
  ],
  'AUTO RECOMMEND CANDIDATE': [
    { question: 'What is the job title or main skill you need?' },
    { question: 'Describe the ideal candidate.' },
  ],
  'CREATE A JOB POST': [
    { question: 'What is the job title?' },
    { question: 'Describe the job you want to post.' },
    { question: 'What skills are required? (comma separated)' },
    { question: 'What is your budget for this job?' },
    { question: 'What is the deadline for this job?' },
  ],
  'ADVISE ON THE JOB PLAN AND BUDGET': [
    { question: 'Describe your job or project.' },
  ],
  'ANALYZE SKILLS': [
    { question: 'List the skills or paste a profile to analyze.' },
  ],
};

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GOOGLE_AI_API_KEY = 'AIzaSyDpnqD2QFYk9q0RrI1_npmMYO6aJHjGIsY';

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

const skillSuggestions = [
  'Java', 'Kotlin', 'Android SDK', 'Data Structures', 'Algorithm Design', 'Performance Optimization', 'Graph Algorithms', 'Dynamic Programming', 'UI/UX', 'REST APIs', 'Testing', 'Git', 'Agile', 'SQL', 'Firebase'
];

function inferSkillsFromText(text: string) {
  const lower = text.toLowerCase();
  const found = skillSuggestions.filter(skill => lower.includes(skill.toLowerCase()));
  // Always suggest at least a few
  return found.length ? found : skillSuggestions.slice(0, 5);
}

function inferJobLevel(description: string, skills: string[]) {
  if (skills.some(s => /graph|dynamic programming|performance|optimization|architecture/i.test(s))) return 'Expert';
  if (skills.some(s => /android sdk|java|kotlin|testing|ui|ux|rest|api|firebase/i.test(s))) return 'Intermediate';
  return 'Beginner';
}

function isValidBudget(budget: string) {
  return /\d/.test(budget) && !/i don'?t know|done|n\/a|unknown|java|kotlin/i.test(budget);
}
function isValidDeadline(deadline: string) {
  // Accepts formats like 20/07/2025, 2025-07-20, July 20, 2025
  return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2}|[a-zA-Z]+ \d{1,2}, \d{4}/.test(deadline) && !/i don'?t know|done|n\/a|unknown|java|data/i.test(deadline);
}

function validateJobFields(job: any) {
  const errors = [];
  if (!job.title || job.title.length < 3 || /i don'?t know|done|n\/a|unknown/i.test(job.title)) errors.push('title');
  if (!job.description || job.description.length < 10 || /i don'?t know|done|n\/a|unknown/i.test(job.description)) errors.push('description');
  if (!job.skills || job.skills.length < 2 || /i don'?t know|done|n\/a|unknown/i.test(job.skills.join(','))) errors.push('skills');
  if (!job.budget || !isValidBudget(job.budget)) errors.push('budget');
  if (!job.deadline || !isValidDeadline(job.deadline)) errors.push('deadline');
  return errors;
}

const AIMePage: React.FC = () => {
  const { profile, loading: profileLoading } = useUserProfile();
  const userName = profile && profile.full_name ? profile.full_name.split(' ')[0] : 'there';
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [flow, setFlow] = useState<string | null>(null);
  const [flowStep, setFlowStep] = useState(0);
  const [flowAnswers, setFlowAnswers] = useState<string[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [pendingSkills, setPendingSkills] = useState<string[]>([]);
  const [skillsValidated, setSkillsValidated] = useState(false);
  const [jobPreview, setJobPreview] = useState<any>(null);
  const [autoPostReady, setAutoPostReady] = useState(false);

  const handleExpandToggle = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Animated typing for welcome message
  useEffect(() => {
    if (profileLoading) return;
    if (!showWelcome) return;
    const name = userName || 'there';
    const welcome = `${getGreeting(name)}\nWhat can I help you with today?`;
    let i = 0;
    setTypingText('');
    const interval = setInterval(() => {
      setTypingText(w => w + welcome[i]);
      i++;
      if (i >= welcome.length) {
        clearInterval(interval);
        setTimeout(() => setShowWelcome(false), 800); // Show suggestions after greeting
      }
    }, 30);
    return () => clearInterval(interval);
  }, [userName, showWelcome, profileLoading]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, chatLoading]);

  // Save/load recent conversations (localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('ai_me_conversation');
    if (saved) setAiMessages(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('ai_me_conversation', JSON.stringify(aiMessages));
  }, [aiMessages]);

  const handleSuggestion = (text: string) => {
    setChatInput('');
    setShowWelcome(false);
    if (specialFlows[text]) {
      setFlow(text);
      setFlowStep(0);
      setFlowAnswers([]);
      setAiMessages(prev => [...prev, { role: 'ai', text: specialFlows[text][0].question }]);
    } else {
      setChatInput(text);
    }
  };

  const handleChatSend = async () => {
    if (flow) {
      // Handle special flow Q&A
      const currentFlow = specialFlows[flow];
      const answer = chatInput.trim();
      if (!answer) return;
      setAiMessages(prev => [...prev, { role: 'user', text: answer }]);
      const nextStep = flowStep + 1;
      const newAnswers = [...flowAnswers, answer];
      setFlowAnswers(newAnswers);
      setChatInput('');

      // Skills step (index 2)
      if (flow && (flow === 'AUTO JOB POST' || flow === 'CREATE A JOB POST')) {
        const currentFlow = specialFlows[flow];
        const answer = chatInput.trim();
        if (!answer) {
          setAiMessages(prev => [...prev, { role: 'ai', text: `If you don't know the skills, here are some suggestions: ${pendingSkills.length ? pendingSkills.join(', ') : skillSuggestions.slice(0, 5).join(', ')}. You can type any skills (comma separated), add more, or type 'done' when finished.` }]);
          setChatInput('');
          return;
        }
        if (nextStep === 3 && !skillsValidated) {
          if (answer.toLowerCase() === "i don't know" || answer.toLowerCase() === 'idk') {
            if (pendingSkills.length === 0) {
              setPendingSkills(skillSuggestions.slice(0, 5));
            }
            setAiMessages(prev => [...prev, { role: 'ai', text: `No problem! Here are some suggestions: ${pendingSkills.length ? pendingSkills.join(', ') : skillSuggestions.slice(0, 5).join(', ')}. Please select at least one skill, type your own (comma separated), or type 'done' when finished.` }]);
            setChatInput('');
            return;
          }
          if (answer.toLowerCase() === 'done') {
            if (pendingSkills.length === 0) {
              setAiMessages(prev => [...prev, { role: 'ai', text: `Please select at least one skill, type your own (comma separated), or accept the recommended ones: ${skillSuggestions.slice(0, 5).join(', ')}` }]);
              setChatInput('');
              return;
            }
            setSkillsValidated(true);
            setFlowStep(nextStep);
            setFlowAnswers([...newAnswers.slice(0, 2), pendingSkills.join(', '), ...newAnswers.slice(3)]);
            setAiMessages(prev => [...prev, { role: 'ai', text: 'Skills confirmed! Please continue.' }]);
            setChatInput('');
            return;
          }
          // Accept any skills typed (comma separated), filter out invalid ones
          const newSkills = answer.split(',').map(s => s.trim()).filter(Boolean).filter(s => !/i don'?t know|done|n\/a|unknown/i.test(s));
          if (newSkills.length === 0) {
            setAiMessages(prev => [...prev, { role: 'ai', text: `Please type at least one valid skill, or type 'done' to finish.` }]);
            setChatInput('');
            return;
          }
          setPendingSkills([...pendingSkills, ...newSkills.filter(s => !pendingSkills.includes(s))]);
          setAiMessages(prev => [...prev, { role: 'ai', text: `Added: ${newSkills.join(', ')}. Add more skills, or type 'done' when finished.` }]);
          setChatInput('');
          return;
        }
        // If user is validating skills
        if (nextStep === 3 && !skillsValidated && pendingSkills.length > 0) {
          if (answer.toLowerCase() === 'done') {
            setSkillsValidated(true);
            setFlowStep(nextStep);
            setFlowAnswers([...newAnswers.slice(0, 2), pendingSkills.join(', '), ...newAnswers.slice(3)]);
            setAiMessages(prev => [...prev, { role: 'ai', text: 'Skills confirmed! Please continue.' }]);
            return;
          } else {
            // Add skill if not already present
            if (!pendingSkills.includes(answer)) {
              setPendingSkills([...pendingSkills, answer]);
              setAiMessages(prev => [...prev, { role: 'ai', text: `Added skill: ${answer}. Add more or type 'done' to finish.` }]);
            } else {
              setAiMessages(prev => [...prev, { role: 'ai', text: `Skill already added. Add more or type 'done' to finish.` }]);
            }
            return;
          }
        }
        // After all steps, show preview and ask for confirmation
        if (nextStep >= currentFlow.length) {
          setFlow(null);
          setFlowStep(0);
          setFlowAnswers([]);
          setChatLoading(false);
          // Compose job preview
          const [title, description, skills, budget, deadline] = [newAnswers[0], newAnswers[1], Array.isArray(newAnswers[2]) ? newAnswers[2] : newAnswers[2]?.split(',').map(s => s.trim()), newAnswers[3], newAnswers[4]];
          const level = inferJobLevel(description, skills);
          setJobPreview({ title, description, skills, budget, deadline, level });
          setAiMessages(prev => [...prev, { role: 'ai', text: `Here is your job post preview:\n**Job Title:** ${title}\n**Description:** ${description}\n**Skills:** ${skills.join(', ')}\n**Budget:** ${budget}\n**Deadline:** ${deadline}\n**Level:** ${level}\nType 'auto post' to post this job or 'edit' to change details.` }]);
          setAutoPostReady(true);
          return;
        }
        setFlowStep(nextStep);
        setAiMessages(prev => [...prev, { role: 'ai', text: currentFlow[nextStep].question }]);
        return;
      }
    }
    if (!chatInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatLoading(true);
    setError(null);
    setShowWelcome(false);
    try {
      const prompt = chatInput;
      const response = await fetch(GOOGLE_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GOOGLE_AI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setAiMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setError('Failed to get a response from AI. Please try again.');
      console.error('AI API error:', err);
    }
    setChatInput('');
    setChatLoading(false);
  };

  const handleRegenerate = async () => {
    if (!aiMessages.length) return;
    setRegenerating(true);
    setError(null);
    const lastUserMsg = [...aiMessages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    try {
      const prompt = lastUserMsg.text;
      const response = await fetch(GOOGLE_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GOOGLE_AI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setAiMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setError('Failed to get a response from AI. Please try again.');
      console.error('AI API error:', err);
    }
    setRegenerating(false);
  };

  const handleClearChat = () => {
    setAiMessages([]);
    setShowWelcome(true);
    setTypingText('');
    setChatInput('');
    setError(null);
  };

  // Add logic to handle field correction after validation error
  if (autoPostReady && jobPreview && ['title','description','skills','budget','deadline'].includes(chatInput.trim().toLowerCase())) {
    const field = chatInput.trim().toLowerCase();
    setAiMessages(prev => [...prev, { role: 'ai', text: `Please enter a new value for ${field}:` }]);
    setChatInput('');
    // Wait for next input to update the field
    const updateField = (value: string) => {
      const updated = { ...jobPreview };
      if (field === 'skills') {
        updated.skills = value.split(',').map(s => s.trim()).filter(Boolean).filter(s => !/i don'?t know|done|n\/a|unknown/i.test(s));
      } else {
        updated[field] = value;
      }
      setJobPreview(updated);
      setAiMessages(prev => [...prev, { role: 'ai', text: `Updated ${field}. Here is your revised job post preview:` }]);
      setAiMessages(prev => [...prev, { role: 'ai', text: `**Job Title:** ${updated.title}\n**Description:** ${updated.description}\n**Skills:** ${updated.skills.join(', ')}\n**Budget:** ${updated.budget}\n**Deadline:** ${updated.deadline}\n**Level:** ${updated.level}\nType 'auto post' to post this job or 'edit' to change details.` }]);
      setChatInput('');
    };
    // Temporarily override handleChatSend for next input
    const originalHandle = handleChatSend;
    (window as any)._aiMeFieldUpdate = (value: string) => {
      updateField(value);
      (window as any)._aiMeFieldUpdate = null;
    };
    return;
  }

  // At the top of handleChatSend, check for field update mode
  if ((window as any)._aiMeFieldUpdate) {
    (window as any)._aiMeFieldUpdate(chatInput.trim());
    setChatInput('');
    return;
  }

  if (autoPostReady && chatInput.trim().toLowerCase() === 'edit') {
    setAiMessages(prev => [...prev, { role: 'ai', text: 'Which field would you like to edit? (title, description, skills, budget, deadline)' }]);
    setChatInput('');
    (window as any)._aiMeEditField = true;
    return;
  }
  if (autoPostReady && (window as any)._aiMeEditField && ['title','description','skills','budget','deadline'].includes(chatInput.trim().toLowerCase())) {
    const field = chatInput.trim().toLowerCase();
    setAiMessages(prev => [...prev, { role: 'ai', text: `Please enter a new value for ${field}:` }]);
    setChatInput('');
    (window as any)._aiMeEditField = field;
    return;
  }
  if (autoPostReady && typeof (window as any)._aiMeEditField === 'string' && ['title','description','skills','budget','deadline'].includes((window as any)._aiMeEditField)) {
    const field = (window as any)._aiMeEditField;
    const value = chatInput.trim();
    const updated = { ...jobPreview };
    if (field === 'skills') {
      updated.skills = value.split(',').map(s => s.trim()).filter(Boolean).filter(s => !/i don'?t know|done|n\/a|unknown/i.test(s));
    } else {
      updated[field] = value;
    }
    setJobPreview(updated);
    setAiMessages(prev => [...prev, { role: 'ai', text: `Updated ${field}. Here is your revised job post preview:` }]);
    setAiMessages(prev => [...prev, { role: 'ai', text: `**Job Title:** ${updated.title}\n**Description:** ${updated.description}\n**Skills:** ${updated.skills.join(', ')}\n**Budget:** ${updated.budget}\n**Deadline:** ${updated.deadline}\n**Level:** ${updated.level}\nType 'auto post' to post this job or 'edit' to change details.` }]);
    setChatInput('');
    (window as any)._aiMeEditField = null;
    return;
  }

  if (autoPostReady && chatInput.trim().toLowerCase() === 'auto post') {
    if (jobPreview) {
      const errors = validateJobFields(jobPreview);
      if (errors.length > 0) {
        setAiMessages(prev => [...prev, { role: 'ai', text: `Before posting, please correct the following fields: ${errors.join(', ')}. Type the field name (e.g., 'budget') to update it.` }]);
        setChatInput('');
        return;
      }
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Job posted successfully! 🎉' }]);
      setJobPreview(null);
      setAutoPostReady(false);
      setChatInput('');
      return;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #7b2ff2 0%, #f357a8 100%)' }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 pt-24 pb-40">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-2 mb-4 flex items-center justify-center" style={{ width: 90, height: 90 }}>
            <img src="/KenworkLogo.png" alt="AI Logo" className="h-20 w-20 rounded-full object-cover" style={{ objectFit: 'cover' }} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-center drop-shadow-lg">AI Me</h1>
          <div className="flex gap-2 mb-2">
            <button className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition" onClick={handleClearChat}>Clear chat</button>
            {aiMessages.length > 0 && (
              <button className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition" onClick={handleRegenerate} disabled={regenerating}>{regenerating ? 'Regenerating...' : 'Regenerate'}</button>
            )}
          </div>
          {profileLoading ? (
            <div className="text-white/80 mb-6">Loading profile...</div>
          ) : showWelcome ? (
            <div className="text-2xl text-white mb-6 text-center drop-shadow min-h-[60px] whitespace-pre-line animate-pulse">{typingText}</div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {suggestionButtons.map((text) => (
                <button
                  key={text}
                  className="bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 border border-white/20 transition"
                  onClick={() => handleSuggestion(text)}
                >
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full max-w-xl bg-white/10 rounded-lg p-4 mb-4 min-h-[200px] flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 400 }}>
          {aiMessages.length === 0 && !error && !chatLoading && (
            <div className="text-white/70 text-center">Start a conversation or select a suggestion above.</div>
          )}
          {aiMessages.map((msg, i) => {
            if (msg.role === 'ai') {
              const lines = msg.text.split('\n');
              const isLong = lines.length > 12;
              const expanded = expandedIndexes.includes(i);
              const displayText = isLong && !expanded ? lines.slice(0, 12).join('\n') + '\n...' : msg.text;
              return (
                <div key={i} className="text-white relative group">
                  <span className="inline-block align-middle mr-2">
                    <img src="/KenworkLogo.png" alt="AI" className="h-6 w-6 rounded-full object-cover inline-block align-middle" />
                  </span>
                  <span className="align-middle">
                    <div className="prose prose-invert whitespace-pre-line">
                      <ReactMarkdown>{displayText}</ReactMarkdown>
                    </div>
                  </span>
                  {isLong && (
                    <button
                      className="ml-2 text-xs text-purple-200 underline hover:text-white"
                      onClick={() => handleExpandToggle(i)}
                    >
                      {expanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                  <button
                    className="ml-2 text-xs text-purple-200 underline hover:text-white invisible group-hover:visible"
                    onClick={() => handleCopy(msg.text)}
                  >
                    Copy
                  </button>
                </div>
              );
            }
            return (
              <div key={i} className="text-purple-200 text-right">
                <span className="align-middle">{msg.text}</span>
              </div>
            );
          })}
          {chatLoading && (
            <div className="flex items-center gap-2 text-white/80 animate-pulse">
              <span className="inline-block h-4 w-4 rounded-full bg-purple-300 animate-bounce"></span>
              AI is thinking...
            </div>
          )}
          {error && <div className="text-red-300">{error}</div>}
          <div ref={chatEndRef} />
        </div>
      </div>
      {/* Chat input fixed at bottom, centered with respect to main content */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-center pb-6">
        <div className="w-full max-w-2xl flex items-center bg-white/20 rounded-full px-4 py-2 shadow-lg mx-auto">
          <input
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 px-2 py-2"
            placeholder="Ask AI Me anything..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
            disabled={chatLoading}
          />
          <button
            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
            onClick={handleChatSend}
            disabled={chatLoading || !chatInput.trim()}
          >
            {chatLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMePage; 
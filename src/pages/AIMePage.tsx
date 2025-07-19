import React, { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import AIAssistantWidget from '../components/AIAssistantWidget';

const clientSuggestions = [
  'AUTO JOB POST',
  'AUTO RECOMMEND CANDIDATE',
  'CREATE A JOB POST',
  'ADVISE ON THE JOB PLAN AND BUDGET',
  'ANALYZE SKILLS',
  'Write a first draft',
 
];

const freelancerSuggestions = [
  'Resume Help',
  'Create a Job Plan',
];

const specialFlows = {
  'AUTO JOB POST': [
    
    { question: 'Please Guide me On creating a job post' },
  ],
  'AUTO RECOMMEND CANDIDATE': [
    { question: 'Can You Please help to auto recommend a candidate, should I give you the skills?' },
   
  ],
  'CREATE A JOB POST': [
    { question: 'Please Help me create job post in Question and answer and then summarize?' },
    
    
  ],
  'ADVISE ON THE JOB PLAN AND BUDGET': [
    { question: 'Please help me create a budget, should I provide description' },
  ],
  'ANALYZE SKILLS': [
    { question: 'Please help me in looking for expected set of skills , should I provide description' },
  ],
  'Resume Help': [
    { question: 'Please help generate a resume for my profile' },
  ],
  'Create a Job Plan': [
    
    { question: 'Please Guide ME here, I applied the job but I dont know how to start can you help me , should I provide the details' },
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

const polishJobPost = async (jobData) => {
  const res = await axios.post('/api/polish-job-post', jobData);
  return res.data.summary;
};
const submitJobPost = async (jobData) => {
  // Map jobData to backend fields as needed
  return axios.post('/api/job-posts', jobData);
};

// Add helper for skill suggestion
function suggestSkills(description: string, userSkills: string[]): string[] {
  // Use existing skillSuggestions and inferSkillsFromText
  const inferred = inferSkillsFromText(description);
  // Merge userSkills and inferred, remove duplicates
  return Array.from(new Set([...userSkills, ...inferred])).slice(0, 6);
}
// Add helper for budget suggestion
function suggestBudget(description: string, skills: string[]): string {
  // Simple heuristic: more skills or complex description = higher budget
  let base = 200;
  if (skills.length > 3) base += 200;
  if (/senior|expert|complex|architecture|optimization|ai|ml|data/i.test(description)) base += 300;
  if (/junior|beginner|simple|entry/i.test(description)) base -= 50;
  return `$${base} - $${base + 500}`;
}

// Add a helper to detect meta/clarification questions
function isMetaQuestion(input: string): boolean {
  return /should i|do i need to|can i|must i|is it necessary|what do you need|what info|what information|how much info|how detailed|what should i provide|what do you want/i.test(input);
}
// Add a helper to generate context-aware explanations
function getContextExplanation(field: string): string {
  switch (field) {
    case 'description':
      return `To give you the most accurate help, I need a description of your project.\nWhy? The project's complexity, required skills, and timeline all affect recommendations. Please describe your project's goal, main tasks, and any specific requirements. For example: "Building a mobile app for e-commerce" or "Writing technical blog posts."`;
    case 'skills':
      return `To recommend the most relevant skills, I need to know about your project or the type of freelancer you need.\nWhy? The nature of the work determines the required skills. Please describe the project or tasks. For example: "Developing a React web app" or "Designing a logo for a startup."`;
    case 'budget':
      return `To suggest a realistic budget, I need to know the project's scope and requirements.\nWhy? The complexity, required skills, and timeline all impact the budget. Please describe your project, and I'll recommend a budget range.`;
    default:
      return `To help you best, please provide more details about ${field}.`;
  }
}

// Add a helper to start a new Q&A session after summary
function getQAPromptForFlow(flowType: string): string {
  switch (flowType) {
    case 'AUTO JOB POST':
    case 'CREATE A JOB POST':
      return `Let's gather the information needed to create a job post on Mercy Shop. I'll ask you questions, and you provide the answers, keeping in mind we're crafting this specifically for Mercy Shop's workflow.\nHere we go:`;
    case 'AUTO RECOMMEND CANDIDATE':
      return `Let's find the best candidate for your needs. I'll ask you a few questions to tailor the recommendation.`;
    case 'ADVISE ON THE JOB PLAN AND BUDGET':
      return `Let's work out a budget and plan for your project. I'll ask you a few questions to get started.`;
    case 'ANALYZE SKILLS':
      return `Let's analyze the expected set of skills. I'll ask you a few questions to understand your needs.`;
    default:
      return `Let's get started. I'll ask you a few questions to help you achieve your goal.`;
  }
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
  const [awaitingJobPostConfirm, setAwaitingJobPostConfirm] = useState(false);
  const [pendingJobPost, setPendingJobPost] = useState(null);
  // Add a new state to track if we are in an AI-driven flow
  const [aiFlowActive, setAiFlowActive] = useState(false);
  const [aiFlowStep, setAiFlowStep] = useState(0);
  const [aiFlowAnswers, setAiFlowAnswers] = useState<string[]>([]);
  const [aiFlowType, setAiFlowType] = useState<string | null>(null);
  const [aiFlowSummary, setAiFlowSummary] = useState<string | null>(null);
  const requiredFieldsByFlow: Record<string, string[]> = {
    'AUTO JOB POST': ['title', 'description', 'skills', 'budget', 'deadline', 'experience'],
    'CREATE A JOB POST': ['title', 'description', 'skills', 'budget', 'deadline', 'experience'],
    'AUTO RECOMMEND CANDIDATE': ['title', 'skills', 'experience'],
    'ADVISE ON THE JOB PLAN AND BUDGET': ['description', 'budget', 'deadline'],
    'ANALYZE SKILLS': ['skills'],
  };
  const fieldQuestions: Record<string, string> = {
    title: 'What is the job title?',
    description: 'Please provide a job description.',
    skills: 'What skills are required? (comma separated)',
    budget: 'What is your budget for this job?',
    deadline: 'What is the deadline for this job?',
    experience: 'What is the required experience level (e.g., Beginner, Mid, Expert)?',
  };
  const isMissingOrUnclear = (field: string, value: string) => {
    if (!value) return true;
    if (/to be specified|unknown|n\/a|not sure|tbd|none|empty|random|example|sample|test|\(to be confirmed by client\)/i.test(value)) return true;
    if (field === 'budget' && !/\d/.test(value)) return true;
    if (field === 'deadline' && !/\d{4}|\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(value)) return true;
    return false;
  };
  const [clarificationField, setClarificationField] = useState<string | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<{[k:string]: string}>({});
  // Add state for post-confirmation/edit
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  // Add state for resume help
  const [resumeDraft, setResumeDraft] = useState<string | null>(null);
  const [resumeEditSection, setResumeEditSection] = useState<string | null>(null);

  // Helper to ask AI a question and get a response
  const askAI = async (prompt: string) => {
    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('AI error');
      const data = await response.json();
      return data?.response || 'Sorry, I could not generate a response.';
    } catch (err) {
      return 'Failed to get a response from AI.';
    }
  };

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

  // Modified handleSuggestion for AI-driven flow
  const handleSuggestion = async (text: string) => {
    setChatInput('');
    setShowWelcome(false);
    if (specialFlows[text]) {
      setAiFlowActive(true);
      setAiFlowStep(0);
      setAiFlowAnswers([]);
      setAiFlowType(text);
      setAiFlowSummary(null);
      setAiMessages(prev => [...prev, { role: 'ai', text: specialFlows[text][0].question }]);
      setChatLoading(true);
      // Immediately ask AI the first question
      const aiResponse = await askAI(specialFlows[text][0].question);
      setAiMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setChatLoading(false);
    } else if (text === 'Resume Help' && profile?.type === 'freelancer') {
      // Build resume from profile fields
      let missingFields = [];
      const resumeSections = [];
      if (profile.full_name) {
        resumeSections.push(`Name: ${profile.full_name}`);
      } else {
        missingFields.push('full_name');
      }
      if (profile.email) {
        resumeSections.push(`Email: ${profile.email}`);
      } else {
        missingFields.push('email');
      }
      if (profile.phone) {
        resumeSections.push(`Phone: ${profile.phone}`);
      } else {
        missingFields.push('phone');
      }
      if (profile.bio) {
        resumeSections.push(`Summary: ${profile.bio}`);
      } else {
        missingFields.push('bio');
      }
      if (profile.skills && profile.skills.length > 0) {
        resumeSections.push(`Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills}`);
      } else {
        missingFields.push('skills');
      }
      if (profile.experience) {
        resumeSections.push(`Experience: ${profile.experience}`);
      } else {
        missingFields.push('experience');
      }
      if (profile.projects) {
        resumeSections.push(`Projects: ${profile.projects}`);
      } else {
        missingFields.push('projects');
      }
      if (profile.education) {
        resumeSections.push(`Education: ${profile.education}`);
      } else {
        missingFields.push('education');
      }
      if (profile.portfolio_url) {
        resumeSections.push(`Portfolio: ${profile.portfolio_url}`);
      } else {
        missingFields.push('portfolio_url');
      }
      const resume = resumeSections.join('\n');
      setResumeDraft(resume);
      let aiMsgs = [
        ...aiMessages,
        { role: 'ai', text: resume }
      ];
      if (missingFields.length > 0) {
        aiMsgs.push({ role: 'ai', text: `Please provide the following missing information to complete your resume: ${missingFields.join(', ')}` });
        setResumeEditSection('pending');
      } else {
        aiMsgs.push({ role: 'ai', text: 'Your resume is complete! Would you like to edit any section? (summary, skills, experience, projects, education, portfolio) Type the section name or "no" to finish.' });
        setResumeEditSection('pending');
      }
      setAiMessages(aiMsgs);
      return;
    } else {
      setChatInput(text);
    }
  };

  // Modified Q&A flow for AI-driven flows
  const handleChatSend = async () => {
    if (aiFlowActive && aiFlowType && specialFlows[aiFlowType]) {
      const currentFlow = specialFlows[aiFlowType];
      const answer = chatInput.trim();
      if (!answer) return;
      setAiMessages(prev => [...prev, { role: 'user', text: answer }]);
      let newAnswers = [...aiFlowAnswers, answer];
      const fields = requiredFieldsByFlow[aiFlowType] || [];
      const currentField = fields[aiFlowStep];
      // If the answer is a meta/clarification question, respond contextually
      if (isMetaQuestion(answer)) {
        setAiMessages(prev => [...prev, { role: 'ai', text: getContextExplanation(currentField) }]);
        setChatLoading(false);
        return;
      }
      // If current question is 'skills', suggest more and ask for confirmation
      if (currentField === 'skills' && !skillsValidated) {
        // Parse user skills
        const userSkills = answer.split(',').map(s => s.trim()).filter(Boolean);
        // Use previous description if available
        const description = newAnswers[fields.indexOf('description')] || '';
        const suggested = suggestSkills(description, userSkills);
        // If suggestion adds new skills, ask user to confirm
        if (suggested.length > userSkills.length) {
          setPendingSkills(suggested);
          setAiMessages(prev => [...prev, { role: 'ai', text: `Based on your description, I suggest also including: ${suggested.filter(s => !userSkills.includes(s)).join(', ')}.\nWould you like to add any of these? (Type skills to add, or 'done' to continue.)` }]);
          setSkillsValidated(true);
          setChatLoading(false);
          return;
        } else {
          setPendingSkills(userSkills);
          setSkillsValidated(true);
        }
      }
      // If user is confirming skills
      if (skillsValidated && currentField === 'skills') {
        let confirmedSkills = pendingSkills;
        if (answer.toLowerCase() !== 'done') {
          const addSkills = answer.split(',').map(s => s.trim()).filter(Boolean);
          confirmedSkills = Array.from(new Set([...pendingSkills, ...addSkills]));
          setPendingSkills(confirmedSkills);
          setAiMessages(prev => [...prev, { role: 'ai', text: `Added: ${addSkills.join(', ')}. Add more skills, or type 'done' when finished.` }]);
          setChatLoading(false);
          return;
        }
        // Replace skills answer in newAnswers
        newAnswers[fields.indexOf('skills')] = confirmedSkills.join(', ');
        setSkillsValidated(false);
      }
      // If current question is 'budget', suggest a range
      if (currentField === 'budget' && !autoPostReady) {
        const description = newAnswers[fields.indexOf('description')] || '';
        const skills = (newAnswers[fields.indexOf('skills')] || '').split(',').map(s => s.trim()).filter(Boolean);
        const budgetSuggestion = suggestBudget(description, skills);
        setAiMessages(prev => [...prev, { role: 'ai', text: `A typical budget for this job might be: ${budgetSuggestion}.\nWould you like to use this, or enter your own?` }]);
        setAutoPostReady(true);
        setChatLoading(false);
        return;
      }
      // If user is confirming budget
      if (autoPostReady && currentField === 'budget') {
        let budget = answer;
        if (/\$\d+/.test(answer)) {
          budget = answer;
        } else {
          // Use suggested
          const description = newAnswers[fields.indexOf('description')] || '';
          const skills = (newAnswers[fields.indexOf('skills')] || '').split(',').map(s => s.trim()).filter(Boolean);
          budget = suggestBudget(description, skills);
        }
        newAnswers[fields.indexOf('budget')] = budget;
        setAutoPostReady(false);
      }
      setAiFlowAnswers(newAnswers);
      setChatInput('');
      setChatLoading(true);
      if (aiFlowStep + 1 < currentFlow.length) {
        setAiFlowStep(aiFlowStep + 1);
        setAiMessages(prev => [...prev, { role: 'ai', text: fieldQuestions[fields[aiFlowStep + 1]] }]);
        setChatLoading(false);
      } else {
        // End of flow: check for missing fields before summary
        const fields = requiredFieldsByFlow[aiFlowType] || [];
        // Try to map answers to fields by order
        const answerMap: {[k:string]: string} = {};
        fields.forEach((f, i) => { answerMap[f] = newAnswers[i] || ''; });
        // Merge in any clarification answers
        Object.assign(answerMap, clarificationAnswers);
        const missing = fields.filter(f => isMissingOrUnclear(f, answerMap[f]));
        if (missing.length > 0) {
          setClarificationField(missing[0]);
          setAiMessages(prev => [...prev, { role: 'ai', text: fieldQuestions[missing[0]] }]);
          setAiFlowActive(false); // Pause main flow for clarification
          setChatLoading(false);
          return;
        }
        // All fields present, concise summary and confirmation
        setAiFlowActive(false);
        setAiFlowStep(0);
        setAiFlowType(null);
        setClarificationField(null);
        setClarificationAnswers({});
        const summaryLines = fields.map(f => `**${f.charAt(0).toUpperCase() + f.slice(1)}:** ${answerMap[f]}`);
        setAiMessages(prev => [
          ...prev,
          { role: 'ai', text: `Here’s your job post summary:\n${summaryLines.join('\n')}` },
          { role: 'ai', text: 'Would you like to post this job? (yes/edit)' }
        ]);
        setAwaitingConfirmation(true);
        setChatLoading(false);
        return;
      }
      return;
    }
    // Handle confirmation/edit after summary
    if (awaitingConfirmation) {
      const input = chatInput.trim().toLowerCase();
      if (input === 'yes' || input === 'y') {
        setAiMessages(prev => [...prev, { role: 'ai', text: 'Job post confirmed and submitted! 🎉' }]);
        setAwaitingConfirmation(false);
        setAiFlowAnswers([]);
        setChatInput('');
        setChatLoading(false);
        return;
      } else if (input === 'edit') {
        setAiMessages(prev => [...prev, { role: 'ai', text: `Which field would you like to edit? (${Object.keys(fieldQuestions).join(', ')})` }]);
        setAwaitingConfirmation(false);
        setEditField('pending');
        setChatInput('');
        setChatLoading(false);
        return;
      } else {
        setAiMessages(prev => [...prev, { role: 'ai', text: 'Please type "yes" to confirm or "edit" to update a field.' }]);
        setChatInput('');
        setChatLoading(false);
        return;
      }
    }
    // Handle which field to edit
    if (editField === 'pending') {
      const field = chatInput.trim().toLowerCase();
      if (Object.keys(fieldQuestions).includes(field)) {
        setEditField(field);
        setAiMessages(prev => [...prev, { role: 'ai', text: `Enter new value for ${field}:` }]);
        setChatInput('');
        setChatLoading(false);
        return;
      } else {
        setAiMessages(prev => [...prev, { role: 'ai', text: `Please specify a valid field to edit: ${Object.keys(fieldQuestions).join(', ')}` }]);
        setChatInput('');
        setChatLoading(false);
        return;
      }
    }
    // Handle actual field edit
    if (editField && editField !== 'pending') {
      const newValue = chatInput.trim();
      const fields = requiredFieldsByFlow[aiFlowType || flow] || [];
      let updatedAnswers = [...aiFlowAnswers];
      const idx = fields.indexOf(editField);
      if (idx !== -1) updatedAnswers[idx] = newValue;
      setAiFlowAnswers(updatedAnswers);
      // Re-summarize
      const answerMap: {[k:string]: string} = {};
      fields.forEach((f, i) => { answerMap[f] = updatedAnswers[i] || ''; });
      const summaryLines = fields.map(f => `**${f.charAt(0).toUpperCase() + f.slice(1)}:** ${answerMap[f]}`);
      setAiMessages(prev => [
        ...prev,
        { role: 'ai', text: `Updated summary:\n${summaryLines.join('\n')}` },
        { role: 'ai', text: 'Would you like to post this job? (yes/edit)' }
      ]);
      setEditField(null);
      setAwaitingConfirmation(true);
      setChatInput('');
      setChatLoading(false);
      return;
    }
    if (!chatInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatLoading(true);
    setError(null);
    setShowWelcome(false);
    try {
      const prompt = chatInput;
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const aiText = data?.response || 'Sorry, I could not generate a response.';
      setAiMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setError('Failed to get a response from AI. Please try again.');
      console.error('AI API error:', err);
    }
    setChatInput('');
    setChatLoading(false);
  };

  // In handleChatSend, handle resume edit flow
  if (resumeEditSection === 'pending') {
    const section = chatInput.trim().toLowerCase();
    if (["summary","skills","experience","projects","education","portfolio"].includes(section)) {
      setResumeEditSection(section);
      setAiMessages(prev => [...prev, { role: 'ai', text: `Enter new content for ${section}:` }]);
      setChatInput('');
      setChatLoading(false);
      return;
    } else if (section === 'no') {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Resume finalized! Good luck!' }]);
      setResumeEditSection(null);
      setResumeDraft(null);
      setChatInput('');
      setChatLoading(false);
      return;
    } else {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Please type a valid section name or "no" to finish.' }]);
      setChatInput('');
      setChatLoading(false);
      return;
    }
  }
  if (resumeEditSection && resumeEditSection !== 'pending') {
    // Update the draft
    let updated = resumeDraft || '';
    const section = resumeEditSection;
    const newContent = chatInput.trim();
    const sectionMap = {
      summary: 'Summary:',
      skills: 'Skills:',
      experience: 'Experience:',
      projects: 'Projects:',
      education: 'Education:',
      portfolio: 'Portfolio:',
    };
    // Replace or add the section (plain format)
    const regex = new RegExp(`${sectionMap[section]}.*?(?=(\n[A-Za-z]+:|$))`, 's');
    if (regex.test(updated)) {
      updated = updated.replace(regex, `${sectionMap[section]} ${newContent}\n`);
    } else {
      updated += `\n${sectionMap[section]} ${newContent}\n`;
    }
    setResumeDraft(updated);
    setAiMessages(prev => [
      ...prev,
      { role: 'ai', text: updated },
      { role: 'ai', text: 'Edit another section? (summary, skills, experience, projects, education, portfolio) or type "no" to finish.' }
    ]);
    setResumeEditSection('pending');
    setChatInput('');
    setChatLoading(false);
    return;
  }

  const handleRegenerate = async () => {
    if (!aiMessages.length) return;
    setRegenerating(true);
    setError(null);
    const lastUserMsg = [...aiMessages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    try {
      const prompt = lastUserMsg.text;
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const aiText = data?.response || 'Sorry, I could not generate a response.';
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

  const handleJobPostConfirmation = async (input) => {
    setAiMessages(prev => [...prev, { role: 'user', text: input }, { role: 'ai', text: 'Submitting your job post...' }]);
    setChatInput('');
    setChatLoading(true);
    try {
      await submitJobPost(pendingJobPost);
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Your job post has been submitted!' }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Failed to submit job post.' }]);
    }
    setChatLoading(false);
    setAwaitingJobPostConfirm(false);
    setPendingJobPost(null);
  };

  if (awaitingJobPostConfirm) {
    if (chatInput.trim().toLowerCase().startsWith('y')) {
      handleJobPostConfirmation(chatInput);
      return;
    } else if (chatInput.trim().toLowerCase().startsWith('n')) {
      setAiMessages(prev => [...prev, { role: 'user', text: chatInput }, { role: 'ai', text: 'Okay, your job post was not submitted.' }]);
      setAwaitingJobPostConfirm(false);
      setPendingJobPost(null);
      setChatInput('');
      return;
    }
    setAiMessages(prev => [...prev, { role: 'ai', text: 'Please answer yes or no: Would you like to submit this job post?' }]);
    setChatInput('');
    return;
  }

  // In handleChatSend, if resumeEditSection === 'pending' and missing fields, update profile and resume accordingly
  if (resumeEditSection === 'pending' && resumeDraft) {
    // Find the first missing field
    const missingFields = [];
    if (!profile.full_name) missingFields.push('full_name');
    if (!profile.email) missingFields.push('email');
    if (!profile.phone) missingFields.push('phone');
    if (!profile.bio) missingFields.push('bio');
    if (!profile.skills || profile.skills.length === 0) missingFields.push('skills');
    if (!profile.experience) missingFields.push('experience');
    if (!profile.projects) missingFields.push('projects');
    if (!profile.education) missingFields.push('education');
    if (!profile.portfolio_url) missingFields.push('portfolio_url');
    if (missingFields.length > 0) {
      const field = missingFields[0];
      // Save the user's input to the profile (simulate update)
      profile[field] = chatInput.trim();
      // Re-run the Resume Help logic to update the draft
      handleSuggestion('Resume Help');
      setChatInput('');
      setChatLoading(false);
      return;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #7b2ff2 0%, #f357a8 100%)' }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 pt-24 pb-40">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-2 mb-4 flex items-center justify-center" style={{ width: 90, height: 90 }}>
            <img src="/KenworkLogo.png" alt="AI Me Logo" className="h-20 w-20 rounded-full object-cover" style={{ objectFit: 'cover' }} />
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
              {(profile?.type === 'client' ? clientSuggestions : freelancerSuggestions).map((text) => (
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
              AI Me is thinking...
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
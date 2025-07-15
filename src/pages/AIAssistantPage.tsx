import React, { useState } from 'react';

const initialQuestions = [
  { key: 'title', question: 'What is the job title?' },
  { key: 'description', question: 'Describe the job you want to post.' },
  { key: 'skills', question: 'What skills are required? (comma separated)' },
  { key: 'budget', question: 'What is your budget for this job?' },
  { key: 'deadline', question: 'What is the deadline for this job?' },
];

const GOOGLE_AI_API_KEY = 'AIzaSyDpnqD2QFYk9q0RrI1_npmMYO6aJHjGIsY';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const AIAssistantPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [input, setInput] = useState('');
  const [jobDraft, setJobDraft] = useState<string | null>(null);
  const [suggestedBudget, setSuggestedBudget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const currentKey = initialQuestions[step].key;
    const newAnswers = { ...answers, [currentKey]: input };
    setAnswers(newAnswers);
    setInput('');
    setError(null);
    if (step < initialQuestions.length - 1) {
      setStep(step + 1);
    } else {
      // Call Google AI Studio API to generate job draft and budget
      setLoading(true);
      try {
        const prompt = `Generate a professional job post and suggest a budget based on the following details:\n\nTitle: ${newAnswers.title}\nDescription: ${newAnswers.description}\nSkills: ${newAnswers.skills}\nBudget: ${newAnswers.budget}\nDeadline: ${newAnswers.deadline}\n\nReturn the job post first, then a suggested budget as a number.`;
        const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });
        const data = await response.json();
        // Parse the response
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Try to split job post and budget
        const budgetMatch = aiText.match(/suggested budget[:\-\s]*\$?(\d+[\d,]*)/i);
        setJobDraft(aiText.replace(/suggested budget[:\-\s]*\$?(\d+[\d,]*)/i, '').trim());
        setSuggestedBudget(budgetMatch ? budgetMatch[1] : newAnswers.budget);
      } catch (err) {
        setError('Failed to get a response from AI. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-6 p-6 relative">
        <div className="mb-4 text-lg font-semibold text-blue-700">AI Job Assistant</div>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {jobDraft ? (
          <>
            <div className="mb-2 whitespace-pre-line border p-2 rounded bg-gray-50">{jobDraft}</div>
            <div className="mb-4 text-green-700 font-bold">Suggested Budget: {suggestedBudget}</div>
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full">Post this Job</button>
          </>
        ) : (
          <>
            <div className="mb-2">{initialQuestions[step].question}</div>
            {step === 1 ? (
              <textarea
                className="w-full border rounded p-2 mb-2"
                rows={3}
                value={input}
                onChange={handleInput}
                disabled={loading}
              />
            ) : (
              <input
                className="w-full border rounded p-2 mb-2"
                value={input}
                onChange={handleInput}
                disabled={loading}
              />
            )}
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
              onClick={handleNext}
              disabled={!input || loading}
            >
              {loading ? 'Thinking...' : 'Next'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage; 
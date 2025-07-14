import React, { useEffect, useState, useRef } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Messages() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [applicants, setApplicants] = useState([]); // [{ freelancer, application, conversation, job }]
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [freelancerProjects, setFreelancerProjects] = useState([]);
  const [newMessageMap, setNewMessageMap] = useState({}); // { conversationId: true }
  const messagesEndRef = useRef(null);

  // Determine if user is client or freelancer
  const isClient = profile?.user_type === 'client';
  const isFreelancer = profile?.user_type === 'freelancer';

  // Fetch all freelancers who applied to this client's jobs (client view)
  useEffect(() => {
    if (!profile?.id || !isClient) return;
    setLoading(true);
    (async () => {
      // 1. Get all jobs posted by this client
      const { data: jobs } = await supabase
        .from('job_posts')
        .select('*')
        .eq('client_id', profile.id);
      const jobIds = (jobs || []).map(j => j.id);
      if (jobIds.length === 0) {
        setApplicants([]);
        setLoading(false);
        return;
      }
      // 2. Get all applications for these jobs
      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds);
      // 3. Get unique freelancer ids
      const freelancerIds = [...new Set((applications || []).map(a => a.freelancer_id))];
      // 4. Get freelancer profiles
      const { data: freelancers } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .in('id', freelancerIds);
      // 5. Get conversations for these jobs/freelancers
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .in('job_id', jobIds)
        .in('freelancer_id', freelancerIds)
        .eq('client_id', profile.id);
      // 6. Merge data
      const applicantsData = (applications || []).map(app => {
        const freelancer = (freelancers || []).find(f => f.id === app.freelancer_id);
        const conversation = (conversations || []).find(c => c.job_id === app.job_id && c.freelancer_id === app.freelancer_id);
        const job = (jobs || []).find(j => j.id === app.job_id);
        return { freelancer, application: app, conversation, job };
      });
      setApplicants(applicantsData);
      setLoading(false);
    })();
  }, [profile, isClient]);

  // Fetch all conversations for freelancer (freelancer view)
  const [freelancerConversations, setFreelancerConversations] = useState([]); // [{ conversation, client, job }]
  useEffect(() => {
    if (!profile?.id || !isFreelancer) return;
      setLoading(true);
    (async () => {
      // 1. Get all conversations for this freelancer
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('freelancer_id', profile.id);
      if (!conversations || conversations.length === 0) {
        setFreelancerConversations([]);
        setLoading(false);
        return;
      }
      // 2. Get all jobs for these conversations
      const jobIds = [...new Set(conversations.map(c => c.job_id))];
      const { data: jobs } = await supabase
        .from('job_posts')
        .select('*')
        .in('id', jobIds);
      // 3. Get all clients for these conversations
      const clientIds = [...new Set(conversations.map(c => c.client_id))];
      const { data: clients } = await supabase
        .from('profiles')
        .select('*')
        .in('id', clientIds);
      // 4. Merge data
      const convs = conversations.map(conv => {
        const job = (jobs || []).find(j => j.id === conv.job_id);
        const client = (clients || []).find(c => c.id === conv.client_id);
        return { conversation: conv, client, job };
      });
      setFreelancerConversations(convs);
      setLoading(false);
    })();
  }, [profile, isFreelancer]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    setLoading(true);
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        setMessages(data || []);
        setLoading(false);
        setError(error?.message || null);
        // Mark as read
        setNewMessageMap(prev => ({ ...prev, [selectedConversation.id]: false }));
      });
  }, [selectedConversation]);

  // Real-time updates for messages
  useEffect(() => {
    if (!selectedConversation) return;
    const subscription = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedConversation]);

  // Real-time notifications for new messages in other conversations
  useEffect(() => {
    if (!profile?.id) return;
    const subscription = supabase
      .channel('messages-notify')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new;
        if (msg.sender_id !== profile.id && (!selectedConversation || msg.conversation_id !== selectedConversation.id)) {
          setNewMessageMap(prev => ({ ...prev, [msg.conversation_id]: true }));
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile, selectedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch freelancer projects when viewing profile
  const fetchFreelancerProjects = async (freelancerId) => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', freelancerId)
      .order('created_at', { ascending: false });
    setFreelancerProjects(data || []);
  };

  const sendMessage = async () => {
    if (!messageText || !selectedConversation) return;
    await supabase.from('messages').insert([
      {
        conversation_id: selectedConversation.id,
        sender_id: profile.id,
        content: messageText,
      },
    ]);
    setMessageText('');
    // No need to refetch, real-time will update
  };

  const selectedConversationApplication = isClient && selectedConversation && selectedFreelancer && selectedJob
    ? applicants.find(a => a.conversation?.id === selectedConversation.id && a.freelancer?.id === selectedFreelancer.id && a.job?.id === selectedJob.id)?.application
    : null;

  // Utility for status color
  const getStatusColor = (status) => {
    if (status === 'accepted') return 'text-green-600 bg-green-100 border-green-300';
    if (status === 'unaccepted') return 'text-red-500 bg-red-100 border-red-300';
    return 'text-gray-500 bg-gray-100 border-gray-300';
  };

  if (profileLoading) return <div>Loading profile...</div>;
  if (!profile) return <div>Please log in.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white rounded-lg shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-8">
      {/* Applicants List (Client) or Conversations List (Freelancer) */}
      <div className="w-full sm:w-1/3 border-r pr-0 sm:pr-4 mb-4 sm:mb-0">
        <h2 className="text-xl font-semibold mb-4">
          {isClient ? 'Freelancer Applicants' : 'Conversations'}
        </h2>
      {loading ? (
          <div className="text-blue-600">Loading...</div>
      ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : isClient ? (
          applicants.length === 0 ? (
            <div className="text-gray-500">No applicants yet.</div>
          ) : (
            <ul className="space-y-2">
              {applicants.map(({ freelancer, application, conversation, job }) => (
                <li
                  key={application.id}
                  className={`p-3 rounded cursor-pointer transition-colors duration-150 ${selectedConversation?.id === conversation?.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100 border border-transparent'}`}
                  onClick={() => {
                    if (conversation) {
                      setSelectedConversation(conversation);
                      setSelectedFreelancer(freelancer);
                      setSelectedJob(job);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{freelancer?.bio || 'Freelancer'}</div>
                      <div className="text-xs text-gray-500">Applied for: {job?.title || application.job_id.slice(0, 6)}</div>
                      <div className="text-xs mt-1">
                        Status: <span className={`font-semibold px-2 py-1 rounded border ${getStatusColor(application.status)}`}>{application.status || 'pending'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        setSelectedFreelancer(freelancer);
                        setShowProfile(true);
                        fetchFreelancerProjects(freelancer.id);
                      }}>View Profile</Button>
                      <Button size="sm" variant="secondary" className="transition-colors duration-150 focus:ring-2 focus:ring-blue-400" style={{ minWidth: 60 }} onClick={async e => {
                        e.stopPropagation();
                        if (conversation) {
                          setSelectedConversation(conversation);
                          setSelectedFreelancer(freelancer);
                          setSelectedJob(job);
                        } else {
                          // Create conversation then open it
                          const { data: newConv, error } = await supabase.from('conversations').insert([{
                            job_id: job.id,
                            freelancer_id: freelancer.id,
                            client_id: profile.id,
                          }]).select().single();
                          if (newConv) {
                            setSelectedConversation(newConv);
                            setSelectedFreelancer(freelancer);
                            setSelectedJob(job);
                          }
                        }
                      }}>Chat</Button>
                      {conversation && newMessageMap[conversation.id] && (
                        <Badge variant="destructive">New</Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          freelancerConversations.length === 0 ? (
            <div className="text-gray-500">No conversations yet.</div>
          ) : (
            <ul className="space-y-2">
              {freelancerConversations.map(({ conversation, client, job }) => (
                <li
                  key={conversation.id}
                  className={`p-3 rounded cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setSelectedFreelancer(null); // Not needed for freelancer
                    setSelectedJob(job);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Client: {client?.full_name || client?.email || client?.id}</div>
                      <div className="text-xs text-gray-500">Job: {job?.title || job?.id}</div>
                    </div>
                    {newMessageMap[conversation.id] && (
                      <Badge variant="destructive">New</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
      {/* Message List and Input */}
      <div className="flex-1 flex flex-col w-full">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        {selectedConversation && (isClient ? (selectedFreelancer && selectedJob) : selectedJob) ? (
          <>
            {/* Chat header with job and other party info */}
            <div className="mb-2 p-2 border-b flex items-center justify-between bg-gray-50 rounded">
              <div>
                {isClient ? (
                  <>
                    <div className="font-bold">{selectedFreelancer?.bio || 'Freelancer'}</div>
                    <div className="text-xs text-gray-500">Job: {selectedJob.title || selectedJob.id}</div>
                    <div className="text-xs text-gray-500">
                      Experience: {selectedFreelancer?.experience_level || '—'} | Rate: ${selectedFreelancer?.hourly_rate ?? '—'}/hr | Rating: {selectedFreelancer?.rating ?? '—'}
                    </div>
                    <div className="text-xs mt-1">
                      Status: <span className={`font-semibold px-2 py-1 rounded border ${getStatusColor(selectedConversationApplication?.status)}`}>{selectedConversationApplication?.status || 'pending'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold">Client: {freelancerConversations.find(c => c.conversation.id === selectedConversation.id)?.client?.full_name || 'Client'}</div>
                    <div className="text-xs text-gray-500">Job: {selectedJob.title || selectedJob.id}</div>
                  </>
                )}
              </div>
              {isClient && selectedFreelancer && (
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => {
                    setShowProfile(true);
                    fetchFreelancerProjects(selectedFreelancer.id);
                  }}>View Profile</Button>
                  {/* Accept/Reject buttons, only show if not already accepted/unaccepted */}
                  {selectedConversationApplication && selectedConversationApplication.status !== 'accepted' && selectedConversationApplication.status !== 'unaccepted' && (
                    <>
                      <Button size="sm" variant="success" className="transition-colors duration-150 focus:ring-2 focus:ring-green-400" onClick={async () => {
                        // Accept this application
                        await supabase.from('applications').update({ status: 'accepted' }).eq('id', selectedConversationApplication.id);
                        // Set all other applications for this job to 'unaccepted'
                        await supabase.from('applications').update({ status: 'unaccepted' }).eq('job_id', selectedJob.id).neq('id', selectedConversationApplication.id);
                        // Update state for instant UI
                        setApplicants(prev => prev.map(a => {
                          if (a.application.id === selectedConversationApplication.id) {
                            return { ...a, application: { ...a.application, status: 'accepted' } };
                          } else if (a.job?.id === selectedJob.id) {
                            return { ...a, application: { ...a.application, status: 'unaccepted' } };
                          }
                          return a;
                        }));
                      }}>Accept</Button>
                      <Button size="sm" variant="destructive" className="transition-colors duration-150 focus:ring-2 focus:ring-red-400" onClick={async () => {
                        await supabase.from('applications').update({ status: 'unaccepted' }).eq('id', selectedConversationApplication.id);
                        setApplicants(prev => prev.map(a =>
                          a.application.id === selectedConversationApplication.id
                            ? { ...a, application: { ...a.application, status: 'unaccepted' } }
                            : a
                        ));
                      }}>Reject</Button>
                    </>
                  )}
        </div>
      )}
            </div>
            <div className="flex-1 overflow-y-auto mb-4 max-h-96 border rounded p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-gray-500">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`mb-2 ${msg.sender_id === profile.id ? 'text-right' : 'text-left'}`}>
                    <span className="inline-block px-3 py-1 rounded bg-blue-200 text-sm">
                      {msg.content}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!messageText}>Send</Button>
            </form>
          </>
        ) : (
          <div className="text-gray-500">Select a {isClient ? 'freelancer' : 'conversation'} to view messages.</div>
        )}
      </div>
      {/* Freelancer Profile Modal/Section (Client only) */}
      {isClient && showProfile && selectedFreelancer && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowProfile(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">Freelancer Profile</h3>
            <div className="mb-2"><strong>Bio:</strong> {selectedFreelancer.bio}</div>
            <div className="mb-2"><strong>Experience Level:</strong> {selectedFreelancer.experience_level || '—'}</div>
            <div className="mb-2"><strong>Hourly Rate:</strong> ${selectedFreelancer.hourly_rate ?? '—'}/hr</div>
            <div className="mb-2"><strong>Completed Projects:</strong> {selectedFreelancer.completed_projects ?? '—'}</div>
            <div className="mb-2"><strong>Rating:</strong> {selectedFreelancer.rating ?? '—'}</div>
            <div className="mb-4"><strong>Portfolio:</strong> {selectedFreelancer.portfolio_url ? <a href={selectedFreelancer.portfolio_url} target="_blank" rel="noopener noreferrer">View</a> : '—'}</div>
            <h4 className="text-lg font-semibold mb-2">Projects</h4>
            {freelancerProjects.length === 0 ? (
              <div className="text-gray-500">No projects found.</div>
            ) : (
              <ul className="space-y-2">
                {freelancerProjects.map(project => (
                  <li key={project.id} className="border rounded p-2">
                    <div className="font-medium">{project.title}</div>
                    <div className="text-xs text-gray-500 mb-1">{project.description}</div>
                    {project.image_url && <img src={project.image_url} alt={project.title} className="w-full max-h-32 object-cover rounded" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
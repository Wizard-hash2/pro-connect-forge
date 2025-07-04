import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/supabase';

// --- Service: Messages ---

// Get all messages
export async function getAllMessages(): Promise<{ data: Message[] | null; error: string | null }> {
  const { data, error } = await supabase.from('messages').select('*');
  return { data, error: error?.message || null };
}

// Get a message by ID
export async function getMessageById(id: string): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase.from('messages').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

// Create a new message
export async function createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase.from('messages').insert([message]).select().single();
  return { data, error: error?.message || null };
}

// Update a message by ID
export async function updateMessage(id: string, updates: Partial<Omit<Message, 'id' | 'created_at'>>): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase.from('messages').update(updates).eq('id', id).select().single();
  return { data, error: error?.message || null };
}

// Delete a message by ID
export async function deleteMessage(id: string): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase.from('messages').delete().eq('id', id).select().single();
  return { data, error: error?.message || null };
}

/*
// --- Example Usage ---

// Get all messages
const { data, error } = await getAllMessages();

// Get a message by ID
const { data, error } = await getMessageById('message-uuid');

// Create a new message
const { data, error } = await createMessage({
  match_id: 'match-uuid',
  sender_id: 'profile-uuid',
  content: 'Hello!',
  is_read: false,
});

// Update a message
const { data, error } = await updateMessage('message-uuid', { is_read: true });

// Delete a message
const { data, error } = await deleteMessage('message-uuid');
*/ 
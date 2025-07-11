import React, { useEffect, useState } from 'react';
import { getAllMessages } from '@/services/messagesService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await getAllMessages();
      setMessages(data || []);
      setFilteredMessages(data || []);
      setError(error);
      setLoading(false);
    };
    fetchMessages();
    setConsoleLogs([
      'Console log example: Notification system initialized.',
      'Console log example: Message fetched successfully.',
    ]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) {
      setFilteredMessages(messages);
      return;
    }
    const q = search.toLowerCase();
    setFilteredMessages(messages.filter(msg =>
      (msg.content && msg.content.toLowerCase().includes(q)) ||
      (msg.sender_id && msg.sender_id.toLowerCase().includes(q))
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">Notifications & Console Logs</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {loading ? (
        <div className="text-center text-blue-600">Loading messages...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No notifications yet.</div>
      ) : (
        <div className="grid gap-6 mb-8">
          {filteredMessages.map(msg => (
            <Card key={msg.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  From: {msg.sender_id}
                  <Badge variant="secondary">Message</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 mb-2">{msg.content}</div>
                <div className="text-gray-500 text-sm">{msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
      <div className="bg-gray-100 rounded p-4 text-sm font-mono text-gray-700">
        {consoleLogs.length === 0 ? (
          <div>No console logs.</div>
        ) : (
          consoleLogs.map((log, idx) => <div key={idx}>{log}</div>)
        )}
      </div>
    </div>
  );
} 
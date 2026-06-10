"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import ChatHistoryModal from '@/components/dashboard/ChatHistoryModal';
import { MessageSquare, Bot, Clock, ExternalLink, Loader2, AlertCircle, Search, RefreshCcw } from 'lucide-react';

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

interface ChatSession {
  session_id: string; // From chat_sessions (SnakeCase) - used to link to messages
  bot_id: string;
  last_interaction_at: string;
  created_at: string;
}

export default function TranscriptsPage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!botId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('bot_id', botId)
        .order('last_interaction_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching chat sessions:', err);
      setError(err.message || 'Failed to load transcripts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (botId) {
      fetchSessions();
    }
  }, [botId]);

  const filteredSessions = sessions.filter(
    (s) =>
      s.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bot_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-finexy-orange" size={24} />
            Chatbot Transcripts
          </h1>
          <p className="text-gray-500 text-sm">Review real-time AI conversations and session history.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSessions}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="p-7 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="text-[17px] font-bold text-gray-900">Recent Sessions</h3>
           
           <div className="relative">
             <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search Session ID or Bot ID..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-finexy-orange focus:border-finexy-orange w-full sm:w-[300px] transition-all font-medium text-gray-700 placeholder:text-gray-400"
             />
           </div>
        </div>

        <div className="overflow-x-auto px-1">
          <table className="w-full text-left text-[13px]">
            <thead className="text-gray-400 font-semibold border-b border-gray-100/80 bg-white">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Session ID</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Bot ID</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Last Interaction</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-500 font-medium">
              {loading && sessions.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Loader2 className="animate-spin text-finexy-orange" size={24} />
                         <span className="text-sm font-semibold">Loading Transcripts...</span>
                      </div>
                   </td>
                </tr>
              ) : error ? (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <AlertCircle size={24} />
                         <span className="text-sm font-semibold">Error: {error}</span>
                      </div>
                   </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <span className="text-sm font-semibold">No sessions found.</span>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.session_id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none group">
                    <td className="px-6 py-4 font-mono text-gray-600 text-[12px]">
                      {session.session_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg text-finexy-orange">
                          <Bot size={14} />
                        </div>
                        <span className="font-semibold text-gray-900">{session.bot_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {formatRelativeTime(new Date(session.last_interaction_at))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-finexy-orange hover:text-white rounded-lg transition-all text-xs font-bold border border-gray-100 shadow-sm"
                        onClick={() => setSelectedSession(session.session_id)}
                      >
                        View Chat
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSession && (
        <ChatHistoryModal 
          sessionId={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
}

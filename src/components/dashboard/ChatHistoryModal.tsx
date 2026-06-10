"use client";

import { useEffect, useState } from 'react';
import { X, Loader2, Bot, User, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

interface Message {
  id: number | string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

interface ChatHistoryModalProps {
  sessionId: string;
  onClose: () => void;
}

export default function ChatHistoryModal({ sessionId, onClose }: ChatHistoryModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch securely from our new Typebot API route
        const response = await fetch(`/api/typebot/transcript?sessionId=${sessionId}`);

        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err: any) {
        console.error('Error fetching chat transcripts:', err);
        setError(err.message || 'Failed to load messages.');
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId]);

  const renderBubble = (msg: Message) => (
    <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] rounded-[24px] p-4 shadow-sm ${
        msg.isAI 
        ? 'bg-white text-gray-800 border border-gray-100' 
        : 'bg-orange-500 text-white shadow-orange-500/10'
      }`}>
        <div className="flex items-center gap-2 mb-2 opacity-60">
          {msg.isAI ? <Bot size={13} strokeWidth={2.5} /> : <User size={13} strokeWidth={2.5} />}
          <span className="text-[9px] font-black uppercase tracking-widest">
            {msg.isAI ? 'AI Assistant' : 'User'}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] w-full max-w-2xl h-[80vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Typebot Transcript</h2>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1 border border-blue-100">
                   <ShieldCheck size={10} strokeWidth={3} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Native API</span>
                </div>
              </div>

              <p className="text-[10px] font-bold text-gray-400 font-mono tracking-tight mt-0.5 opacity-60 italic">{sessionId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-2 bg-[#f8fafc]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 bg-white/50 backdrop-blur-sm rounded-[32px] mx-4 animate-pulse">
              <Loader2 className="animate-spin text-orange-500" size={32} strokeWidth={3} />
              <p className="font-black text-[11px] uppercase tracking-[0.2em] text-gray-900/40">Securing Connection...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-5 text-red-500 bg-red-50/50 rounded-[32px] mx-4 border border-red-100">
              <div className="p-4 bg-white rounded-3xl shadow-sm border border-red-50">
                <AlertCircle size={32} />
              </div>
              <div className="text-center px-8">
                <p className="font-bold text-gray-900">Security Error</p>
                <p className="text-sm mt-1 opacity-70 font-medium">{error}</p>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Close Chat
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-300">
              <div className="p-6 bg-white rounded-[32px] shadow-sm border border-gray-100">
                <Clock size={40} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">No interaction history</p>
                <p className="text-xs font-medium mt-1">This session has no messages yet.</p>
              </div>
            </div>
          ) : (
            <div className="pb-8">
              {messages.map(renderBubble)}
            </div>
          )}
        </div>

        {/* Secure Footer */}
        <div className="px-10 py-5 bg-white border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Direct Typebot Integration</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={11} className="text-emerald-500" strokeWidth={3} />
            <span>Isolated Data Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}

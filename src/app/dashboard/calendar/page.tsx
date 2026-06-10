"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import { Calendar, Link2, Plus, Info, ExternalLink, Loader2, AlertCircle, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface Meeting {
  id: string;
  bot_id: string;
  title: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

export default function CalendarPage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetings() {
      if (!botId) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('bot_id', botId)
          .order('start_time', { ascending: true });

        if (error) {
          // If the table doesn't exist, just show empty state
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
            setMeetings([]);
            return;
          }
          throw error;
        }
        setMeetings(data || []);
      } catch (err: any) {
        console.error("Error fetching meetings:", err);
        // Show empty state for non-critical errors
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    }

    if (botId) {
      fetchMeetings();
    }
  }, [botId]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-finexy-orange" size={24} />
            Upcoming Meetings
          </h1>
          <p className="text-gray-500 text-sm">Manage your AI-booked appointments and calendar sync.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-finexy-orange text-white rounded-xl text-sm font-bold shadow-sm shadow-finexy-orange/30 hover:bg-orange-600 transition-all">
            <Plus size={18} />
            Manual Entry
          </button>
        </div>
      </div>

      {loading || botIdLoading ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <Loader2 className="animate-spin text-finexy-orange mb-4" size={40} />
          <h2 className="text-xl font-bold text-gray-900">Syncing Calendar for {botId || '...'}...</h2>
        </div>
      ) : errorMsg ? (
        <div className="bg-white rounded-[32px] border border-red-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-red-500">
          <AlertCircle className="mb-4 text-red-500" size={40} />
          <h2 className="text-xl font-bold">Error: {errorMsg}</h2>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center mb-6">
            <Calendar className="text-finexy-orange" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Meetings Found</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            Connect your Google Calendar in <span className="font-semibold text-gray-900">Integrations</span> or wait for your AI bot to book your first appointment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/dashboard/integrations"
              className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-[20px] font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
            >
              <Link2 size={18} className="text-finexy-orange" />
              Go to Integrations
            </Link>
            <button className="flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-[20px] font-bold text-sm hover:bg-gray-50 transition-all">
              See Documentation
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[17px] font-bold text-gray-900">{meeting.title}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                  {meeting.status}
                </span>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <Clock size={16} className="text-gray-400" />
                  {new Date(meeting.start_time).toLocaleString()} ({meeting.duration_minutes} min)
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <Users size={16} className="text-gray-400" />
                  {meeting.guest_name} ({meeting.guest_email})
                </div>
              </div>
              <button className="w-full py-2.5 bg-gray-50 hover:bg-finexy-orange hover:text-white rounded-[14px] text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-2 border border-gray-100 hover:border-finexy-orange">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="w-12 h-12 bg-blue-100/50 rounded-xl flex items-center justify-center shrink-0">
          <Info className="text-blue-600" size={24} />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-[15px] font-bold text-gray-900">How it works?</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Once integrated, your AI chatbot will automatically check for availability and book appointments directly into your calendar. Leads will receive a confirmation link via the chat.
          </p>
        </div>
      </div>
    </div>
  );
}

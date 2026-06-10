"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import { Users, Search, SlidersHorizontal, ChevronDown, MoreHorizontal, Bot, Loader2, AlertCircle, Mail, Phone, ArrowUpRight, MessageSquare, X, Calendar, ClipboardList } from 'lucide-react';


interface Lead {
  id: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  notes: string;
  status: string;
  lead_source: string;
  lead_score: string;
  sentiment: string;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New Lead': return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Contacted': return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'Negotiation': return 'bg-purple-50 text-purple-600 border border-purple-100';
    case 'Won': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    default: return 'bg-gray-50 text-gray-600';
  }
};

const getScoreColor = (score: string) => {
  if (score === 'Hot') return 'bg-red-50 text-red-600 border border-red-100';
  if (score === 'Warm') return 'bg-orange-50 text-orange-600 border border-orange-100';
  return 'bg-blue-50 text-blue-600 border border-blue-100';
};

const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'happy': case 'positive': return '😊';
    case 'neutral': return '😐';
    case 'frustrated': case 'negative': return '😠';
    case 'curious': return '🤔';
    default: return '💬';
  }
};

export default function LeadsDatabasePage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);


  const fetchLeads = async () => {
    if (!botId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (botId) {
      fetchLeads();
    }
  }, [botId]);

  const filteredLeads = leads.filter(lead => 
    lead.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.lead_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.lead_phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <Users size={22} className="stroke-[2.5px]" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Leads Database</h1>
            <p className="text-[13px] font-medium text-gray-400 mt-0.5">Manage and track your AI-generated leads</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-[240px] transition-all font-medium text-gray-700 placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-gray-400 font-semibold border-b border-gray-100/80 bg-gray-50/30">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Lead Name</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Email</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Phone</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">Score</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">Sentiment</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Source</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-orange-500" size={32} />
                      <span className="text-base font-bold text-gray-900 tracking-tight">Loading Leads for {botId || '...'}</span>
                    </div>
                  </td>
                </tr>
              ) : botIdLoading ? (
                <tr>
                   <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                     <div className="flex flex-col items-center justify-center gap-3">
                       <Loader2 className="animate-spin text-orange-500" size={32} />
                       <span className="text-base font-bold text-gray-900 tracking-tight">Identifying Session...</span>
                     </div>
                   </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle size={32} />
                      <span className="text-base font-bold tracking-tight">Error: {errorMsg}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users size={40} className="text-gray-200" />
                      <span className="text-base font-bold text-gray-900 tracking-tight">No leads found</span>
                      <p className="text-sm font-medium">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-gray-900 leading-tight">
                        {lead.lead_name || 'Anonymous User'}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 mt-0.5 uppercase tracking-wider">
                        Joined {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="font-medium">{lead.lead_email || 'No Email'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-medium">{lead.lead_phone || 'No Phone'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-bold shadow-sm ${getScoreColor(lead.lead_score || 'Cold')}`}>
                      {lead.lead_score || 'Cold'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-2xl" title={lead.sentiment}>
                      {getSentimentEmoji(lead.sentiment)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(lead.status)}`}>
                      {lead.status || 'New Lead'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-semibold text-gray-600">
                      {lead.lead_source === 'AI Agent' ? (
                        <>
                          <Bot size={16} className="text-orange-500" />
                          <span>AI Chat</span>
                        </>
                      ) : (
                        <span>Manual</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          console.log('[Leads Page] Chat Summary Clicked for:', lead.lead_name);
                          setSelectedLead(lead);
                          setIsSummaryModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                        title="View Summary"
                      >
                        <MessageSquare size={18} />
                      </button>

                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isSummaryModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Lead Summary</h2>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Session Details</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">{selectedLead.lead_name || 'Anonymous User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreColor(selectedLead.lead_score)}`}>
                      {selectedLead.lead_score} Lead
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(selectedLead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-3xl">{getSentimentEmoji(selectedLead.sentiment)}</div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Conversation Notes</label>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium italic whitespace-pre-wrap">
                    {selectedLead.notes || "No detailed summary available for this interaction."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Status</span>
                  <span className="text-sm font-bold text-blue-700">{selectedLead.status}</span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Source</span>
                  <span className="text-sm font-bold text-emerald-700">{selectedLead.lead_source}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all active:scale-95"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


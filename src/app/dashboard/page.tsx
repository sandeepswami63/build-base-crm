"use client";

import { Calendar, ChevronDown, Users, Zap, Bot, TrendingUp, Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, MoreHorizontal, MessageSquare, Loader2, AlertCircle, ClipboardList, X } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';

// Static components for charts stay the same, but we will use state for data.

export interface Lead {
  id: string;
  bot_id: string;
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

export default function DashboardPage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [revenueData, setRevenueData] = useState<{name: string, value: number}[]>([]);
  const [botPerformanceData, setBotPerformanceData] = useState<{name: string, conversations: number, qualified: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);


  useEffect(() => {
    async function fetchData() {
      if (!botId) return;
      
      try {
        setLoading(true);
        setErrorMsg(null);
        
        // --- 1. Fetch Real KPI Counts ---
        
        // Fetch Leads (Scoping to bot_id)
        try {
          const { data: leadsData, error: leadsError, count: leadsCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .eq('bot_id', botId)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!leadsError && leadsData) {
            setLeads(leadsData);
            setTotalLeads(leadsCount || 0);
          }
        } catch (e) {
          console.warn('Could not fetch leads:', e);
        }

        // Fetch Chat Sessions Count
        try {
          const { count: chatCount, error: chatError } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', botId);
          
          if (!chatError) {
            setTotalChats(chatCount || 0);
          }
        } catch (e) {
          console.warn('Could not fetch chat sessions:', e);
        }

        // --- 2. Fetch Leads Acquisition (Last 7 Days) ---
        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: chartLeads, error: chartError } = await supabase
            .from('leads')
            .select('created_at')
            .eq('bot_id', botId)
            .gte('created_at', sevenDaysAgo.toISOString());

          if (!chartError && chartLeads) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const counts: Record<string, number> = {};
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              counts[dayNames[d.getDay()]] = 0;
            }
            
            chartLeads.forEach(l => {
              const d = new Date(l.created_at);
              const name = dayNames[d.getDay()];
              if (counts[name] !== undefined) counts[name]++;
            });

            setRevenueData(Object.entries(counts).map(([name, value]) => ({ name, value })));
          }
        } catch (e) {
          console.warn('Could not fetch chart leads:', e);
        }

        // --- 3. Fetch AI Bot Performance (Last 6 Months) ---
        try {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          const [{ data: monthSessions }, { data: monthLeads }] = await Promise.all([
             supabase.from('chat_sessions').select('created_at').eq('bot_id', botId).gte('created_at', sixMonthsAgo.toISOString()),
             supabase.from('leads').select('created_at').eq('bot_id', botId).gte('created_at', sixMonthsAgo.toISOString()),
          ]);

          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const perf: Record<string, {name: string, conversations: number, qualified: number}> = {};
          
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const name = monthNames[d.getMonth()];
            perf[name] = { name, conversations: 0, qualified: 0 };
          }

          monthSessions?.forEach(s => {
            const name = monthNames[new Date(s.created_at).getMonth()];
            if (perf[name]) perf[name].conversations++;
          });

          monthLeads?.forEach(l => {
            const name = monthNames[new Date(l.created_at).getMonth()];
            if (perf[name]) perf[name].qualified++;
          });

          setBotPerformanceData(Object.values(perf));
        } catch (e) {
          console.warn('Could not fetch performance data:', e);
        }

      } catch (err: any) {
         console.error("Unexpected error:", err);
         setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    if (botId) {
      fetchData();
    }
  }, [botId]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Sales Overview</h1>
        <button className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <Calendar size={18} className="text-gray-500" />
          <span>Real-time Data</span>
          <ChevronDown size={16} className="text-gray-400 ml-1" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Leads */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[13px] font-semibold text-gray-400">Total Leads Generated</h3>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-finexy-orange/10 group-hover:text-finexy-orange transition-colors">
              <Users size={20} className="stroke-[2px]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px] font-bold text-gray-900 tracking-tight">{totalLeads.toLocaleString()}</span>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400">Fetched from `leads` table</p>
        </div>

        {/* Chatbot Interactions */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[13px] font-semibold text-gray-400">Total Chat Interactions</h3>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-finexy-orange/10 group-hover:text-finexy-orange transition-colors">
              <Bot size={20} className="stroke-[2px]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px] font-bold text-gray-900 tracking-tight">{totalChats.toLocaleString()}</span>
            <span className="flex items-center text-[11px] font-bold text-finexy-orange bg-finexy-orangeLight px-1.5 py-0.5 rounded-full border border-finexy-orange/10">
              Live
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400">Fetched from `chat_sessions` table</p>
        </div>

        {/* Chatbot Conversion Rate */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[13px] font-semibold text-gray-400">Qualified Lead Rate</h3>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-finexy-orange/10 group-hover:text-finexy-orange transition-colors">
              <TrendingUp size={20} className="stroke-[2px]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px] font-bold text-gray-900 tracking-tight">
              {totalChats > 0 ? ((totalLeads / totalChats) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <p className="text-[12px] font-medium text-gray-400">Ratio of Leads to Chats</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Leads Analytics */}
        <div className="bg-white rounded-[20px] p-7 shadow-sm border border-gray-100/50 lg:col-span-2">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-[17px] font-bold text-gray-900">Leads Acquisition</h3>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-[10px] text-xs font-bold text-gray-600 hover:bg-gray-50">
                This Week <ChevronDown size={14} className="text-gray-400" />
             </button>
           </div>
           
           <div className="h-[260px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueData} barSize={34} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} />
                 <Tooltip 
                   cursor={{fill: 'transparent'}}
                   content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       return (
                         <div className="bg-finexy-orange text-white text-xs font-bold px-3 py-1.5 rounded-[6px] shadow-lg relative -top-3">
                           {payload[0].value} Leads
                           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[4px] border-t-finexy-orange border-transparent"></div>
                         </div>
                       );
                     }
                     return null;
                   }}
                 />
                 <Bar dataKey="value" fill="#f95932" radius={[12, 12, 12, 12]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* AI Chatbot Performance (New Chart) */}
        <div className="bg-white rounded-[20px] p-7 shadow-sm border border-gray-100/50 flex flex-col">
           <div className="mb-3">
             <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
                <Bot size={18} className="text-finexy-orange" />
                AI Bot Performance
             </h3>
             <p className="text-[12px] font-medium text-gray-400 mt-1.5">Conversations vs Qualified Leads</p>
           </div>
           
           <div className="flex justify-between items-end mb-6">
             <span className="text-[11px] font-extrabold text-gray-800 tracking-wide">YTD Summary</span>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-400 tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-finexy-orange"></span> Qualified
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-400 tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gray-200"></span> Total
                </div>
             </div>
           </div>

           <div className="h-[210px] w-full flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={botPerformanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f95932" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f95932" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => val === 0 ? '0' : `${val/1000}k`} />
                 <Tooltip cursor={{fill: '#f8fafc'}} />
                 <Area type="monotone" dataKey="conversations" stroke="#e2e8f0" strokeWidth={2} fill="transparent" />
                 <Area type="monotone" dataKey="qualified" stroke="#f95932" strokeWidth={3} fillOpacity={1} fill="url(#colorQualified)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Contacts / Leads Table */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="p-7 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="text-[17px] font-bold text-gray-900">Lead Database</h3>
           
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search contacts..." 
                 className="pl-10 pr-4 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-finexy-orange focus:border-finexy-orange w-[220px] transition-all font-medium text-gray-700 placeholder:text-gray-400"
               />
             </div>
             <button className="flex items-center gap-2.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
               <SlidersHorizontal size={14} className="text-gray-400" /> Filter <ChevronDown size={14} className="text-gray-400" />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto px-1">
          <table className="w-full text-left text-[13px]">
            <thead className="text-gray-400 font-semibold border-b border-gray-100/80 bg-white">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded-sm text-finexy-orange focus:ring-finexy-orange border-gray-300 w-4 h-4 cursor-pointer" />
                </th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Name</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Phone</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Email</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Lead Source</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Score</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Sentiment</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">Chat Summary</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-500 font-medium">
              {loading ? (
                <tr>
                   <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Loader2 className="animate-spin text-finexy-orange" size={24} />
                         <span className="text-sm font-semibold">Loading Leads...</span>
                      </div>
                   </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                   <td colSpan={8} className="px-4 py-12 text-center text-red-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <AlertCircle size={24} />
                         <span className="text-sm font-semibold">Error: {errorMsg}</span>
                      </div>
                   </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <span className="text-sm font-semibold">No leads found or Supabase connection missing.</span>
                      </div>
                   </td>
                </tr>
              ) : leads
                .filter((lead: Lead) => 
                  (lead.lead_name && lead.lead_name.trim() !== '') || 
                  (lead.lead_phone && lead.lead_phone.trim() !== '') || 
                  (lead.lead_email && lead.lead_email.trim() !== '')
                )
                .map((lead, i) => (
                <tr key={lead.id || i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none group">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded-sm text-finexy-orange focus:ring-finexy-orange border-gray-300 w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-4 py-4 text-gray-900 font-semibold whitespace-nowrap">
                    {lead.lead_name?.trim() !== '' ? lead.lead_name : <span className="text-gray-400 italic">No Name</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">{lead.lead_phone || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">{lead.lead_email || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                       {lead.lead_source === 'AI Agent' ? <Bot size={14} className="text-finexy-orange" /> : null}
                       <span>{lead.lead_source || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${getScoreColor(lead.lead_score || 'Cold')}`}>
                      {lead.lead_score || 'Cold'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-lg">
                    <span title={lead.sentiment}>{getSentimentEmoji(lead.sentiment || 'neutral')}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td 
                    className="px-4 py-4 text-gray-500 truncate max-w-[200px]" 
                    title={lead.notes}
                  >
                    {lead.notes ? lead.notes : <span className="text-gray-400 italic">No summary</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsSummaryModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors mr-1 opacity-0 group-hover:opacity-100" 
                      title="View Summary"
                    >
                       <MessageSquare size={16} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                       <MoreHorizontal size={16} />
                    </button>
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


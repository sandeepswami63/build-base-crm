"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import { Workflow, Zap, MessageSquare, Target, Mail, ArrowRight, Play, MoreVertical, Loader2, AlertCircle } from 'lucide-react';

interface Campaign {
  id: string;
  bot_id: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  status: string;
  triggers: string;
  backend: string;
  created_at: string;
}

// Helper to map string icon names to Lucide components if needed in future, 
// but for now we can just use a default icon if not found, or map specific ones.
const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'messagesquare': return MessageSquare;
    case 'target': return Target;
    case 'mail': return Mail;
    default: return Workflow;
  }
};

export default function AutomationPage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      if (!botId) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('bot_id', botId)
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
            setCampaigns([]);
            return;
          }
          throw error;
        }
        setCampaigns(data || []);
      } catch (err: any) {
        console.error("Error fetching campaigns:", err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    if (botId) {
      fetchCampaigns();
    }
  }, [botId]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="space-y-1">
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Workflow className="text-finexy-orange" size={24} />
            Automation Campaigns
          </h1>
          <p className="text-gray-500 text-sm">Automate your sales pipeline with n8n powered workflows.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Play size={16} className="text-emerald-500" />
            Check n8n Status
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Campaigns</p>
            <p className="text-xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Workflow size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Workflows</p>
            <p className="text-xl font-bold text-gray-900">{campaigns.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-2xl text-finexy-orange">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Success Rate</p>
            <p className="text-xl font-bold text-gray-900">{campaigns.length > 0 ? '99.2%' : '—'}</p>
          </div>
        </div>
      </div>

      {/* Campaign Cards */}
      {loading || botIdLoading ? (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center text-gray-400 flex flex-col items-center">
          <Loader2 className="animate-spin text-finexy-orange mb-4" size={40} />
          <h2 className="text-xl font-bold text-gray-900">Loading Automation for {botId || '...'}...</h2>
        </div>
      ) : errorMsg ? (
        <div className="bg-white rounded-[24px] border border-red-100 shadow-sm p-12 text-center text-red-500 flex flex-col items-center">
          <AlertCircle className="mb-4 text-red-500" size={40} />
          <h2 className="text-xl font-bold">Error: {errorMsg}</h2>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center mb-6">
            <Workflow className="text-finexy-orange" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Campaigns Found</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Create your first automation workflow in n8n and sync it to appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const Icon = getIconComponent(camp.icon);
            return (
              <div key={camp.id} className="bg-white group rounded-[32px] border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:shadow-orange-500/5 transition-all relative overflow-hidden flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 ${camp.icon_bg || 'bg-gray-50'} rounded-[22px] ${camp.icon_color || 'text-gray-600'}`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {camp.status === 'Active' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
                      {camp.status || 'Draft'}
                    </span>
                    <button className="p-1 text-gray-300 hover:text-gray-900">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{camp.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
                  {camp.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-gray-50 font-medium">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-400">Trigger</span>
                    <span className="text-gray-700">{camp.triggers || 'Webhook'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-400">Backend</span>
                    <span className="text-blue-500 font-bold flex items-center gap-1">
                      <Zap size={10} />
                      {camp.backend || 'n8n Workflow'}
                    </span>
                  </div>
                </div>

                <button className="mt-8 w-full py-4 bg-gray-50 hover:bg-finexy-orange hover:text-white rounded-[18px] text-[13px] font-bold text-gray-700 transition-all flex items-center justify-center gap-2 group/btn">
                  Explore Analytics
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import { 
  Save, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Link2,
  Loader2
} from 'lucide-react';

export default function IntegrationsPage() {
  const { botId, loading: botIdLoading } = useBotId();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [formData, setFormData] = useState({
    google_calendar_id: '',
    brevo_api_key: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
  });

  useEffect(() => {
    async function fetchIntegrationSettings() {
      if (!botId) return;
      try {
        // Try fetching integration-specific columns first
        const { data, error } = await supabase
          .from('businesses')
          .select('google_calendar_id, brevo_api_key, razorpay_key_id, razorpay_key_secret')
          .eq('bot_id', botId)
          .single();

        if (error) {
          // If columns don't exist (42703 = undefined column), skip silently
          if (error.code === '42703' || error.message?.includes('column') || error.code === 'PGRST116') {
            console.warn('Integration columns may not exist yet. Please run the migration SQL.');
          } else {
            console.error('Error fetching integrations:', error);
          }
        }
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            google_calendar_id: data.google_calendar_id || '',
            brevo_api_key: data.brevo_api_key || '',
            razorpay_key_id: data.razorpay_key_id || '',
            razorpay_key_secret: data.razorpay_key_secret || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      } finally {
        setIsFetching(false);
      }
    }

    if (botId) {
      fetchIntegrationSettings();
    }
  }, [botId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('businesses')
        .update({
          google_calendar_id: formData.google_calendar_id,
          brevo_api_key: formData.brevo_api_key,
          razorpay_key_id: formData.razorpay_key_id,
          razorpay_key_secret: formData.razorpay_key_secret,
          updated_at: new Date().toISOString()
        })
        .eq('bot_id', botId);

      if (error) throw error;
      
      setNotification({
        type: 'success',
        message: 'Integration keys saved successfully!'
      });
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error saving integrations:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to save integrations. Please ensure the businesses table exists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || botIdLoading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-finexy-orange" size={32} />
          <p className="text-sm font-bold text-gray-500">Loading Integrations Selection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Link2 className="text-finexy-orange" size={28} />
            Channel Integrations
          </h1>
          <p className="text-gray-500 mt-1">Connect your calendar and email marketing tools.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-finexy-orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save size={18} />
          )}
          {isLoading ? 'Saving...' : 'Save Keys'}
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          notification.type === 'success' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} className="mt-0.5" />
          ) : (
            <AlertCircle size={20} className="mt-0.5" />
          )}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">

        {/* Google Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Google Calendar</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Calendar ID (Email)</label>
            <input 
              type="text"
              name="google_calendar_id"
              value={formData.google_calendar_id}
              onChange={handleChange}
              placeholder="your-email@gmail.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finexy-orange focus:ring-1 focus:ring-finexy-orange transition-all"
            />
            <p className="text-xs text-gray-500">The email address associated with the primary calendar for bookings.</p>
          </div>
        </div>

        {/* Brevo Email */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="text-purple-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Brevo (Sendinblue)</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>API Key</span>
                <ShieldCheck size={14} className="text-emerald-500" />
              </label>
              <input 
                type="password"
                name="brevo_api_key"
                value={formData.brevo_api_key}
                onChange={handleChange}
                placeholder="xkeysib-..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finexy-orange focus:ring-1 focus:ring-finexy-orange transition-all"
              />
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
              <Zap className="text-finexy-orange shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                Ensure your Brevo API key has permission to send transactional emails. This will be used for AI agent lead notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Razorpay Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Zap className="text-finexy-orange" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Razorpay Payment Gateway</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Key ID</label>
              <input 
                type="text"
                name="razorpay_key_id"
                value={formData.razorpay_key_id}
                onChange={handleChange}
                placeholder="rzp_test_..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finexy-orange focus:ring-1 focus:ring-finexy-orange transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Key Secret</label>
              <input 
                type="password"
                name="razorpay_key_secret"
                value={formData.razorpay_key_secret}
                onChange={handleChange}
                placeholder="••••••••••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finexy-orange focus:ring-1 focus:ring-finexy-orange transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Enable customers to pay directly to your account. This is a multi-tenant setup.</p>
        </div>

      </div>
    </div>
  );
}

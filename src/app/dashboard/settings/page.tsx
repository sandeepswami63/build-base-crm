'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Save,  
  Bot, 
  MessageSquare, 
  Settings2, 
  PhoneCall, 
  Wand2, 
  Building2,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Zap,
  Share2,
  Code2,
  Check,
  Upload,
  Globe,
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [formData, setFormData] = useState({
    bot_id: 'demo-bot', // Initial default, will be fetched or set by user
    business_name: '',
    logo_url: '',
    ai_persona: '',
    business_email: '',
    owner_phone: '',
    lead_notification_type: 'email',
    contact_info: '',
    core_services: '',
    business_rules: '',
    tone_style: '',
    api_webhook_url: '',
    api_auth_header: '',
  });

  const [initialData, setInitialData] = useState<typeof formData | null>(null);

  const [copyStatus, setCopyStatus] = useState<{link: boolean, snippet: boolean}>({
    link: false,
    snippet: false
  });

  const personaOptions = [
    { value: '', label: 'Select a persona title...' },
    { value: 'Lead Receptionist', label: 'Lead Receptionist' },
    { value: 'Customer Success Manager', label: 'Customer Success Manager' },
    { value: 'Virtual Assistant', label: 'Virtual Assistant' },
    { value: 'Sales Consultant', label: 'Sales Consultant' },
    { value: 'Support Specialist', label: 'Support Specialist' },
    { value: 'Booking Coordinator', label: 'Booking Coordinator' }
  ];

  const toneOptions = [
    { value: '', label: 'Select a tone style...' },
    { value: 'Professional and Corporate', label: 'Professional and Corporate' },
    { value: 'Friendly and Casual (with emojis)', label: 'Friendly and Casual (with emojis)' },
    { value: 'Direct and Sales-Oriented', label: 'Direct and Sales-Oriented' },
    { value: 'Empathetic and Helpful', label: 'Empathetic and Helpful' },
    { value: 'Playful and Humorous', label: 'Playful and Humorous' },
    { value: 'Strict and Authoritative', label: 'Strict and Authoritative' },
    { value: 'Hinglish (Natural Indian Chat)', label: 'Hinglish (Natural Indian Chat)' }
  ];

  const notificationOptions = [
    { value: 'email', label: 'Email Only' },
    { value: 'whatsapp', label: 'WhatsApp Only' },
    { value: 'both', label: 'Both Email & WhatsApp' }
  ];

  // Fetch existing settings on load based on user_id
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          setIsFetching(false);
          return;
        }

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        if (data) {
          const fetchedData = {
            bot_id: data.bot_id || 'demo-bot',
            business_name: data.business_name || '',
            logo_url: data.logo_url || '',
            ai_persona: data.ai_persona || '',
            business_email: data.business_email || '',
            owner_phone: data.owner_phone || '',
            lead_notification_type: data.lead_notification_type || 'email',
            contact_info: data.contact_info || '',
            core_services: data.core_services || '',
            business_rules: data.business_rules || '',
            tone_style: data.tone_style || '',
            api_webhook_url: data.api_webhook_url || '',
            api_auth_header: data.api_auth_header || '',
          };
          setFormData(fetchedData);
          setInitialData(fetchedData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsFetching(false);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) throw new Error('No active user session');

      let payload: any = { updated_at: new Date().toISOString() };
      let error = null;

      if (initialData) {
        // Collect only modified fields
        Object.keys(formData).forEach((key) => {
          const formKey = key as keyof typeof formData;
          if (formData[formKey] !== initialData[formKey]) {
            payload[formKey] = formData[formKey];
          }
        });
        
        // If nothing changed but the updated_at timestamp, skip DB update
        if (Object.keys(payload).length === 1) {
          setNotification({ type: 'success', message: 'No changes detected.' });
          setIsLoading(false);
          return;
        }

        const response = await supabase
          .from('businesses')
          .update(payload)
          .eq('user_id', session.user.id)
          .select()
          .single();
        error = response.error;
      } else {
        // Initial insert
        payload = {
          ...formData,
          user_id: session.user.id,
          updated_at: new Date().toISOString()
        };
        const response = await supabase
          .from('businesses')
          .insert(payload)
          .select()
          .single();
        error = response.error;
      }

      if (error) throw error;
      
      setInitialData(formData);
      
      setNotification({
        type: 'success',
        message: 'Settings saved successfully! Your AI agent brain is updated.'
      });
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to save settings. Please ensure database table is created.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'link' | 'snippet') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [type]: false })), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const directChatLink = `https://bot.buildbasedigitally.com/master-bot?bot_id=${formData.bot_id}`;
  const widgetSnippet = `<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.2/dist/web.js';

  Typebot.initBubble({
    typebot: "dashboard-dyhdekw",
    apiHost: "https://bot.buildbasedigitally.com",
    theme: {
      button: { 
        backgroundColor: "#1D1D1D",
        ${formData.logo_url ? `customIconSrc: "${formData.logo_url}",` : ''}
      },
      chatWindow: { backgroundColor: "#F8F8F8" },
    },
    prefilledVariables: {
      "bot_id": "${formData.bot_id}",
    },
  });
</script>`;

  if (isFetching) {
    return (
      <div className="flex-1 w-full bg-[#0a0a0c] flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#f95932] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading AI Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#0a0a0c] text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-[#f95932]/10 rounded-2xl">
                <Settings2 className="text-[#f95932]" size={32} />
              </div>
              AI Agent Settings
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Configure your chatbot's intelligence, personality, and integrations.</p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="group flex items-center justify-center gap-3 bg-[#f95932] hover:bg-[#ff6a47] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-[0_8px_30px_rgb(249,89,50,0.3)] hover:shadow-[0_8px_30px_rgb(249,89,50,0.5)] active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={20} className="group-hover:scale-110 transition-transform" />
            )}
            {isLoading ? 'Saving Brain...' : 'Save Changes'}
          </button>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={cn(
            "p-4 rounded-2xl flex items-start gap-3 border backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300",
            notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="shrink-0" size={20} />
            ) : (
              <AlertCircle className="shrink-0" size={20} />
            )}
            <p className="font-semibold text-sm">{notification.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Core Settings */}
          <div className="lg:col-span-12 space-y-10">
            
            {/* Section 1: Business Identity */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-3 mb-2">
                 <Building2 className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">Business Identity</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {/* Logo Upload */}
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Logo Upload</label>
                    <div 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="relative group w-32 h-32 rounded-[24px] bg-[#1a1a1e] border-2 border-dashed border-white/10 hover:border-[#f95932]/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                    >
                      <input 
                        id="logo-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if(e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            // For local preview, using FileReader or createObjectURL
                            // In real production, upload to Supabase Storage and get the public URL
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-500 group-hover:text-[#f95932] transition-colors" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Upload</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white">Change</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Or Paste Link</label>
                      <input 
                        type="text"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-[#1a1a1e] border border-white/5 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-[#f95932] transition-all"
                      />
                    </div>
                 </div>

                 <div className="space-y-6 lg:col-span-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          Bot ID <Zap size={14} className="text-[#f95932]" />
                        </label>
                        <input 
                          type="text"
                          name="bot_id"
                          value={formData.bot_id}
                          onChange={handleChange}
                          placeholder="e.g. unique-saas-key"
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] focus:ring-1 focus:ring-[#f95932] transition-all font-mono text-[#f95932] font-bold"
                        />
                        <p className="text-[10px] text-gray-500 font-medium italic">Required identifier for integrations.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Name</label>
                        <input 
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          placeholder="e.g. Global Tech Solutions"
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] focus:ring-1 focus:ring-[#f95932] transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Agent Persona Title</label>
                        <select 
                          name="ai_persona"
                          value={formData.ai_persona}
                          onChange={handleSelectChange}
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all appearance-none cursor-pointer"
                        >
                          {personaOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#121215]">{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sender Email (Brevo)</label>
                        <input 
                          type="email"
                          name="business_email"
                          value={formData.business_email}
                          onChange={handleChange}
                          placeholder="e.g. notifications@saas.com"
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Owner Phone</label>
                        <input 
                          type="text"
                          name="owner_phone"
                          value={formData.owner_phone}
                          onChange={handleChange}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Lead Notification</label>
                        <select 
                          name="lead_notification_type"
                          value={formData.lead_notification_type}
                          onChange={handleSelectChange}
                          className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all appearance-none cursor-pointer"
                        >
                          {notificationOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-[#121215]">{opt.label}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                 <PhoneCall className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">Contact Information</h2>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Human Handover / Visit Info</label>
                <textarea 
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Visit us at 4th Bloom St, or call +1 555-0199 for urgent support."
                  className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all leading-relaxed placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Section 3: AI Knowledge Base */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                 <Bot className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">AI Knowledge Base</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Core Services & Pricing</label>
                  <textarea 
                    name="core_services"
                    value={formData.core_services}
                    onChange={handleChange}
                    rows={6}
                    placeholder="- Basic Plan: $29/mo&#10;- Pro Plan: $99/mo&#10;- Enterprise: Custom"
                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all leading-relaxed h-[200px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                    Strict Business Rules
                    <span className="text-[10px] text-[#f95932] bg-[#f95932]/10 px-2 py-0.5 rounded-full">Guarded</span>
                  </label>
                  <textarea 
                    name="business_rules"
                    value={formData.business_rules}
                    onChange={handleChange}
                    rows={6}
                    placeholder="1. Never offer discounts.&#10;2. Always redirect refund queries to manager.&#10;3. Use polite professional tone."
                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all leading-relaxed h-[200px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Personality & Tone */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                 <Wand2 className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">Personality & Tone</h2>
              </div>
              <div className="max-w-md space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tone of Voice</label>
                <select 
                  name="tone_style"
                  value={formData.tone_style}
                  onChange={handleSelectChange}
                  className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all appearance-none cursor-pointer"
                >
                  {toneOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#121215]">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 5: Advanced Tool Connectivity */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl">
               <div className="flex items-center gap-3 mb-2">
                 <Globe className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">Advanced Tool Connectivity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">API Webhook URL (Dynamic Tool)</label>
                  <input 
                    type="text"
                    name="api_webhook_url"
                    value={formData.api_webhook_url}
                    onChange={handleChange}
                    placeholder="https://n8n.your-domain.com/webhook/..."
                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">API Auth Header (Optional)</label>
                  <input 
                    type="text"
                    name="api_auth_header"
                    value={formData.api_auth_header}
                    onChange={handleChange}
                    placeholder="Bearer your-secret-token"
                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-[#f95932] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: RAG Knowledge Base (AI Brain) */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl group border-dashed border-white/10 hover:border-[#f95932]/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <MessageSquare size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold">RAG Knowledge Base (AI Brain)</h2>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full uppercase">Experimental</span>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-white/[0.02] rounded-[24px] border border-white/5">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-bold">Train your AI with custom data</h3>
                  <p className="text-gray-500 text-sm max-w-md">Upload PDFs, Docs, or raw text to create a custom vector-brain for hyper-accurate responses.</p>
                </div>
                <button 
                  disabled
                  className="px-8 py-3.5 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center gap-2"
                >
                  <Settings size={18} />
                  Manage Knowledge Base
                </button>
              </div>
            </div>

            {/* Section 7: Integration & Sharing */}
            <div className="bg-[#121215] border border-white/5 rounded-[32px] p-8 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 translate-x-12 -translate-y-12 bg-[#f95932]/10 blur-[100px] rounded-full"></div>
              
              <div className="flex items-center gap-3">
                 <Share2 className="text-[#f95932]" size={24} />
                 <h2 className="text-xl font-bold">Integration & Sharing</h2>
              </div>

              <div className="space-y-10">
                {/* Direct Chat Link */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <ExternalLink size={16} className="text-blue-400" />
                       Direct Chat Link
                    </h3>
                    {copyStatus.link && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1 animate-in zoom-in-50">
                        <Check size={10} /> Copied
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      readOnly
                      type="text"
                      value={directChatLink}
                      className="flex-1 bg-[#1a1a1e] border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-mono text-gray-400 focus:outline-none"
                    />
                    <button 
                      onClick={() => handleCopy(directChatLink, 'link')}
                      className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-white active:scale-90"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                {/* Website Widget Snippet */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Code2 size={16} className="text-emerald-400" />
                       Website Widget Snippet
                    </h3>
                  </div>
                  <div className="relative">
                    <pre className="w-full bg-[#050507] rounded-3xl p-6 text-[11px] font-mono text-emerald-500/80 overflow-x-auto shadow-inner leading-relaxed border border-white/5">
                      {widgetSnippet}
                    </pre>
                    <button 
                      onClick={() => handleCopy(widgetSnippet, 'snippet')}
                      className="absolute top-4 right-4 flex items-center gap-2 bg-[#f95932] hover:bg-[#ff6a47] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-90"
                    >
                      {copyStatus.snippet ? <Check size={14} /> : <Copy size={14} />}
                      {copyStatus.snippet ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium italic pl-1">
                    Include this script in your website's <code className="text-[#f95932]">&lt;body&gt;</code> to activate the AI bubble.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Save Button (Floating style but at end) */}
        <div className="flex items-center justify-center pt-10">
           <button 
             onClick={handleSave}
             disabled={isLoading}
             className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] text-white px-10 py-5 rounded-[24px] font-bold transition-all border border-white/10 group active:scale-95 disabled:opacity-50"
           >
             {isLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="text-[#f95932] group-hover:scale-125 transition-transform" />}
             Save All Configuration
           </button>
        </div>

      </div>
    </div>
  );
}

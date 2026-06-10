-- Create contacts table
CREATE TABLE public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT NOT NULL, -- Link to business
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'New Lead',
    lead_source TEXT DEFAULT 'Manual Entry',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
-- Allow public read access to contacts (adjust according to your auth setup later)
CREATE POLICY "Enable read access for all users" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.contacts FOR DELETE USING (true);

-- Create interactions table (e.g., chatbot transcripts)
CREATE TABLE public.interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'bot', 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for interactions
CREATE POLICY "Enable read access for all users" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.interactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.interactions FOR DELETE USING (true);

-- Insert some dummy data for initial testing
INSERT INTO public.contacts (name, phone, email, status, lead_source) VALUES
('Oliver John Brown', '+1 (555) 123-4567', 'oliver.b@example.com', 'New Lead', 'Typebot AI'),
('Noah James Smith', '+1 (555) 987-6543', 'noah.smith@example.com', 'Contacted', 'Manual Entry'),
('Emma Watson', '+1 (555) 456-7890', 'emma.w@example.com', 'Negotiation', 'Typebot AI'),
('James Wilson', '+1 (555) 222-3333', 'j.wilson@example.com', 'Won', 'Website Form');

-- ==========================================
-- NEW SETTINGS ADDED: Businesses / Bot Profiles
-- ==========================================

-- Create businesses table for the AI settings dashboard
CREATE TABLE public.businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT UNIQUE NOT NULL, -- e.g. 'client-123'
    business_name TEXT,
    business_email TEXT, -- Sender Email
    ai_persona TEXT,
    core_services TEXT,
    business_rules TEXT,
    contact_info TEXT,
    tone_style TEXT,
    logo_url TEXT,
    api_webhook_url TEXT, -- For Dynamic HTTP Tool
    api_auth_header TEXT, -- Optional Auth for HTTP Tool
    owner_phone TEXT, -- For lead notifications via WhatsApp
    notification_type TEXT DEFAULT 'email', -- 'email' or 'whatsapp' or 'both'
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Advanced: Knowledge Base (RAG) Support
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT NOT NULL REFERENCES public.businesses(bot_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- For OpenAI/Gemini Embeddings
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat_sessions table for n8n tracking
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    bot_id TEXT NOT NULL,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT NOT NULL,
    lead_name TEXT,
    lead_email TEXT,
    lead_phone TEXT,
    lead_score TEXT DEFAULT 'Cold', -- 'Cold', 'Warm', 'Hot'
    sentiment TEXT DEFAULT 'Neutral',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for businesses
CREATE POLICY "Enable read access for all users" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.businesses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.businesses FOR DELETE USING (true);

-- Insert a dummy business to test the settings page UI out of the box
INSERT INTO public.businesses (bot_id, business_name, ai_persona, core_services, business_rules, contact_info, tone_style) VALUES
('demo-bot', 'Base CRM Demo', 'Helpful Assistant', '- Basic Package: $99/mo\n- Pro Package: $199/mo', '1. Never offer discounts.\n2. Always collect a phone number.', 'support@basecrm.com | 1-800-555-0199', 'Professional and concise');


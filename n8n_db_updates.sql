-- Create 'leads' table (Matches n8n Agent tool requirements)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id TEXT,
    lead_name TEXT,
    lead_email TEXT,
    lead_phone TEXT,
    notes TEXT,
    status TEXT DEFAULT 'New Lead',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for all users" ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- Create 'chat_sessions' table (For the 30-minute inactivity logic)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    session_id TEXT PRIMARY KEY,
    bot_id TEXT,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for all users" ON public.chat_sessions FOR ALL USING (true) WITH CHECK (true);

-- Add a column to contacts if it doesn't have notes (for dashboard consistency)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='notes') THEN
        ALTER TABLE public.contacts ADD COLUMN notes TEXT;
    END IF;
END $$;

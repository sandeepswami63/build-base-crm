import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useBotId() {
  const [botId, setBotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBotId() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('businesses')
            .select('bot_id')
            .eq('user_id', session.user.id)
            .single();

          if (error) {
             console.error('Error fetching bot_id from businesses:', error);
             // Default to demo-bot if failed
             setBotId('demo-bot');
          } else if (data) {
            setBotId(data.bot_id);
          }
        } else {
           // No session, maybe check if we're in demo mode or something
           setBotId('demo-bot');
        }
      } catch (err) {
        console.error('Error in useBotId:', err);
        setBotId('demo-bot');
      } finally {
        setLoading(false);
      }
    }

    getBotId();
  }, []);

  return { botId, loading };
}

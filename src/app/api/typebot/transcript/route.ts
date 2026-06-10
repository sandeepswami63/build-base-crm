import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // 1. Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[Transcript API] Auth Error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Identify the business to ensure owner security
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('bot_id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      console.error('[Transcript API] Business Fetch Error:', businessError)
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    // 3. System Override: Use Master Bot ID for API calls (bb-001 is for internal routing only)
    const typebotUrl = (process.env.TYPEBOT_URL || 'https://typebot.io').replace(/\/$/, '')
    const apiToken = process.env.TYPEBOT_API_TOKEN
    const nativeBotId = process.env.TYPEBOT_NATIVE_BOT_ID // Master ID: cl...

    if (!apiToken || !nativeBotId) {
      console.error('[Transcript API] Missing Typebot configuration (Token or Native Bot ID)')
      return NextResponse.json({ error: 'Typebot configuration error' }, { status: 500 })
    }

    let messages = [];
    
    // BACKEND OVERRIDE LOGIC:
    // We fetch ALL recent results from the Master Bot and filter for this client's unique sessionId.
    const fetchUrl = `${typebotUrl}/api/v1/typebots/${nativeBotId}/results`;

    try {
      console.log(`[Transcript API] Backend Override: Fetching results from Master Bot ID: ${nativeBotId}`);
      
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        }
      });

      console.log(`[Transcript API] Master Fetch Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        const results = data.results || [];
        
        // 4. Isolate the client's session by filtering the master results list
        let currentSession = results.find((res: any) => 
          res.id === sessionId || res.sessionId === sessionId
        );

        // FALLBACK: If not found in the recent list, fetch directly by ID
        // (Handles brand new sessions that haven't appeared in the broad list yet)
        if (!currentSession) {
          console.log(`[Transcript API] Session ${sessionId} not in main list. Trying direct fetch fallback...`);
          const directFetchUrl = `${typebotUrl}/api/v1/typebots/${nativeBotId}/results/${sessionId}`;
          
          const directResponse = await fetch(directFetchUrl, {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
            }
          });

          if (directResponse.ok) {
             const directData = await directResponse.json();
             // The direct result endpoint may return a single result object (sometimes wrapped in { result: ... })
             currentSession = directData.result || directData;
             console.log(`[Transcript API] Direct fallback SUCCESS for session ${sessionId}`);
          } else {
             console.warn(`[Transcript API] Direct fallback FAILED for session ${sessionId}: ${directResponse.status}`);
          }
        }

        if (currentSession) {
          console.log(`[Transcript API] Success! Found session match. Mapping answers...`);
          
          // 5. Map the isolated answers into front-end format
          if (currentSession.answers && Array.isArray(currentSession.answers)) {
            messages = currentSession.answers.map((ans: any, idx: number) => ({
              id: ans.id || `ans-${idx}`,
              content: ans.content || ans.value || '',
              isAI: false, // In Results API, answers are user inputs
              timestamp: ans.createdAt || currentSession.createdAt
            }));
          }
        } else {
          console.warn(`[Transcript API] Session ${sessionId} not found after both list fetch and direct fallback.`);
        }
      } else {
        const errorText = await response.text();
        console.error(`[Transcript API] Master Fetch Failed:`, errorText);
      }
    } catch (fetchError) {
      console.error(`[Transcript API] Critical Fetch Error:`, fetchError);
    }


    return NextResponse.json({ messages })

  } catch (error: any) {
    console.error('API Error in /api/typebot/transcript:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}



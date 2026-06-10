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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Identify the user's bot_id from businesses table
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('bot_id')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    const botId = business.bot_id

    // 3. Ownership Check: Verify sessionId belongs to this botId in chat_sessions
    // Table chat_sessions uses snake_case session_id
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('session_id')
      .eq('session_id', sessionId)
      .eq('bot_id', botId)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 403 })
    }

    // 4. Secure Fetch: Fetch messages from chat_messages table (unprotected table)
    // Table chat_messages uses camelCase sessionId
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('sessionId', sessionId)
      .order('id', { ascending: true })

    if (messagesError) {
      // If table doesn't exist yet, return empty array
      if (messagesError.code === '42P01') {
        return NextResponse.json({ messages: [] })
      }
      throw messagesError
    }

    // 5. Data Parsing: Parse LangChain JSON format on the server
    const cleanedMessages = (messages || []).map((msg: any, index: number) => {
      let content = ''
      let isAI = false

      try {
        let parsed = msg.message
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed)
          } catch {
            content = parsed
          }
        }

        if (typeof parsed === 'object' && parsed !== null) {
          // Logic for LangChain serialized formats (consistent with the modal UI)
          if (parsed.id && Array.isArray(parsed.id)) {
            const idStr = parsed.id.join(',').toLowerCase()
            isAI = idStr.includes('aimessage') || idStr.includes('ai_message') || idStr.includes('assistant')
            content = parsed.kwargs?.content || parsed.kwargs?.text || JSON.stringify(parsed.kwargs)
          } else if (parsed.type) {
            isAI = parsed.type.toLowerCase().includes('ai') || parsed.type.toLowerCase().includes('bot') || parsed.type.toLowerCase().includes('assistant')
            content = parsed.data?.content || parsed.data?.text || parsed.content || parsed.text || JSON.stringify(parsed.data || parsed)
          } else if (parsed.content || parsed.text) {
            content = parsed.content || parsed.text
            isAI = (parsed.role || '').toLowerCase().includes('ai') || (parsed.role || '').toLowerCase().includes('assistant')
          } else {
            content = JSON.stringify(parsed)
          }
        } else if (content === '') {
          content = String(parsed)
        }
      } catch (e) {
        content = String(msg.message)
      }

      return {
        id: msg.id || index,
        content,
        isAI,
        timestamp: msg.created_at
      }
    })

    return NextResponse.json({ messages: cleanedMessages })
  } catch (error: any) {
    console.error('API Error in /api/transcripts:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

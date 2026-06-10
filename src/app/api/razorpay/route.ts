import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { plan, bot_id } = body;

    if (!bot_id) {
        return NextResponse.json({ error: "Missing bot_id in request" }, { status: 400 });
    }

    // --- 1. Fetch Dynamic Razorpay Keys for this Tenant ---
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('razorpay_key_id, razorpay_key_secret')
      .eq('bot_id', bot_id)
      .single();

    if (bizError || !business?.razorpay_key_id || !business?.razorpay_key_secret) {
        return NextResponse.json({ 
            error: "Payment gateway not configured for this business. Please check Integrations page." 
        }, { status: 400 });
    }

    // --- 2. Initialize Razorpay Instance Dynamically ---
    const razorpay = new Razorpay({
      key_id: business.razorpay_key_id,
      key_secret: business.razorpay_key_secret,
    });

    const dummyAmounts: Record<string, number> = {
      starter: 99900, // in paise (999.00 INR)
      pro: 299900,   // 2999.00 INR
      agency: 999900 // 9999.00 INR
    };

    const amount = dummyAmounts[plan] || 99900;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan,
        bot_id: bot_id || 'unknown'
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

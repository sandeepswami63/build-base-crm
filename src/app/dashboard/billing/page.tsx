"use client";

import { useState } from 'react';
import { Check, Zap, Shield, Crown, CreditCard, Rocket, ExternalLink } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    description: "Perfect for small businesses starting with AI.",
    features: [
      "1 AI Agent",
      "500 Chat Interactions/mo",
      "Basic Analytics",
      "Email Support",
      "1,000 Knowledge Base Tokens"
    ],
    icon: Rocket,
    buttonText: "Get Started",
    popular: false,
    color: "gray"
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/month",
    description: "Advanced features for growing agencies.",
    features: [
      "3 AI Agents",
      "2,500 Chat Interactions/mo",
      "Advanced Analytics & Export",
      "Priority WhatsApp Support",
      "10,000 Knowledge Base Tokens",
      "Custom Webhooks"
    ],
    icon: Zap,
    buttonText: "Upgrade to Pro",
    popular: true,
    color: "orange"
  },
  {
    name: "Agency",
    price: "₹9,999",
    period: "/month",
    description: "Scalable solutions for large operations.",
    features: [
      "Unlimited AI Agents",
      "10,000 Chat Interactions/mo",
      "White-label Dashboard",
      "Dedicated Account Manager",
      "50,000 Knowledge Base Tokens",
      "Early access to new features"
    ],
    icon: Crown,
    buttonText: "Go Agency",
    popular: false,
    color: "purple"
  }
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    setLoading(planName);
    
    // 1. Create order on server (Placeholder API)
    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });
      
      const data = await res.json();
      
      if (data.orderId) {
        // 2. Open Razorpay Checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: data.amount,
          currency: "INR",
          name: "BuildBase CRM",
          description: `Subscription for ${planName} Plan`,
          image: "https://buildbasedigitally.com/wp-content/uploads/2026/01/cropped-Capture.png",
          order_id: data.orderId,
          handler: function (response: any) {
            alert(`Payment Success! ID: ${response.razorpay_payment_id}`);
            // Here you would verify the payment on your backend
          },
          prefill: {
            name: "BuildBase User",
            email: "user@example.com",
          },
          theme: {
            color: "#f95932",
          },
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Billing system offline. Please try again later.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Plans</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your subscription and usage limits.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-1">
          <button className="px-4 py-2 bg-finexy-orange text-white rounded-xl text-sm font-bold shadow-sm shadow-finexy-orange/20">Monthly</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-900 rounded-xl text-sm font-bold transition-colors">Yearly</button>
          <span className="ml-2 bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Save 20%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative group bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 border ${
              plan.popular ? 'border-finexy-orange border-2 ring-4 ring-finexy-orange/5' : 'border-gray-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-finexy-orange text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-finexy-orange/20">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${
                plan.color === 'orange' ? 'bg-orange-50 text-finexy-orange' : 
                plan.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'
              }`}>
                <plan.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-2 font-medium leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">{plan.price}</span>
              <span className="text-gray-400 font-bold text-sm tracking-tight">{plan.period}</span>
            </div>

            <button 
              onClick={() => handleSubscribe(plan.name)}
              disabled={loading !== null}
              className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                plan.popular 
                  ? 'bg-finexy-orange text-white shadow-lg shadow-finexy-orange/20 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {loading === plan.name ? (
                <Zap size={20} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>{plan.buttonText}</span>
                </>
              )}
            </button>

            <div className="mt-10 space-y-4">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-6">What&apos;s Included</p>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${plan.popular ? 'bg-finexy-orange/20 text-finexy-orange' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-600 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security Info */}
      <div className="mt-16 bg-[#0f1115] rounded-[40px] p-10 md:p-14 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-finexy-orange opacity-[0.03] blur-[100px] -mr-48 -mt-48 rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center flex-shrink-0 text-finexy-orange shadow-inner border border-white/5">
            <Shield size={48} className="drop-shadow-[0_0_10px_rgba(249,89,50,0.5)]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-3">Enterprise Grade Security & Compliance</h2>
            <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
              BuildBase uses Razorpay for secure payment processing. We don&apos;t store your credit card details. 
              Our systems are SOC2 compliant and utilize AES-256 bank-level encryption.
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-4">
             <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">PCI Level</p>
                <p className="text-xl font-black text-white">DSS 1</p>
             </div>
             <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Encryption</p>
                <p className="text-xl font-black text-white">256bit</p>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm font-medium">
          Have more than 50 agents? <span className="text-finexy-orange font-bold hover:underline cursor-pointer">Contact Our Enterprise Team</span>
        </p>
      </div>
    </div>
  );
}

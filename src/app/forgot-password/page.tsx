"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://crm.buildbasedigitally.com/auth/callback?next=/update-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-500">
               <CheckCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Email Sent</h1>
            <p className="text-gray-400 mt-3 font-medium px-4">
              Detailed instructions to reset your password have been sent to <span className="text-white">{email}</span>.
            </p>
          </div>
          <Link href="/login" title="Return to Login" className="inline-flex items-center gap-2 text-finexy-orange font-bold hover:gap-3 transition-all">
            Return to login <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 font-bold text-sm">
          <ChevronLeft size={18} />
          Back to Login
        </Link>

        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-4 text-finexy-orange drop-shadow-[0_0_15px_rgba(249,89,50,0.3)]">
            <Mail size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">Forgot <span className="text-finexy-orange">Password?</span></h1>
          <p className="text-gray-400 mt-3 font-medium text-center px-4">No worries, we'll send you reset instructions.</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d23] rounded-[24px] p-8 shadow-2xl border border-white/5">
          <form onSubmit={handleReset} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 group-focus-within:text-finexy-orange transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-finexy-orange hover:bg-finexy-orange/90 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-finexy-orange/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Send Instructions</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-gray-600">
          Remember your password? <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign in here.</Link>
        </p>
      </div>
    </div>
  );
}

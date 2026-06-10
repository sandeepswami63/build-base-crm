"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('sandeepswami63@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Add a 15-second timeout to prevent browser freeze
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Supabase server may be slow or unreachable.')), 15000)
      );

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else if (data?.session) {
        // Force refresh the router or hard redirect to ensure cookies are read
        window.location.href = '/dashboard';
      } else {
        setErrorMsg('Authentication failed: No session returned.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setErrorMsg(err?.message || 'A network error occurred connecting to Supabase.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-4">
            <img 
              src="https://buildbasedigitally.com/wp-content/uploads/2026/01/cropped-Capture.png" 
              className="w-full h-full object-contain" 
              alt="BuildBase Logo" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">BuildBase <span className="text-finexy-orange">CRM</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Log in to manage your AI workspace</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d23] rounded-[24px] p-8 shadow-2xl border border-white/5">
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
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

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" title="Forgot Password" className="text-xs font-bold text-finexy-orange hover:text-finexy-orange/80 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 group-focus-within:text-finexy-orange transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm font-medium">
            <span className="text-gray-500">Don't have an account?</span>{' '}
            <Link href="/register" title="Create Account" className="text-finexy-orange hover:text-finexy-orange/80 transition-colors">
              Request access.
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-gray-600">
          Powered by <span className="text-gray-400 font-bold tracking-tight italic">BuildBase Secure</span>
        </p>
      </div>
    </div>
  );
}

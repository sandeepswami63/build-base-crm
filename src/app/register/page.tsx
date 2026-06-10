"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else if (data.session) {
      // If email confirmation is disabled on the server, we get a session immediately
      window.location.href = '/dashboard';
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Registration Received</h1>
            <p className="text-gray-400 mt-3 font-medium px-4">
              If your system is configured for email verification, please check <span className="text-white">{email}</span>.
            </p>
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl text-[13px] text-gray-400 text-left">
              <p className="font-bold text-gray-300 mb-1">Self-Hosted Note:</p>
              If you are not receiving emails, you can manually confirm your account via the SQL Dashboard or disable "Email Confirmation" in settings.
            </div>
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
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-4">
            <img 
              src="https://buildbasedigitally.com/wp-content/uploads/2026/01/cropped-Capture.png" 
              className="w-full h-full object-contain" 
              alt="BuildBase Logo" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create <span className="text-finexy-orange">Account</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Join the BuildBase ecosystem</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d23] rounded-[24px] p-8 shadow-2xl border border-white/5">
          <form onSubmit={handleRegister} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500 group-focus-within:text-finexy-orange transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 group-focus-within:text-finexy-orange transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-finexy-orange hover:bg-finexy-orange/90 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-finexy-orange/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm font-medium">
            <span className="text-gray-500">Already have an account?</span>{' '}
            <Link href="/login" title="Sign In" className="text-finexy-orange hover:text-finexy-orange/80 transition-colors">
              Sign in.
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-gray-600">
          By signing up, you agree to our <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span>.
        </p>
      </div>
    </div>
  );
}

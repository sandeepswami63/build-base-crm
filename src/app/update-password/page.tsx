"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Password updated successfully. Redirect to dashboard.
      router.push('/dashboard');
      router.refresh(); // Ensure the layout picks up the new session cleanly
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mb-4 text-finexy-orange drop-shadow-[0_0_15px_rgba(249,89,50,0.3)]">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">Set New <span className="text-finexy-orange">Password</span></h1>
          <p className="text-gray-400 mt-3 font-medium text-center px-4">Please enter your new password below.</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d23] rounded-[24px] p-8 shadow-2xl border border-white/5">
          <form onSubmit={handleUpdate} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 group-focus-within:text-finexy-orange transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0f1115] border border-white/5 rounded-xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange/50 transition-all font-medium placeholder:text-gray-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Update Password</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-gray-600">
          Powered by <span className="text-gray-400 font-bold tracking-tight italic">BuildBase Secure</span>
        </p>
      </div>
    </div>
  );
}

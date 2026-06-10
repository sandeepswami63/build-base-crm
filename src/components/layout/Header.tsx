"use client";

import { Search, Bell, ChevronDown, User, CreditCard, LogOut, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function Header() {
  const [businessData, setBusinessData] = useState<{ business_name: string; logo_url: string; bot_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('businesses')
            .select('business_name, logo_url, bot_id')
            .eq('user_id', session.user.id)
            .single();
          
          if (data) {
            setBusinessData({
              business_name: data.business_name || '',
              logo_url: data.logo_url || '',
              bot_id: data.bot_id || ''
            });
          }
        }
      } catch (err) {
        console.error("Error fetching business data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();

    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = businessData?.business_name || 'My Business';
  const displayId = businessData?.bot_id || 'Pro Member';

  return (
    <header className="h-[96px] flex items-center justify-between px-8 shrink-0 bg-transparent relative z-50">
      <div className="flex-1 flex items-center gap-4">
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative group w-[280px] lg:w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-11 pr-12 py-3 border-none bg-white rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all text-gray-700 font-medium placeholder:text-gray-400"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none gap-1 opacity-60">
            <span className="text-xs text-gray-400 font-mono">⌘</span>
            <span className="text-xs text-gray-400 font-mono">K</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button className="relative w-11 h-11 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-finexy-orange transition-colors shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          <Bell size={20} className="stroke-[2px]" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#ff4f4f] rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 cursor-pointer p-1 pr-4 rounded-full hover:bg-white/50 transition-all select-none"
          >
            <div className="w-11 h-11 rounded-full bg-finexy-orangeLight flex items-center justify-center p-1">
               <div className="w-full h-full rounded-full bg-finexy-orange text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-finexy-orange/30 overflow-hidden">
                  {loading ? <Loader2 size={12} className="animate-spin" /> : 
                    businessData?.logo_url ? (
                      <img src={businessData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(displayName)
                    )
                  }
               </div>
            </div>
            <div className="hidden md:flex flex-col max-w-[150px]">
              <p className="text-[13px] font-bold text-gray-800 leading-tight truncate">
                {loading ? 'Loading...' : displayName}
              </p>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                <span className="truncate">{loading ? '...' : displayId}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </div>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-4 border-b border-gray-50 mb-2">
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                 <p className="text-sm font-bold text-gray-900 truncate">
                   {displayName}
                 </p>
                 <p className="text-xs text-gray-500 mt-0.5 truncate">
                   {displayId}
                 </p>
              </div>
              
              <div className="space-y-1">
                <Link href="/dashboard/settings" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <User size={16} />
                  </div>
                  <span className="text-[13px] font-bold">Account Settings</span>
                </Link>
                
                <Link href="/dashboard/billing" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-finexy-orange flex items-center justify-center group-hover:bg-finexy-orange group-hover:text-white transition-all">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-[13px] font-bold">Billing & Plans</span>
                </Link>

                <div className="pt-2 mt-2 border-t border-gray-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#ff4f4f] hover:bg-red-50 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                      <LogOut size={16} />
                    </div>
                    <span className="text-[13px] font-bold">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, KanbanSquare, MessageSquareText, CalendarDays, Workflow, Settings, HelpCircle, LogOut, Bot, BrainCircuit, Link2, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads Database', icon: KanbanSquare },
  { href: '/dashboard/transcripts', label: 'Chatbot Transcripts', icon: MessageSquareText, badge: 'New' },
  { href: '/dashboard/calendar', label: 'Calendar & Scheduling', icon: CalendarDays },
  { href: '/dashboard/automation', label: 'Automation Campaigns', icon: Workflow },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: BrainCircuit },
];

const generalNav = [
  { href: '/dashboard/settings', label: 'AI Agent Settings', icon: Settings },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Link2 },
  { href: '/dashboard/billing', label: 'Billing & Plans', icon: CreditCard },
  { href: '/dashboard/help', label: 'Help Desk', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[260px] bg-white hidden md:flex flex-col h-full shrink-0 shadow-sm z-10">
      {/* Brand / Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
            <img src="https://buildbasedigitally.com/wp-content/uploads/2026/01/cropped-Capture.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Build Base Digitally</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-5 space-y-8 scrollbar-hide">
        {/* Core Menu */}
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-3">Main</h3>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl group transition-colors ${
                    active
                      ? 'bg-finexy-orange text-white shadow-sm shadow-finexy-orange/30'
                      : 'text-gray-500 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="stroke-[2px]" />
                    <span className={`font-${active ? 'semibold' : 'medium'} text-[13px] ${active ? '' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-finexy-orange text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* General */}
        <div className="pb-4">
          <h3 className="px-3 text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-3">General</h3>
          <nav className="space-y-1">
            {generalNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl group transition-colors ${
                    active
                      ? 'bg-finexy-orange text-white shadow-sm shadow-finexy-orange/30'
                      : 'text-gray-500 hover:bg-gray-50/80'
                  }`}
                >
                  <item.icon size={20} className="stroke-[2px]" />
                  <span className={`font-${active ? 'semibold' : 'medium'} text-[13px] ${active ? '' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 text-[#ff4f4f] hover:bg-red-50/50 rounded-xl w-full transition-colors"
        >
          <LogOut size={20} className="stroke-[2px]" />
          <span className="text-[13px] font-semibold">Log out</span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import { HelpCircle, Search, ChevronDown, Mail, MessageSquare, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I connect my WhatsApp account?',
    answer: 'You can connect WhatsApp by navigating to the Integrations page and following the n8n webhook setup guide. This allows your AI agent to send messages directly to your leads.'
  },
  {
    question: 'Can I customize the AI personality?',
    answer: 'Yes! Go to AI Agent Settings. You can define the persona title, tone of voice, and even specific business rules that the AI must follow during conversations.'
  },
  {
    question: 'Where can I see my qualified leads?',
    answer: 'All qualified leads are automatically synced to the Leads CRM (Kanban) and the main Dashboard. You can filter by lead score and sentiment to focus on hot leads.'
  },
  {
    question: 'How does the automated scheduling work?',
    answer: 'Once you integrate your Google Calendar, the AI agent will check for free slots in real-time. If a lead expresses interest, it will offer those slots and book the meeting instantly.'
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-10 bg-white rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-finexy-orange"></div>
        <div className="p-4 bg-orange-50 rounded-2xl text-finexy-orange mb-2">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">How can we help you today?</h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Search our knowledge base or get in touch with our team for personalized support.
        </p>
        
        <div className="relative mt-8 w-full max-w-xl px-6">
          <Search size={20} className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for articles, guides..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-finexy-orange/20 focus:border-finexy-orange transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-2">
            <MessageSquare size={20} className="text-finexy-orange" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white border rounded-[24px] overflow-hidden transition-all ${openIndex === index ? 'border-finexy-orange shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-7 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-800">{faq.question}</span>
                  <ChevronDown className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-finexy-orange' : ''}`} size={20} />
                </button>
                {openIndex === index && (
                  <div className="px-7 pb-6 text-sm text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Info */}
        <div className="space-y-8">
          {/* Contact Support Form */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Contact Support</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="Integration issue..." 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-finexy-orange transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Message</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe your problem in detail..." 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-finexy-orange transition-all leading-relaxed"
                />
              </div>
              <button className="w-full py-4 bg-finexy-orange text-white rounded-[18px] font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                <Send size={18} />
                Send Message
              </button>
            </div>
          </div>

          {/* Quick Contact Links */}
          <div className="bg-gray-900 rounded-[32px] p-8 text-white space-y-6">
            <h4 className="text-lg font-bold">Other Ways to Connect</h4>
            <div className="space-y-4">
              <a href="mailto:support@buildbasedigitally.com" className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl text-finexy-orange group-hover:bg-finexy-orange group-hover:text-white transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-medium">support@buildbasedigitally.com</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Support</p>
                  <p className="text-sm font-medium">+91 98765 00000</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-blue-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium">Remote HQ, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

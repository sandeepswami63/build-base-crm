'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBotId } from '@/hooks/useBotId';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  BrainCircuit, 
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function KnowledgeBase() {
  const { botId, loading: botIdLoading } = useBotId();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (botId) {
      fetchKB();
    }
  }, [botId]);

  async function fetchKB() {
    try {
      if (!botId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching KB:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSnippet = async () => {
    if (!botId || !newContent.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          bot_id: botId,
          content: newContent,
          metadata: { type: 'manual_snippet' }
        });
      
      if (error) throw error;
      
      setNewContent('');
      setNotification({ type: 'success', message: 'Knowledge snippet added successfully!' });
      fetchKB();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchKB();
    } catch (err) {
      console.error('Error deleting KB item:', err);
    }
  };

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BrainCircuit className="text-finexy-orange" size={28} />
              AI Knowledge Base
            </h1>
            <p className="text-gray-500 mt-1">Train your AI with custom data to make it hyper-intelligent.</p>
          </div>
          
          <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                <UploadCloud size={18} />
                Upload PDF / Doc
             </button>
          </div>
        </div>

        {notification && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {/* Add New Snippet */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
           <h3 className="font-bold text-gray-900">Add New Information Snippet</h3>
           <textarea 
             value={newContent}
             onChange={(e) => setNewContent(e.target.value)}
             rows={4}
             placeholder="Paste gym schedules, pricing details, or specific rules here..."
             className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finexy-orange focus:ring-1 focus:ring-finexy-orange transition-all"
           />
           <div className="flex justify-end">
              <button 
                onClick={handleAddSnippet}
                disabled={isSaving || !newContent.trim()}
                className="bg-finexy-orange hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSaving ? 'Processing...' : 'Add to AI Brain'}
              </button>
           </div>
        </div>

        {/* Knowledge Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Learned Information ({items.length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search KB..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-finexy-orange"
              />
            </div>
          </div>

          {loading || botIdLoading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-finexy-orange" size={32} />
             </div>
          ) : items.length === 0 ? (
             <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-medium">No knowledge entries found for {botId || '...'}! Add your first snippet above!</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-finexy-orange/30 transition-all">
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                           {item.content}
                         </p>
                         <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                           <span>{new Date(item.created_at).toLocaleDateString()}</span>
                           <span>•</span>
                           <span className="text-finexy-orange">Vectorized</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Check, Loader2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NoteTaker({ videoId }: { videoId: string }) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 1. Charger la note existante au montage
  useEffect(() => {
    async function loadNote() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('user_notes')
          .select('content')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single();

        if (data) setNote(data.content || '');
      }
    }
    loadNote();
  }, [videoId]);

  // 2. Fonction de sauvegarde (Upsert)
  const saveNote = async () => {
    if (!user) return;
    setStatus('saving');

    const { error } = await supabase
      .from('user_notes')
      .upsert(
        { user_id: user.id, video_id: videoId, content: note, updated_at: new Date() },
        { onConflict: 'user_id, video_id' }
      );

    if (!error) {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000); // Remet à zéro après 2s
    }
  };

  // 3. Déclencheur de sauvegarde (Bouton manuel pour l'instant pour la simplicité UX)
  // On pourrait aussi utiliser un useEffect avec debounce pour l'auto-save.

  if (!user) {
    return (
      <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-800 text-center">
        <p className="text-slate-500 text-sm mb-2">Connectez-vous pour prendre des notes.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
      <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          Mon Carnet de Notes
        </h3>
        
        {/* Indicateur de statut */}
        <div className="text-xs font-mono">
            {status === 'saving' && <span className="text-yellow-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Saving...</span>}
            {status === 'saved' && <span className="text-green-400 flex items-center gap-1"><Check size={12}/> Saved</span>}
        </div>
      </div>

      <div className="p-4">
        <textarea
          value={note}
          onChange={(e) => {
             setNote(e.target.value);
             setStatus('idle'); // Dès qu'on modifie, on quitte l'état 'saved'
          }}
          placeholder="Notez ici les détails clés : grips, position des hanches, timing..."
          className="w-full h-32 bg-slate-950 text-slate-300 text-sm p-3 rounded-lg border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none transition-all placeholder:text-slate-600"
        />
        
        <div className="flex justify-end mt-2">
            <button 
                onClick={saveNote}
                disabled={status === 'saving' || note.trim() === ''}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={14} />
                Sauvegarder la note
            </button>
        </div>
      </div>
    </div>
  );
}
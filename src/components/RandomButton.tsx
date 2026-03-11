'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Dices, Loader2 } from 'lucide-react';

export default function RandomButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRandomRoll = async () => {
    setLoading(true);
    
    // 1. On récupère juste les IDs de toutes les vidéos
    const { data } = await supabase
      .from('videos')
      .select('id');

    if (data && data.length > 0) {
      // 2. On choisit un index au hasard
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomId = data[randomIndex].id;

      // 3. On redirige
      router.push(`/video/${randomId}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRandomRoll}
      disabled={loading}
      className="fixed bottom-6 right-6 z-40 bg-yellow-400 hover:bg-yellow-300 text-black p-4 rounded-full shadow-lg shadow-yellow-400/20 transition-transform hover:scale-110 active:scale-95 group"
      title="Technique au hasard"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={24} />
      ) : (
        <Dices size={24} className="group-hover:rotate-180 transition-transform duration-500" />
      )}
      
      {/* Tooltip au survol */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap border border-slate-800">
        Random Roll
      </span>
    </button>
  );
}
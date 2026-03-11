'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti'; // <-- Import

export default function FavoriteButton({ videoId }: { videoId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkFavoriteStatus();
  }, [videoId]);

  const checkFavoriteStatus = async () => {
    // ... (Code inchangé pour la vérification) ...
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('user_favorites').select('*').eq('user_id', user.id).eq('video_id', videoId).single();
    if (data) setIsFavorited(true);
    setLoading(false);
  };

  const toggleFavorite = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        router.push('/login');
        return;
    }

    if (isFavorited) {
        // Supprimer
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('video_id', videoId);
        setIsFavorited(false);
    } else {
        // Ajouter
        await supabase.from('user_favorites').insert([{ user_id: user.id, video_id: videoId }]);
        setIsFavorited(true);
        
        // --- EFFET CONFETTI ICI ---
        triggerConfetti();
    }
    setLoading(false);
    router.refresh();
  };

  // Fonction de configuration des confettis
  const triggerConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ['#FACC15', '#ffffff']; // Jaune et Blanc

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <button 
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all active:scale-95 ${
            isFavorited 
            ? 'bg-red-500/10 text-red-500 border border-red-500/50' 
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
        }`}
    >
        <Heart 
            size={20} 
            fill={isFavorited ? "currentColor" : "none"} 
            className={loading ? 'animate-pulse' : isFavorited ? 'animate-bounce' : ''} // Petite animation bounce
        />
        {isFavorited ? 'Sauvegardé' : 'Ajouter aux favoris'}
    </button>
  );
}
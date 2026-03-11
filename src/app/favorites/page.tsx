'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import VideoCard from '@/components/VideoCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchFavorites() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Requête imbriquée : on récupère les vidéos via la table de liaison
        const { data, error } = await supabase
          .from('user_favorites')
          .select('video:videos(*)') // Syntaxe Supabase pour faire une jointure
          .eq('user_id', user.id);

        if (data) {
            // On nettoie les données pour n'avoir que le tableau de vidéos
            setVideos(data.map((item: any) => item.video));
        }
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  if (loading) return <div className="p-10 text-center text-yellow-400">Chargement...</div>;

  if (!user) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-2xl font-bold text-white mb-4">Accès Restreint</h1>
            <p className="text-slate-400 mb-6">Vous devez être connecté pour voir vos favoris.</p>
            <Link href="/login" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold">
                Se connecter
            </Link>
        </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <Heart className="text-red-500 w-8 h-8" fill="currentColor" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                Mes Favoris
            </h1>
        </div>

        {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        ) : (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 mb-4">Vous n'avez sauvegardé aucune technique pour l'instant.</p>
                <Link href="/" className="text-yellow-400 hover:underline">
                    Explorer la bibliothèque
                </Link>
            </div>
        )}
      </div>
    </main>
  );
}
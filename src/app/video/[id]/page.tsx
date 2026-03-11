import { supabase } from '@/lib/supabase';
import VideoPlayer from '@/components/VideoPlayer';
import FavoriteButton from '@/components/FavoriteButton';
import NoteTaker from '@/components/NoteTaker';
import CommentSection from '@/components/CommentSection'; // <-- L'import des commentaires
import Link from 'next/link';
import { ArrowLeft, PlayCircle, Clock } from 'lucide-react';
import type { Segment, Video } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Force le rendu dynamique pour s'assurer que les données soient toujours fraîches
export const dynamic = 'force-dynamic';

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Récupérer la vidéo courante
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Vidéo introuvable</h1>
          <Link href="/" className="text-yellow-400 hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  // 2. Récupérer les "Vidéos Similaires" (Même playlist/contexte)
  let query = supabase
    .from('videos')
    .select('id, title, poster_url, duration, competition_context')
    .neq('id', id) // On ne veut pas afficher la vidéo qu'on regarde déjà
    .limit(10);

  if (video.competition_context) {
    query = query.eq('competition_context', video.competition_context);
  }

  const { data: relatedVideos } = await query;

  // 3. Récupérer les segments (Timestamps)
  const { data: segments } = await supabase
    .from('segments')
    .select('*')
    .eq('video_id', id)
    .order('start_time', { ascending: true });

  return (
    <main className="min-h-screen p-4 md:p-8 pb-20 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Bouton Retour */}
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-yellow-400 mb-6 transition group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Retour à la bibliothèque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === COLONNE GAUCHE (Contenu Principal) === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* A. Le Lecteur Vidéo */}
            <VideoPlayer 
              url={video.url} 
              poster={video.poster_url} 
              segments={segments as Segment[]} 
            />
            
            {/* B. Bloc d'informations (Titre, Desc, Favoris) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div className="flex-1">
                    {/* Tags / Contexte */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {video.competition_context && (
                        <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {video.competition_context}
                        </span>
                        )}
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={12} /> {video.duration ? Math.floor(video.duration / 60) + ' min' : 'Durée inconnue'}
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-white">{video.title}</h1>
                </div>

                {/* Le Bouton Favoris */}
                <div className="shrink-0">
                    <FavoriteButton videoId={video.id} />
                </div>
              </div>

              <div className="w-full h-px bg-slate-800 my-4"></div>
              
              <p className="text-slate-400 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {video.description || "Aucune description disponible pour cette technique."}
              </p>
            </div>

            {/* C. Bloc Carnet de Notes */}
            <NoteTaker videoId={video.id} />

            {/* D. Section Commentaires (NOUVEAU) */}
            <CommentSection videoId={video.id} />

          </div>

          {/* === COLONNE DROITE (Sidebar Playlist) === */}
          <div className="lg:col-span-1">
             <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden sticky top-24">
                
                <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <PlayCircle size={16} className="text-yellow-400" />
                        Dans la même série
                    </h3>
                </div>

                <div className="max-h-[600px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {relatedVideos?.map((item: Video) => (
                        <Link 
                            key={item.id} 
                            href={`/video/${item.id}`}
                            className="flex gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                        >
                            {/* Miniature Playlist */}
                            <div className="relative w-24 h-14 shrink-0 rounded overflow-hidden bg-black border border-slate-800">
                                <img src={item.poster_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                            </div>
                            
                            {/* Titre */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-sm font-medium text-slate-300 group-hover:text-yellow-400 transition-colors line-clamp-2 leading-tight">
                                    {item.title}
                                </h4>
                            </div>
                        </Link>
                    ))}

                    {relatedVideos?.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-xs italic">
                            C'est la seule vidéo de cette série.
                        </div>
                    )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}
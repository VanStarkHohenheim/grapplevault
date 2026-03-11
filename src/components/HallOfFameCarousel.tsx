import Link from 'next/link';
import { Play, Trophy } from 'lucide-react';
import type { Video } from '@/types';

export default function HallOfFameCarousel({ videos }: { videos: Video[] }) {
  return (
    <div className="relative w-full">
      {/* Container Scroll Snap Horizontal */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {videos.map((video) => (
          <Link 
            key={video.id} 
            href={`/video/${video.id}`}
            className="snap-center shrink-0 w-[85vw] md:w-[450px] relative group cursor-pointer"
          >
            {/* Carte Verticale "Premium" */}
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 group-hover:border-yellow-500/50 transition-all duration-300">
              
              {/* Image de fond avec gradient */}
              <img 
                src={video.poster_url} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
              
              {/* Icône Play au survol */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-yellow-400/90 p-4 rounded-full shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                   <Play fill="black" className="text-black w-6 h-6 ml-1" />
                </div>
              </div>

              {/* Contenu Texte */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                        Legendary Match
                    </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                    {video.title}
                </h3>
                
                <p className="text-slate-300 text-sm font-mono flex items-center gap-2">
                    {video.competition_context} 
                    <span className="w-1 h-1 bg-slate-500 rounded-full"/> 
                    {Math.floor(video.duration / 60)} min
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
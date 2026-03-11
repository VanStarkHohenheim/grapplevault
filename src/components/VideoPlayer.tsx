'use client';

import React, { useState, useEffect } from 'react';
import type { Segment } from '@/types';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  segments?: Segment[];
}

export default function VideoPlayer({ url, poster, segments }: VideoPlayerProps) {
  // Fonction utilitaire pour extraire l'ID YouTube proprement
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);
  const [isPlaying, setIsPlaying] = useState(false);

  // Si on ne trouve pas d'ID, on affiche une erreur
  if (!videoId) {
    return <div className="text-red-500 bg-red-100 p-4">URL Invalide: {url}</div>;
  }

  // URL d'embed officielle YouTube
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`;

  return (
    <div className="w-full space-y-4">
      
      {/* Container 16:9 */}
      <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl group">
        
        {!isPlaying ? (
            // --- MODE POSTER (Avant le clic) ---
            <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsPlaying(true)}
            >
                {/* Image */}
                <img 
                    src={poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                    alt="Cover" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                
                {/* Bouton Play Centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </div>
        ) : (
            // --- MODE IFRAME NATIVE (Après le clic) ---
            <iframe
                src={embedUrl}
                title="YouTube video player"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        )}

      </div>

      {/* Segments (Simulés pour l'instant car l'iframe native ne permet pas le seekTo facile sans API complexe) */}
      {segments && segments.length > 0 && (
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-yellow-500 text-xs font-bold uppercase mb-2">Note Tech</p>
            <p className="text-slate-400 text-sm">
                Mode natif activé. Les sauts temporels (segments) nécessitent la librairie ReactPlayer pour fonctionner. 
                Une fois la vidéo affichée, nous pourrons réactiver la librairie.
            </p>
        </div>
      )}
    </div>
  );
};
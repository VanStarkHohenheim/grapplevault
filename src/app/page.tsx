'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import VideoCard from '@/components/VideoCard';
import SearchBar from '@/components/SearchBar';
import type { Video } from '@/types';
import { Layers, Globe, Trophy, MapPin, Star, Zap } from 'lucide-react';

const QUICK_TAGS = [
  { id: 'all',          label: 'Tout voir',    icon: Layers  },
  { id: 'worlds',       label: 'Worlds',       icon: Globe   },
  { id: 'adcc',         label: 'ADCC',         icon: Trophy  },
  { id: 'europeans',    label: 'Europeans',    icon: Star    },
  { id: 'brasileiros',  label: 'Brasileiros',  icon: MapPin  },
  { id: 'pans',         label: 'Pan Ams',      icon: Zap     },
  { id: 'open',         label: 'Open',         icon: null    },
];

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('all');

  // 1. Chargement initial
  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: true }); // Ascending pour suivre l'ordre de la playlist

      if (data) {
        setVideos(data);
        setFilteredVideos(data);
      }
      setLoading(false);
    }

    fetchVideos();
  }, []);

  // 2. Moteur de filtre combiné (Tag + Recherche)
  useEffect(() => {
    let result = videos;

    // A. Filtre par Tag
    if (activeTag !== 'all') {
      result = result.filter(video => {
        // Filtre par championnat — cible prioritairement competition_context
        const ctx = (video.competition_context ?? '').toLowerCase();
        const full = `${video.title} ${video.description} ${ctx}`.toLowerCase();

        if (activeTag === 'worlds')      return ctx.includes('world') || ctx.includes('mundial') || full.includes('world championship');
        if (activeTag === 'adcc')        return full.includes('adcc');
        if (activeTag === 'europeans')   return ctx.includes('europ') || full.includes('european');
        if (activeTag === 'brasileiros') return ctx.includes('brasil') || full.includes('brasileiro');
        if (activeTag === 'pans')        return full.includes('pan american') || full.includes('pan ams') || full.includes('panamericano') || /\bpans?\b/.test(full);
        if (activeTag === 'open')        return full.includes('open');

        return full.includes(activeTag.toLowerCase());
      });
    }

    // B. Filtre par Recherche Texte
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(lowerTerm) ||
        video.description?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredVideos(result);
  }, [activeTag, searchTerm, videos]);

  return (
    <main className="min-h-screen p-6 md:p-8 pb-20 bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
            Grapple<span className="text-yellow-400">Vault</span>
          </h1>
          <p className="text-slate-400 mb-6">Bibliothèque de combats.</p>
          <SearchBar onSearch={setSearchTerm} searchTerm={searchTerm} />
        </div>

        {/* BARRE DE FILTRES (TAGS) */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {QUICK_TAGS.map((tag) => {
            const Icon = tag.icon;
            const isActive = activeTag === tag.id;
            
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border
                  ${isActive
                    ? 'bg-yellow-400 text-black border-yellow-400 scale-105 shadow-lg shadow-yellow-400/25'
                    : 'glass-pill text-slate-300 hover:text-white'
                  }`}
              >
                {Icon && <Icon size={14} />}
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="aspect-video rounded-2xl glass-skeleton" style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
             ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-4 px-1">
                <span className="text-slate-500 text-sm font-mono">
                    {filteredVideos.length} Combats
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p className="text-slate-400">Aucun résultat pour cette combinaison.</p>
                <button 
                  onClick={() => {setActiveTag('all'); setSearchTerm('')}}
                  className="mt-4 text-yellow-400 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
import { supabase } from '@/lib/supabase';
import HallOfFameCarousel from '@/components/HallOfFameCarousel';
import FighterCarousel from '@/components/FighterCarousel';
import VideoCard from '@/components/VideoCard';
import { Medal, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HallOfFamePage() {
  const { data: featuredVideos } = await supabase
    .from('videos')
    .select('*')
    .not('competition_context', 'is', null)
    .limit(5);

  const { data: allArchive } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-transparent">

      {/* ── HERO ── */}
      <section className="relative pt-12 pb-10 px-6 md:px-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-full"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              <Medal className="text-yellow-400 w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
              Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Fame</span>
            </h1>
          </div>
          <p className="text-white/40 max-w-2xl text-lg mb-8">
            Une collection curée des moments charnières de l'histoire du Jiu-Jitsu.
            Étudiez les combats qui ont redéfini la méta.
          </p>

          {/* Carousel vidéos */}
          {featuredVideos && featuredVideos.length > 0 ? (
            <HallOfFameCarousel videos={featuredVideos} />
          ) : (
            <div
              className="p-8 rounded-xl text-center text-white/30"
              style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
            >
              Ajoutez des vidéos avec un "competition_context" pour les voir apparaître ici.
            </div>
          )}
        </div>
      </section>

      {/* ── LÉGENDES ── */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Users size={18} className="text-white/60" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Les Légendes
            </h2>
          </div>
          <p className="text-white/35 text-sm mb-8 ml-12">
            Cliquez sur une carte pour découvrir la biographie et le palmarès du combattant.
          </p>
          <FighterCarousel />
        </div>
      </section>

      {/* ── ARCHIVES ── */}
      <section
        className="py-12 px-6 md:px-12 max-w-7xl mx-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-xl font-bold text-white/70 mb-6 flex items-center gap-2">
          <span className="w-2 h-6 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
          Archives Complètes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allArchive?.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

    </main>
  );
}

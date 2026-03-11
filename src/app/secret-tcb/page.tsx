'use client';

import { useEffect, useState } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import TcbRequestForm from '@/components/TcbRequestForm';

const LOCAL_VIDEOS = [
  {
    id: 1,
    title: "Demi-profonde -> Waiter -> Renversement",
    description: "Alex montra une sequence de la demi-garde profonde jusqu'au renversement.",
    fileName: "Waiter-slip.MP4",
    duration: "0:42"
  },
  {
    id: 2,
    title: "Soumission en garde fermer",
    description: "Kal montra comment arracher le bras de ton adversaire dans une garde fermer.",
    fileName: "choke-close-guard.mp4",
    duration: "1:06"
  },
  {
    id: 3,
    title: "Passage de garde en longue step",
    description: "Jamel montra comment passer la garde ton adversaire avec une bonne maitrise de la pression sur la ligne des epaules.",
    fileName: "passage-longue-step.mp4",
    duration: "1:53"
  },
  {
    id: 4,
    title: "Demie garde -> Renversement",
    description: "Tas montra comment renverser un adversaire qui met beaucoup de pression pour passer ta demie garde.",
    fileName: "demi-garde-renversement.mp4",
    duration: "1:31"
  },
];

type AuthState = 'loading' | 'unauthenticated' | 'no-access' | 'member';

export default function SecretPage() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('unauthenticated'); return; }
      setUser(user);
      setAuthState(user.user_metadata?.tcb_member === true ? 'member' : 'no-access');
    }
    checkAuth();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="p-6 rounded-full mb-6 animate-pulse" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }}>
          <Lock size={56} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 uppercase italic">Zone Classifiée</h1>
        <p className="text-white/45 mb-8 max-w-md">Les secrets du TCB sont réservés aux membres initiés. Connectez-vous pour accéder aux archives.</p>
        <Link href="/login" className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black hover:scale-105 transition transform" style={{ boxShadow: '0 0 20px rgba(250,204,21,0.3)' }}>
          S'identifier
        </Link>
      </div>
    );
  }

  if (authState === 'no-access') {
    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgba(239,68,68,0.06), transparent)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}>
              <Lock size={28} className="text-red-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.9)' }}>
              <ShieldAlert size={12} /> Accès restreint
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight italic">
              Archives <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">TCB</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
              Tu n'es pas encore membre du TCB. Fais une demande d'intégration ci-dessous — un coach examinera ton profil.
            </p>
          </div>
        </div>
        <TcbRequestForm userId={user.id} userEmail={user.email} />
      </div>
    );
  }

  // ── Membre TCB ──
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="pb-8 mb-10 text-center md:text-left" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.9)' }}>
            <ShieldAlert size={12} /> Réservé aux membres TCB
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-3">
            Les Archives{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">TCB</span>
          </h1>
          <p className="text-white/40 max-w-2xl text-lg">Toutes les techniques filmées en session — révisez à votre rythme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LOCAL_VIDEOS.map((video) => (
            <div key={video.id} className="glass-card rounded-2xl overflow-hidden group">
              <div className="relative aspect-video bg-black">
                <video controls preload="metadata" className="w-full h-full object-contain">
                  <source src={`/tcb-videos/${video.fileName}`} type="video/mp4" />
                </video>
              </div>
              <div className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition leading-snug">{video.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full font-mono ml-3 shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    {video.duration}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

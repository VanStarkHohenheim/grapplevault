'use client';

import Link from 'next/link';
import { Search, Menu, User, LogOut, Heart, Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fermer le drawer à chaque changement de route
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Vérifier si un utilisateur est connecté et écouter les changements
  useEffect(() => {
    // 1. Check initial
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    checkUser();

    // 2. Écouter les événements Auth (Login, Logout, User Update)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        
        // Si l'utilisateur se déconnecte, on rafraîchit la page pour nettoyer les données
        if (event === 'SIGNED_OUT') {
            setUser(null);
            router.refresh();
        }
        // Si l'utilisateur met à jour son profil (ex: nouvelle photo), on met à jour l'état
        if (event === 'USER_UPDATED') {
            setUser(session?.user ?? null);
        }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="text-white sticky top-0 z-50" style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', background: 'rgba(5,5,13,0.55)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* === LOGO === */}
        <Link href="/" className="text-xl font-black tracking-tighter uppercase italic text-yellow-400 hover:text-yellow-300 transition">
          GrappleVault
        </Link>

        {/* === NAVIGATION DESKTOP === */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition">
            Library
          </Link>
          <Link href="/hall-of-fame" className="hover:text-white transition">
            Hall of Fame
          </Link>


{/* LIEN SECRET TCB */}
<Link 
    href="/secret-tcb" 
    className="text-red-500 hover:text-red-400 transition font-bold flex items-center gap-1 animate-pulse hover:animate-none">
    <Lock size={14}/> SECRET TCB
</Link>
          
          {/* Lien visible uniquement si connecté */}
          {user && (
             <Link href="/favorites" className="hover:text-yellow-400 transition flex items-center gap-1 group">
                <Heart size={14} className="group-hover:fill-yellow-400 transition" /> Mes Favoris
             </Link>
          )}
        </nav>

        {/* === ACTIONS UTILISATEUR === */}
        <div className="flex items-center gap-4">
          
          {/* Recherche (Visuel) */}
          <button className="p-2 hover:bg-slate-800 rounded-full transition hidden sm:block">
            <Search size={20} className="text-slate-400" />
          </button>

          {user ? (
             // --- MODE CONNECTÉ ---
             <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                
                {/* Bouton Déconnexion */}
                <button 
                    onClick={handleLogout} 
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
                >
                    <LogOut size={14} /> <span className="hidden lg:inline">Sortir</span>
                </button>
                
                {/* AVATAR -> Lien vers PROFIL */}
                <Link 
                    href="/profile" 
                    title="Mon Espace (Notes & Profil)"
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20 transition transform hover:scale-105 overflow-hidden border border-slate-700 bg-slate-800"
                >
                    {/* Affiche l'image uploadée OU les initiales */}
                    {user.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>
             </div>
          ) : (
             // --- MODE DÉCONNECTÉ ---
             <Link 
                href="/login" 
                className="flex items-center gap-2 text-sm font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition border border-slate-700"
             >
                <User size={16} /> <span className="hidden sm:inline">Connexion</span>
             </Link>
          )}

          {/* Burger Menu Mobile */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
        </div>

      </div>

      {/* === DRAWER MOBILE === */}
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backdropFilter: 'blur(32px) saturate(200%)', WebkitBackdropFilter: 'blur(32px) saturate(200%)', background: 'rgba(5,5,13,0.75)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header du drawer */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-yellow-400 font-black tracking-tighter uppercase italic">GrappleVault</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-white transition"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white transition font-medium hover:bg-white/[0.07]">
            Library
          </Link>
          <Link href="/hall-of-fame" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white transition font-medium hover:bg-white/[0.07]">
            Hall of Fame
          </Link>
          <Link href="/secret-tcb" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 transition font-bold hover:bg-white/[0.07] animate-pulse hover:animate-none">
            <Lock size={14} /> SECRET TCB
          </Link>
          {user && (
            <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-yellow-400 transition font-medium hover:bg-white/[0.07]">
              <Heart size={14} /> Mes Favoris
            </Link>
          )}
        </nav>

        {/* Footer du drawer */}
        <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.07] transition font-medium">
                <User size={16} /> Mon Profil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/[0.07] transition font-medium w-full text-left"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20">
              <User size={16} /> Connexion
            </Link>
          )}
        </div>
      </div>

    </header>
  );
}
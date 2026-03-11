'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
// Fix: Utilisation de 'Pencil' au lieu de 'Edit3' pour éviter les erreurs de version Lucide
import { BookOpen, User, Clock, LogOut, Award, Play, Pencil, Save, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AvatarUploader from '@/components/AvatarUploader';
import { toast } from 'sonner';

interface NoteWithVideo {
  id: string;
  content: string;
  updated_at: string;
  video: {
    id: string;
    title: string;
    poster_url: string;
    competition_context: string | null;
  };
}

export default function ProfilePage() {
  const [notes, setNotes] = useState<NoteWithVideo[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour l'édition de profil
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        router.push('/login');
        return;
      }

      // Initialiser les champs d'édition avec les métadonnées existantes
      setUsername(user.user_metadata?.username || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);

      const { data } = await supabase
        .from('user_notes')
        .select(`id, content, updated_at, video:videos ( id, title, poster_url, competition_context )`)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (data) setNotes(data as any);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  // Sauvegarde du profil (Username + Avatar)
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { username, avatar_url: avatarUrl }
    });

    if (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } else {
      setIsEditing(false);
      toast.success("Profil mis à jour !");
      router.refresh();
    }
    setSavingProfile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  // --- LOGIQUE DE GAMIFICATION (SEUILS MIS À JOUR) ---
  const getBeltLevel = (count: number) => {
    // 200+ : Ceinture Noire
    if (count >= 200) return { name: 'Black Belt', color: 'bg-neutral-950 border border-slate-700 text-white shadow-lg shadow-red-900/20', next: null };
    
    // 100 - 199 : Ceinture Marron
    if (count >= 100) return { name: 'Brown Belt', color: 'bg-amber-900 text-white shadow-lg shadow-amber-900/20', next: 200 };
    
    // 60 - 99 : Ceinture Violette
    if (count >= 60)  return { name: 'Purple Belt', color: 'bg-purple-700 text-white shadow-lg shadow-purple-900/20', next: 100 };
    
    // 20 - 59 : Ceinture Bleue
    if (count >= 20)  return { name: 'Blue Belt', color: 'bg-blue-600 text-white shadow-lg shadow-blue-900/20', next: 60 };
    
    // 0 - 19 : Ceinture Blanche
    return { name: 'White Belt', color: 'bg-slate-100 text-slate-900 border border-slate-300', next: 20 };
  };

  const currentBelt = getBeltLevel(notes.length);
  const progressPercent = currentBelt.next ? Math.min(100, (notes.length / currentBelt.next) * 100) : 100;

  if (loading) return <div className="p-10 text-center text-yellow-400 animate-pulse">Chargement...</div>;

  return (
    <main className="min-h-screen p-6 md:p-12 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        
        {/* === HEADER PROFIL === */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl relative overflow-hidden">
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

           {/* --- ZONE AVATAR --- */}
           <div className="relative shrink-0 z-10">
             {isEditing ? (
               <AvatarUploader 
                  url={avatarUrl} 
                  onUpload={(url) => setAvatarUrl(url)} 
                  size={120} 
               />
             ) : (
               <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black text-4xl font-black">
                      {user?.email?.charAt(0).toUpperCase()}
                   </div>
                 )}
               </div>
             )}
             
             {/* Icône Rang */}
             {!isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-slate-800 p-2 rounded-full border border-slate-700">
                    <Award size={20} className="text-yellow-400" />
                </div>
             )}
           </div>

           {/* --- ZONE INFOS --- */}
           <div className="flex-1 text-center md:text-left w-full z-10">
              
              {/* Mode Édition vs Mode Lecture */}
              {isEditing ? (
                <div className="mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800 max-w-md mx-auto md:mx-0">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Choisir un pseudo</label>
                   <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: JitsMaster88"
                      className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 mb-4 focus:border-yellow-400 focus:outline-none"
                   />
                   <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm text-slate-400 hover:text-white">Annuler</button>
                      <button 
                        onClick={handleUpdateProfile} 
                        disabled={savingProfile}
                        className="bg-yellow-400 text-black px-4 py-1 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-yellow-300"
                      >
                         {savingProfile ? '...' : <><Save size={14}/> Enregistrer</>}
                      </button>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                    <h1 className="text-3xl font-bold text-white">
                        {username || <span className="text-slate-500 italic font-normal">Sans pseudo</span>}
                    </h1>
                    
                    <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-yellow-400 transition">
                        <Pencil size={18} />
                    </button>

                    <div className={`inline-flex items-center px-3 py-1 rounded text-xs font-black uppercase tracking-widest gap-2 ${currentBelt.color}`}>
                        {currentBelt.name}
                        {currentBelt.name !== 'White Belt' && <span className="block w-2 h-4 bg-red-600 rounded-sm"></span>}
                    </div>

                    {/* Badge TCB membre */}
                    {user?.user_metadata?.tcb_member === true && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.45)',
                          boxShadow: '0 0 10px rgba(255,255,255,0.25), 0 0 24px rgba(255,255,255,0.1), inset 0 0 8px rgba(255,255,255,0.04)',
                        }}
                      >
                        <Star
                          size={11}
                          fill="white"
                          className="text-white"
                          style={{ filter: 'drop-shadow(0 0 4px white)' }}
                        />
                        <span
                          className="text-[10px] font-black uppercase tracking-widest text-white"
                          style={{ textShadow: '0 0 8px rgba(255,255,255,0.8)' }}
                        >
                          Membre TCB
                        </span>
                      </div>
                    )}
                </div>
              )}

              <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 mb-6 text-sm">
                 <User size={14} /> {user?.email}
              </p>
              
              {/* Barre de progression */}
              {!isEditing && currentBelt.next && (
                  <div className="max-w-md mx-auto md:mx-0 mb-6">
                      <div className="flex justify-between text-xs text-slate-500 mb-1 font-mono uppercase">
                          <span>Progression vers {getBeltLevel(currentBelt.next).name}</span>
                          <span>{notes.length} / {currentBelt.next} notes</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                      </div>
                  </div>
              )}
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-slate-800 px-5 py-2 rounded-lg border border-slate-700">
                      <span className="block text-2xl font-bold text-white">{notes.length}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Notes prises</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-lg border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 text-slate-400 transition flex items-center gap-2 text-sm font-bold"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
              </div>
           </div>
        </div>

        {/* === SECTION NOTES === */}
        <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Mon Carnet de Notes</h2>
        </div>
        
         {notes.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={24} className="text-slate-500" />
                </div>
                <h3 className="text-white font-bold mb-2">Votre carnet est vide</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Prenez des notes pour monter en grade !
                </p>
                <Link href="/" className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition transform inline-flex items-center gap-2">
                    <Play size={16} fill="black" /> Explorer la bibliothèque
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.map((note) => (
                    <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition group flex flex-col shadow-lg">
                        <Link href={`/video/${note.video.id}`} className="bg-black/40 p-4 border-b border-slate-800 flex gap-4 items-center hover:bg-slate-800 transition">
                            <div className="relative w-20 h-12 rounded overflow-hidden shrink-0 border border-slate-700 shadow-md">
                                <img src={note.video.poster_url} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-sm truncate group-hover:text-yellow-400 transition">
                                    {note.video.title}
                                </h3>
                                <p className="text-slate-500 text-xs truncate">
                                    {note.video.competition_context || 'Technique'}
                                </p>
                            </div>
                        </Link>
                        <div className="p-5 flex-1 bg-slate-900/50 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono pl-2">
                                {note.content}
                            </p>
                        </div>
                        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 flex justify-between items-center">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {formatDate(note.updated_at)}
                            </span>
                            <Link href={`/video/${note.video.id}`} className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                                Modifier / Relire
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </main>
  );
}
'use client';

import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ShieldCheck, Users, Video, Check, X, Trash2, Plus,
  Pencil, ChevronDown, ChevronUp, Loader2, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import {
  approveTcbMember, rejectTcbMember,
  createVideo, updateVideo, deleteVideo,
} from './actions';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

interface TcbRequest {
  id: string;
  user_id: string;
  email: string;
  motivation: string;
  experience: string;
  gym: string;
  belt: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface VideoRow {
  id: string;
  title: string;
  url: string;
  poster_url: string;
  platform: string;
  competition_context: string | null;
  duration: number;
  description: string;
}

// ── Composant formulaire vidéo ──────────────────────────
function VideoForm({ video, onClose }: { video?: VideoRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (video) {
          await updateVideo(video.id, fd);
          toast.success('Vidéo mise à jour');
        } else {
          await createVideo(fd);
          toast.success('Vidéo ajoutée');
        }
        onClose();
      } catch {
        toast.error('Erreur lors de la sauvegarde');
      }
    });
  };

  const field = (name: string, label: string, defaultValue = '', placeholder = '', required = false, textarea = false) => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 resize-none focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-white text-lg">{video ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('title',               'Titre',               video?.title,               'Ex: Craig Jones vs ...',              true)}
          {field('url',                 'URL de la vidéo',     video?.url,                 'https://youtube.com/watch?v=...',     true)}
          {field('poster_url',          'URL Miniature',       video?.poster_url,          'https://img.youtube.com/...',        false)}
          {field('competition_context', 'Contexte compétition', video?.competition_context ?? '', 'Ex: ADCC 2017, Worlds...',   false)}
          {field('duration',            'Durée (secondes)',    String(video?.duration ?? 0), '360',                              false)}
          {field('description',         'Description',         video?.description,         '',                                   false, true)}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Plateforme</label>
            <select name="platform" defaultValue={video?.platform ?? 'youtube'}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition" style={{ border: '1px solid rgba(255,255,255,0.09)' }}>
              Annuler
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2"
              style={{ background: '#facc15', boxShadow: '0 0 16px rgba(250,204,21,0.25)' }}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {video ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'videos'>('requests');
  const [requests, setRequests] = useState<TcbRequest[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<{ open: boolean; video?: VideoRow }>({ open: false });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace('/');
        return;
      }
      setUser(user);

      const [{ data: reqs }, { data: vids }] = await Promise.all([
        supabase.from('tcb_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: true }),
      ]);

      setRequests((reqs as TcbRequest[]) ?? []);
      setVideos((vids as VideoRow[]) ?? []);
      setLoading(false);
    }
    init();
  }, [router]);

  const refreshData = async () => {
    const [{ data: reqs }, { data: vids }] = await Promise.all([
      supabase.from('tcb_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('videos').select('*').order('created_at', { ascending: true }),
    ]);
    setRequests((reqs as TcbRequest[]) ?? []);
    setVideos((vids as VideoRow[]) ?? []);
  };

  const handleApprove = (req: TcbRequest) => {
    startTransition(async () => {
      try {
        await approveTcbMember(req.id, req.user_id);
        toast.success(`${req.email} est maintenant membre TCB`);
        await refreshData();
      } catch { toast.error('Erreur lors de l\'approbation'); }
    });
  };

  const handleReject = (req: TcbRequest) => {
    startTransition(async () => {
      try {
        await rejectTcbMember(req.id);
        toast.success('Demande rejetée');
        await refreshData();
      } catch { toast.error('Erreur lors du rejet'); }
    });
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    startTransition(async () => {
      try {
        await deleteVideo(id);
        toast.success('Vidéo supprimée');
        await refreshData();
      } catch { toast.error('Erreur lors de la suppression'); }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const statusBadge = (status: TcbRequest['status']) => {
    const map = {
      pending:  { label: 'En attente', color: 'rgba(250,204,21,0.9)',  bg: 'rgba(250,204,21,0.1)',  icon: <Clock size={10} /> },
      approved: { label: 'Approuvé',   color: 'rgba(52,211,153,0.9)',  bg: 'rgba(52,211,153,0.1)',  icon: <CheckCircle size={10} /> },
      rejected: { label: 'Rejeté',     color: 'rgba(248,113,113,0.9)', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={10} /> },
    };
    const s = map[status];
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {videoForm.open && (
        <VideoForm
          video={videoForm.video}
          onClose={async () => { setVideoForm({ open: false }); await refreshData(); }}
        />
      )}

      <main className="max-w-6xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <ShieldCheck size={24} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Administration</h1>
            <p className="text-white/35 text-xs">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([
            { id: 'requests', label: 'Demandes TCB', icon: <Users size={14} />, badge: pendingCount },
            { id: 'videos',   label: 'Vidéos',       icon: <Video size={14} />, badge: videos.length },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(250,204,21,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === tab.id ? '#facc15' : 'rgba(255,255,255,0.5)',
              }}>
              {tab.icon} {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB : DEMANDES TCB ── */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 && (
              <div className="text-center py-16 text-white/25 text-sm rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                Aucune demande pour l'instant.
              </div>
            )}
            {requests.map(req => (
              <div key={req.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Ligne principale */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{req.email}</span>
                      {statusBadge(req.status)}
                    </div>
                    <p className="text-xs text-white/35 font-mono">
                      {req.belt} · {req.experience} · {req.gym}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand */}
                    <button onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                      className="p-2 rounded-lg text-white/40 hover:text-white transition"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {expandedRequest === req.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(req)} disabled={pending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all"
                          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                          <Check size={12} /> Approuver
                        </button>
                        <button onClick={() => handleReject(req)} disabled={pending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all"
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                          <X size={12} /> Rejeter
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Motivation étendue */}
                {expandedRequest === req.id && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-wider pt-3 mb-1">Motivation</p>
                    <p className="text-sm text-white/60 leading-relaxed">{req.motivation}</p>
                    <p className="text-xs text-white/25 mt-2 font-mono">
                      Soumis le {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB : VIDÉOS ── */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setVideoForm({ open: true })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black"
                style={{ background: '#facc15', boxShadow: '0 0 16px rgba(250,204,21,0.2)' }}>
                <Plus size={14} /> Ajouter une vidéo
              </button>
            </div>

            <div className="space-y-2">
              {videos.map(v => (
                <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {v.poster_url && (
                    <img src={v.poster_url} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0 border"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v.title}</p>
                    <p className="text-xs text-white/30 font-mono truncate">{v.competition_context ?? '—'} · {Math.floor(v.duration / 60)}min</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setVideoForm({ open: true, video: v })}
                      className="p-2 rounded-lg text-white/40 hover:text-yellow-400 transition"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteVideo(v.id, v.title)} disabled={pending}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 transition"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

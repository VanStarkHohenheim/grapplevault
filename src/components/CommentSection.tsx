'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Charger les commentaires et l'user
  useEffect(() => {
    fetchComments();
    getUser();
  }, [videoId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false }); // Plus récents en haut
    
    if (data) setComments(data);
  };

  // 2. Poster un commentaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from('comments').insert({
      content: newComment,
      video_id: videoId,
      user_id: user.id,
      user_email: user.email // On sauvegarde l'email pour l'affichage
    });

    if (!error) {
      setNewComment('');
      fetchComments(); // Rafraîchir la liste
    }
    setLoading(false);
  };

  // 3. Supprimer un commentaire
  const handleDelete = async (commentId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
        // Mise à jour optimiste de l'UI
        setComments(comments.filter(c => c.id !== commentId));
    }
  };

  // Helper pour formater la date (ex: "il y a 2 heures")
  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ans";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " jours";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "à l'instant";
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <MessageSquare className="text-yellow-400" size={20} />
        <h3 className="text-xl font-bold text-white">Discussion <span className="text-slate-500 text-sm font-normal">({comments.length})</span></h3>
      </div>

      {/* FORMULAIRE D'AJOUT */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold shrink-0">
                {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Posez une question ou partagez un détail technique..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-yellow-400 focus:outline-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                    <button 
                        type="submit" 
                        disabled={loading || !newComment.trim()}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Send size={14} /> Commenter
                    </button>
                </div>
            </div>
        </form>
      ) : (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-800 text-center mb-8">
            <p className="text-slate-400 mb-2">Connectez-vous pour rejoindre la discussion.</p>
            <Link href="/login" className="text-yellow-400 hover:underline font-bold text-sm">Se connecter</Link>
        </div>
      )}

      {/* LISTE DES COMMENTAIRES */}
      <div className="space-y-6">
        {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-700">
                    <User size={14} />
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            {/* On masque une partie de l'email pour la privacy */}
                            <span className="text-white font-bold text-sm">
                                {comment.user_email?.split('@')[0]}
                            </span>
                            <span className="text-slate-600 text-xs">
                                il y a {timeAgo(comment.created_at)}
                            </span>
                        </div>

                        {/* Bouton Supprimer (visible seulement pour l'auteur) */}
                        {user && user.id === comment.user_id && (
                            <button 
                                onClick={() => handleDelete(comment.id)}
                                className="text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
            </div>
        ))}

        {comments.length === 0 && (
            <p className="text-slate-600 text-sm italic">Aucun commentaire pour l'instant. Soyez le premier !</p>
        )}
      </div>
    </div>
  );
}
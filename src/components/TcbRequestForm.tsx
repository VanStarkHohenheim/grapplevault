'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Clock, CheckCircle, Star, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
  userEmail: string;
}

type FormState = 'loading' | 'idle' | 'submitting' | 'submitted';

const BELT_OPTIONS = [
  'Ceinture Blanche',
  'Ceinture Bleue',
  'Ceinture Violette',
  'Ceinture Marron',
  'Ceinture Noire',
];

const EXPERIENCE_OPTIONS = [
  'Moins de 6 mois',
  '6 mois – 1 an',
  '1 – 3 ans',
  '3 – 5 ans',
  '5 ans et plus',
];

export default function TcbRequestForm({ userId, userEmail }: Props) {
  const [formState, setFormState] = useState<FormState>('loading');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [gym, setGym] = useState('');
  const [belt, setBelt] = useState('');

  // Vérifie si une demande est déjà en attente
  useEffect(() => {
    async function checkExistingRequest() {
      const { data } = await supabase
        .from('tcb_requests')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      if (data) {
        setFormState('submitted');
      } else {
        setFormState('idle');
      }
    }
    checkExistingRequest();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivation.trim() || !experience || !belt) {
      toast.error('Merci de remplir tous les champs obligatoires.');
      return;
    }

    setFormState('submitting');

    const { error } = await supabase.from('tcb_requests').insert({
      user_id: userId,
      email: userEmail,
      motivation: motivation.trim(),
      experience,
      gym: gym.trim() || 'Non renseigné',
      belt,
      status: 'pending',
    });

    if (error) {
      toast.error('Erreur lors de l\'envoi. Réessaie.');
      setFormState('idle');
    } else {
      toast.success('Demande envoyée ! On reviendra vers toi.');
      setFormState('submitted');
    }
  };

  // — Chargement
  if (formState === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
      </div>
    );
  }

  // — Demande déjà envoyée
  if (formState === 'submitted') {
    return (
      <div className="text-center py-16 px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', boxShadow: '0 0 30px rgba(250,204,21,0.1)' }}
        >
          <Clock size={36} className="text-yellow-400" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3">Demande en attente</h3>
        <p className="text-white/50 max-w-sm mx-auto text-sm leading-relaxed">
          Ta candidature a bien été reçue. Un coach TCB examinera ta demande et t'informera par email.
        </p>
        <div
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: 'rgba(250,204,21,0.8)' }}
        >
          <CheckCircle size={12} /> Candidature soumise
        </div>
      </div>
    );
  }

  // — Formulaire
  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header formulaire */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 24px rgba(239,68,68,0.1)' }}
        >
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Rejoindre le TCB</h2>
        <p className="text-white/45 text-sm leading-relaxed">
          L'accès aux archives TCB est réservé aux membres du club. Remplis ce formulaire pour faire ta demande d'intégration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Motivation */}
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Pourquoi veux-tu rejoindre le TCB ? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={4}
            placeholder="Parle-nous de ta motivation, ce que tu espères apprendre..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none transition"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(8px)' }}
            onFocus={(e) => e.currentTarget.style.border = '1px solid rgba(250,204,21,0.4)'}
            onBlur={(e) => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)'}
          />
        </div>

        {/* Expérience */}
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Depuis combien de temps pratiques-tu ? <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setExperience(opt)}
                className="px-3 py-2 rounded-full text-xs font-bold transition-all"
                style={{
                  background: experience === opt ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.05)',
                  border: experience === opt ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.09)',
                  color: experience === opt ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Ceinture */}
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Ta ceinture actuelle <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BELT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setBelt(opt)}
                className="px-3 py-2 rounded-full text-xs font-bold transition-all"
                style={{
                  background: belt === opt ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.05)',
                  border: belt === opt ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.09)',
                  color: belt === opt ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Gym */}
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Ton club / académie <span className="text-white/25">(optionnel)</span>
          </label>
          <input
            type="text"
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            placeholder="Ex: TCB Grappling, Alliance, Gracie Barra..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(8px)' }}
            onFocus={(e) => e.currentTarget.style.border = '1px solid rgba(250,204,21,0.4)'}
            onBlur={(e) => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)'}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="w-full py-3.5 rounded-xl font-black text-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          style={{
            background: formState === 'submitting' ? 'rgba(250,204,21,0.5)' : '#facc15',
            boxShadow: formState === 'submitting' ? 'none' : '0 0 20px rgba(250,204,21,0.3)',
          }}
        >
          {formState === 'submitting' ? (
            <><div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" /> Envoi en cours...</>
          ) : (
            <><Send size={16} /> Envoyer ma candidature</>
          )}
        </button>

      </form>
    </div>
  );
}

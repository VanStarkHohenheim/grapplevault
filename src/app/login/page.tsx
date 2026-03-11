'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

// Icône dé SVG
function DiceIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="8"  cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8"  cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function generateSecurePassword(): string {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*-_=+?';
  const all = upper + lower + digits + special;

  const arr = new Uint32Array(16);
  crypto.getRandomValues(arr);

  // Garantit au moins 1 de chaque catégorie
  const chars = [
    upper[arr[0] % upper.length],
    upper[arr[1] % upper.length],
    lower[arr[2] % lower.length],
    lower[arr[3] % lower.length],
    digits[arr[4] % digits.length],
    digits[arr[5] % digits.length],
    special[arr[6] % special.length],
    ...Array.from({ length: 9 }, (_, i) => all[arr[7 + i] % all.length]),
  ];

  // Mélange Fisher-Yates
  const mix = new Uint32Array(chars.length);
  crypto.getRandomValues(mix);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = mix[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

// Jauge de force
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Très faible', color: '#ef4444' },
    { label: 'Faible',      color: '#f97316' },
    { label: 'Moyen',       color: '#eab308' },
    { label: 'Fort',        color: '#22c55e' },
    { label: 'Très fort',   color: '#10b981' },
  ];
  const level = levels[Math.min(score, 4)];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {levels.map((l, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score - 1 ? level.color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold" style={{ color: level.color }}>{level.label}</p>
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [diceSpinning, setDiceSpinning] = useState(false);
  const router = useRouter();

  const switchMode = (m: Mode) => {
    setMode(m);
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleGeneratePassword = () => {
    setDiceSpinning(true);
    const pwd = generateSecurePassword();
    setPassword(pwd);
    setConfirm(pwd);
    setShowPassword(true);
    setShowConfirm(true);
    toast.success('Mot de passe généré — pense à le sauvegarder !', { duration: 4000 });
    setTimeout(() => setDiceSpinning(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      if (password.length < 8) {
        toast.error('Le mot de passe doit faire au moins 8 caractères.');
        return;
      }
      if (password !== confirm) {
        toast.error('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error('Email ou mot de passe incorrect.');
      } else {
        toast.success('Bienvenue !');
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Cet email est déjà utilisé. Connecte-toi.');
          switchMode('login');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Compte créé ! Vérifie ton email pour confirmer.');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast.error('Erreur avec Google : ' + error.message);
      setGoogleLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
  };
  const focusStyle  = '1px solid rgba(250,204,21,0.4)';
  const blurStyle   = '1px solid rgba(255,255,255,0.09)';
  const errorStyle  = '1px solid rgba(248,113,113,0.5)';

  const confirmMismatch = mode === 'register' && confirm.length > 0 && password !== confirm;

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(250,204,21,0.06) 0%, transparent 60%)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
            Grapple<span className="text-yellow-400">Vault</span>
          </h1>
          <p className="text-white/35 text-xs">
            {mode === 'login' ? 'Connecte-toi à ton compte' : 'Crée ton compte gratuitement'}
          </p>
        </div>

        {/* Toggle */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              style={{
                background: mode === m ? 'rgba(250,204,21,0.12)' : 'transparent',
                border: mode === m ? '1px solid rgba(250,204,21,0.3)' : '1px solid transparent',
                color: mode === m ? '#facc15' : 'rgba(255,255,255,0.35)',
              }}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.border = focusStyle)}
              onBlur={e  => (e.currentTarget.style.border = blurStyle)}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Mot de passe</label>
              {mode === 'register' && (
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  title="Générer un mot de passe sécurisé"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: 'rgba(250,204,21,0.08)',
                    border: '1px solid rgba(250,204,21,0.2)',
                    color: 'rgba(250,204,21,0.7)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(250,204,21,0.14)';
                    e.currentTarget.style.color = '#facc15';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(250,204,21,0.08)';
                    e.currentTarget.style.color = 'rgba(250,204,21,0.7)';
                  }}
                >
                  <DiceIcon
                    className={diceSpinning ? 'animate-spin' : ''}
                  />
                  Générer
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none transition font-mono"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.border = focusStyle)}
                onBlur={e  => (e.currentTarget.style.border = blurStyle)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {mode === 'register' && <PasswordStrength password={password} />}
          </div>

          {/* Confirmation — inscription seulement */}
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none transition font-mono"
                  style={{ ...inputStyle, border: confirmMismatch ? errorStyle : inputStyle.border }}
                  onFocus={e => (e.currentTarget.style.border = confirmMismatch ? errorStyle : focusStyle)}
                  onBlur={e  => (e.currentTarget.style.border = confirmMismatch ? errorStyle : blurStyle)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmMismatch && (
                <p className="text-[10px] font-bold mt-1 ml-1" style={{ color: '#f87171' }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-black text-black flex items-center justify-center gap-2 transition-all mt-2"
            style={{
              background: loading ? 'rgba(250,204,21,0.5)' : '#facc15',
              boxShadow: loading ? 'none' : '0 0 20px rgba(250,204,21,0.25)',
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-[11px] text-white/25 font-bold uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-3 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          {googleLoading ? (
            <Loader2 size={15} className="animate-spin text-white/50" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continuer avec Google
        </button>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/25 text-xs hover:text-white/60 transition">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

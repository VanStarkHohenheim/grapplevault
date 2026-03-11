'use client';

import { useState } from 'react';
import { Trophy, Star, X, ChevronRight } from 'lucide-react';

interface Fighter {
  id: string;
  name: string;
  nickname: string;
  countryCode: string; // code ISO 2 lettres, ex: "br", "us", "au"
  weight: string;
  specialty: string[];
  bio: string;
  achievements: string[];
  photo: string;        // URL de la photo — laisser vide pour le fallback dégradé
  gradient: string;     // fallback si pas de photo
  accentColor: string;
}

const FIGHTERS: Fighter[] = [
  {
    id: 'marcelo-garcia',
    name: 'Marcelo Garcia',
    nickname: 'The Gentleman',
    countryCode: 'br',
    weight: '76 kg',
    specialty: ['X-Guard', 'Butterfly', 'Guillotine', 'RNC'],
    bio: "Inventeur de l'X-Guard et maître incontesté du guillotine choke, Marcelo Garcia est souvent cité comme le plus grand grappleur de tous les temps. Son jeu offensif fluide et sa capacité à soumettre des adversaires bien plus grands restent une référence absolue.",
    achievements: [
      '5× Champion du Monde ADCC',
      '4× Champion du Monde IBJJF',
      '2× ADCC Absolute Champion',
      'Inducted into ADCC Hall of Fame',
    ],
    photo: 'https://jijibfight.com/wp-content/uploads/2024/12/Marcelo_Garcia_JJB-681x1024.jpg',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #14532d 100%)',
    accentColor: '#34d399',
  },
  {
    id: 'leandro-lo',
    name: 'Leandro Lo',
    nickname: 'The Passing Machine',
    countryCode: 'br',
    weight: 'Multiple poids',
    specialty: ['Guard Passing', 'Pressure Game', 'Leg Drag', 'Berimbolo'],
    bio: "Légende absolue du Gi, Leandro Lo est le seul athlète à avoir remporté le titre mondial IBJJF à 5 catégories de poids différentes. Son passing était d'une précision chirurgicale, combinant pression et fluidité de façon unique.",
    achievements: [
      '8× Champion du Monde IBJJF',
      'Victoire à 5 poids différents',
      'Pan American Champion',
      'Copa Podio Champion',
    ],
    photo: 'https://i.pinimg.com/736x/8c/de/49/8cde494485ba828f006102c49fd514c6.jpg',
    gradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #7c2d12 100%)',
    accentColor: '#fbbf24',
  },
  {
    id: 'paulo-miyao',
    name: 'Paulo Miyao',
    nickname: 'The Berimbolo King',
    countryCode: 'br',
    weight: '64 kg',
    specialty: ['Berimbolo', 'De La Riva', 'Back Takes', 'Lapel Guard'],
    bio: "Avec son frère João, Paulo Miyao a révolutionné le jeu offensif du JJB moderne. Son berimbolo coordonné avec son frère a changé la façon dont toute une génération perçoit les positions inversées et les transitions au sol.",
    achievements: [
      '2× ADCC Médaillé',
      '5× Champion du Monde IBJJF',
      'No-Gi Worlds Champion',
      'Pans Champion multiple fois',
    ],
    photo: 'https://promixnutrition.com/cdn/shop/articles/athlete-paulo-miyao_600x.png?v=1617642606',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)',
    accentColor: '#60a5fa',
  },
  {
    id: 'craig-jones',
    name: 'Craig Jones',
    nickname: 'The Wizard',
    countryCode: 'au',
    weight: '88 kg',
    specialty: ['Heel Hooks', 'Kimura', 'Leg Entanglements', 'Inside Heel Hook'],
    bio: "Australien au style avant-gardiste, Craig Jones a démocratisé le jeu de leg locks offensif à haut niveau. Sa victoire sur Leandro Lo à l'ADCC 2017 reste l'un des grands chocs de l'histoire du grappling. Co-fondateur de la B-Team.",
    achievements: [
      'ADCC 2017 Silver Medal',
      'EBI Champion',
      'Fondateur B-Team Jiu-Jitsu',
      'Multiples victoires WNO',
    ],
    photo: 'https://preview.redd.it/craig-jones-poster-v0-8ughftepqdze1.jpeg?width=640&crop=smart&auto=webp&s=0941ca01fdb6f520c73784c606ec4d8f6ba10f69',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    accentColor: '#f87171',
  },
  {
    id: 'gordon-ryan',
    name: 'Gordon Ryan',
    nickname: 'The King',
    countryCode: 'us',
    weight: '88 kg / 99 kg',
    specialty: ['Back Takes', 'Leg Locks', 'Neck Cranks', 'Turtle Guard'],
    bio: "Considéré comme le meilleur grappleur No-Gi de l'histoire, Gordon Ryan domine la scène ADCC depuis 2017. Sa polyvalence totale et sa série d'invincibilité sur près de 6 ans définissent une ère.",
    achievements: [
      '3× Champion du Monde ADCC',
      '2× ADCC Absolute Champion',
      'Invaincu en submission-only (2017-2023)',
      'Multiples titres WNO',
    ],
    photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwNO1KM67mLYt6kDapP_hS92F8StPNDlRT1A&s',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    accentColor: '#94a3b8',
  },
  {
    id: 'buchecha',
    name: 'Marcus Buchecha',
    nickname: 'Buchecha',
    countryCode: 'br',
    weight: 'Super Lourd',
    specialty: ['Pressure', 'Top Game', 'Passes de force', 'Leg Locks'],
    bio: "Dominant dans la catégorie des poids lourds, Buchecha a redéfini ce que signifie être un super lourd en JJB : technique, athlétique et complet. Son record de 13 titres mondiaux IBJJF reste à ce jour inégalé.",
    achievements: [
      '13× Champion du Monde IBJJF — record absolu',
      'ADCC Champion',
      'Multiple Absolute Champion',
      'Pan American Champion',
    ],
    photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7MtffMO_hI5BKAcgWH4FUJH8GkzynH8UfUg&s',
    gradient: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 50%, #5b21b6 100%)',
    accentColor: '#c084fc',
  },
  {
    id: 'roger-gracie',
    name: 'Roger Gracie',
    nickname: 'The Master',
    countryCode: 'br',
    weight: 'Absolute',
    specialty: ['Mount', 'Cross Choke', 'Back Takes', 'Fundamentals'],
    bio: "Petit-fils de Carlos Gracie, Roger est souvent qualifié de joueur de JJB le plus complet de l'histoire. Il a prouvé qu'un jeu ultra-fondamental — sa spécialité étant la croix d'étranglement depuis la monte — peut dominer les meilleurs au monde.",
    achievements: [
      '10× Champion du Monde IBJJF',
      '2× ADCC Absolute Champion',
      'Élu meilleur athlète ADCC de la décennie',
      'UFC Fighter invaincu en MMA',
    ],
    photo: 'https://bjj-rules.com/wp-content/uploads/2025/08/roger-gracie-e1760944088924.webp',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)',
    accentColor: '#e5e7eb',
  },
];

function Flag({ countryCode }: { countryCode: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      width={24}
      height={16}
      alt={countryCode.toUpperCase()}
      className="rounded-sm object-cover shadow-sm"
      style={{ border: '1px solid rgba(255,255,255,0.2)' }}
    />
  );
}

function FighterCard({ fighter }: { fighter: Fighter }) {
  const [flipped, setFlipped] = useState(false);
  const hasPhoto = !!fighter.photo;

  return (
    <div
      className="snap-center shrink-0 w-[260px] md:w-[280px] cursor-pointer select-none"
      style={{ perspective: '1200px', height: '400px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >

        {/* ══════════════════════════════════
            FACE AVANT
        ══════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          {/* ── Fond : photo ou dégradé ── */}
          {hasPhoto ? (
            <img
              src={fighter.photo}
              alt={fighter.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: fighter.gradient }} />
          )}

          {/* ── Overlay dégradé bas → opaque pour la lisibilité ── */}
          <div
            className="absolute inset-0"
            style={{
              background: hasPhoto
                ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
            }}
          />

          {/* ── Highlight spéculaire haut ── */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '40%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)',
            }}
          />

          {/* ── Drapeau haut droite ── */}
          <div className="absolute top-4 right-4 z-10">
            <Flag countryCode={fighter.countryCode} />
          </div>

          {/* ── Texte bas de carte ── */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            {/* Tags spécialité */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {fighter.specialty.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${fighter.accentColor}45`,
                    color: fighter.accentColor,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="text-xs font-semibold mb-0.5" style={{ color: fighter.accentColor }}>
              "{fighter.nickname}"
            </p>
            <h3 className="text-xl font-black text-white leading-tight mb-1">
              {fighter.name}
            </h3>
            <p className="text-xs text-white/45 font-mono mb-3">{fighter.weight}</p>

            {/* Hint flip */}
            <div
              className="flex items-center gap-1 w-fit px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <ChevronRight size={12} className="text-white/60" />
              <span className="text-[10px] text-white/60 font-medium">Palmarès</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            FACE ARRIÈRE
        ══════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '20px',
            overflow: 'hidden',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            background: 'rgba(5,5,13,0.88)',
            border: `1px solid ${fighter.accentColor}28`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 40px ${fighter.accentColor}12`,
          }}
        >
          {/* Orbe lumière fond */}
          <div
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '-30px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${fighter.accentColor}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div className="relative h-full flex flex-col p-5" style={{ zIndex: 1 }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flag countryCode={fighter.countryCode} />
                <div>
                  <h3 className="font-black text-white text-sm leading-tight">{fighter.name}</h3>
                  <p className="text-[10px]" style={{ color: fighter.accentColor }}>"{fighter.nickname}"</p>
                </div>
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <X size={10} className="text-white/50" />
              </div>
            </div>

            {/* Séparateur */}
            <div className="mb-3" style={{ height: '1px', background: `linear-gradient(to right, ${fighter.accentColor}30, transparent)` }} />

            {/* Bio */}
            <p className="text-white/60 text-[11px] leading-relaxed mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {fighter.bio}
            </p>

            {/* Palmarès */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Trophy size={11} style={{ color: fighter.accentColor }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: fighter.accentColor }}>
                  Palmarès
                </span>
              </div>
              <ul className="space-y-1.5">
                {fighter.achievements.map((a) => (
                  <li key={a} className="flex items-start gap-2">
                    <Star size={9} className="mt-0.5 shrink-0" style={{ color: fighter.accentColor }} fill={fighter.accentColor} />
                    <span className="text-[11px] text-white/65 leading-snug">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FighterCarousel() {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
        {FIGHTERS.map((fighter) => (
          <FighterCard key={fighter.id} fighter={fighter} />
        ))}
      </div>
      {/* Fade droite mobile */}
      <div
        className="absolute top-0 right-0 w-16 h-full pointer-events-none md:hidden"
        style={{ background: 'linear-gradient(to left, #05050d, transparent)' }}
      />
    </div>
  );
}

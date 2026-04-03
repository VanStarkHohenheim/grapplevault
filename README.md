# 🥋 GrappleVault

> Plateforme VOD & e-learning dédiée au Jiu-Jitsu Brésilien (BJJ) — Projet d'étude

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📌 Présentation

**GrappleVault** est une application web fullstack développée dans le cadre d'un projet d'étude. Elle permet aux pratiquants de BJJ de consulter une bibliothèque de vidéos de compétitions, de sauvegarder leurs favoris, de laisser des commentaires, de prendre des notes et d'accéder à un espace exclusif réservé aux membres du club TCB.

L'interface suit un langage visuel **Liquid Glass** (glassmorphism) et a été entièrement développée avec l'assistance d'outils d'IA générative intégrés dans VS Code.

---

## 🤖 Outils d'IA utilisés dans le développement

Ce projet a été développé avec l'assistance de deux agents IA intégrés dans **Visual Studio Code** :

### 🔵 Claude Code (Anthropic) — via extension VS Code
- Génération et refactoring de composants React/TypeScript
- Mise en place de l'authentification (email/password + Google OAuth)
- Création du système TCB (questionnaire, accès conditionnel, badge membre)
- Débogage (filtres, RLS Supabase, flux OAuth)
- Rédaction de ce README

### 🟡 Gemini (Google) — via extension VS Code
- Assistance à la conception de l'architecture BDD
- Suggestions de structure de composants
- Recherche de solutions techniques

> Les outils IA ont joué un rôle d'**assistants techniques**. Les décisions d'architecture, de design et de fonctionnalités sont restées sous contrôle humain.

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Routing, SSR, Server Actions |
| Langage | **TypeScript 5** | Typage statique |
| Style | **Tailwind CSS v4** | Utility-first CSS |
| Backend / BDD | **Supabase** | Auth, PostgreSQL, Storage, RLS |
| UI | **Lucide React** | Icônes |
| Animations | **Framer Motion** | Transitions |
| Notifications | **Sonner** | Toast notifications |
| Lecteur vidéo | **React Player** | YouTube / Vimeo |
| Effets | **Canvas Confetti** | Célébration |

---

## 🗄️ Schéma de la base de données

```
┌─────────────────────────────────────────────────────────────────┐
│                     auth.users  (Supabase)                      │
│                                                                 │
│  id            uuid  PK                                         │
│  email         text                                             │
│  user_metadata {                                                │
│    tcb_member  boolean  ← accès espace TCB exclusif             │
│    avatar_url  text                                             │
│    full_name   text                                             │
│  }                                                              │
└────┬───────────────────────────┬──────────────┬────────────────┘
     │ FK cascade                │ FK cascade   │ FK cascade
     ▼                           ▼              ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  tcb_requests    │  │    favorites     │  │   user_notes    │
│                  │  │                  │  │                 │
│  id         uuid │  │  id        uuid  │  │  id        uuid │
│  user_id    uuid │  │  user_id   uuid  │  │  user_id   uuid │
│  email      text │  │  video_id  uuid──┼─►│  video_id  uuid │
│  motivation text │  │  created_at      │  │  content   text │
│  experience text │  └──────────────────┘  │  created_at     │
│  belt       text │                        └─────────────────┘
│  gym        text │  ┌──────────────────┐
│  status     text │  │    comments      │
│   pending        │  │                  │
│   approved       │  │  id        uuid  │
│   rejected       │  │  user_id   uuid  │
│  created_at      │  │  video_id  uuid──┼─►┐
└──────────────────┘  │  content   text  │  │
                      │  created_at      │  │
                      └──────────────────┘  │
                                            │
┌───────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                           videos                                │
│                                                                 │
│  id                  uuid   PK                                  │
│  title               text   — Titre de la vidéo                 │
│  description         text   — Description / contexte technique  │
│  url                 text   — URL YouTube (watch?v=...)         │
│  poster_url          text   — URL miniature YouTube             │
│  platform            text   — "youtube" | "vimeo"              │
│  competition_context text   — ex: "ADCC 2017", "Worlds 2019"   │
│  duration            integer — durée en secondes                │
│  created_at          timestamptz                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           segments                              │
│  (timestamps cliquables dans le lecteur vidéo)                  │
│                                                                 │
│  id          uuid   PK                                          │
│  video_id    uuid   FK → videos                                 │
│  label       text   — ex: "Entrée en single leg"                │
│  start_time  integer — en secondes                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentification & niveaux d'accès

| Rôle | Accès |
|---|---|
| Visiteur non connecté | Catalogue vidéos public, Hall of Fame |
| Utilisateur connecté | + Favoris, commentaires, notes, profil |
| Membre TCB | + Espace vidéos exclusif TCB |

---

## 🚀 Installation locale — Guide complet

### Prérequis

- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 9 (inclus avec Node.js)
- Un compte **Supabase** gratuit — [supabase.com](https://supabase.com)

---

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/VanStarkHohenheim/grapplevault.git
cd grapplevault
npm install
```

---

### Étape 2 — Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Choisis un nom, un mot de passe et une région (ex: West EU)
3. Attends la création (~1 min)
4. Va dans **Project Settings → Data API** et note :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ ne jamais exposer côté client

---

### Étape 3 — Créer la base de données

Dans Supabase → **SQL Editor**, copie-colle et exécute ce script complet :

```sql
-- ══════════════════════════════════════════════
--  TABLE : videos
-- ══════════════════════════════════════════════
create table if not exists public.videos (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  url                 text not null,
  poster_url          text,
  platform            text not null default 'youtube',
  competition_context text,
  duration            integer default 0,
  created_at          timestamptz default now()
);

-- ══════════════════════════════════════════════
--  TABLE : segments (timestamps vidéo)
-- ══════════════════════════════════════════════
create table if not exists public.segments (
  id          uuid primary key default gen_random_uuid(),
  video_id    uuid references public.videos(id) on delete cascade,
  label       text not null,
  start_time  integer not null default 0
);

-- ══════════════════════════════════════════════
--  TABLE : favorites
-- ══════════════════════════════════════════════
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  video_id   uuid references public.videos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

-- ══════════════════════════════════════════════
--  TABLE : comments
-- ══════════════════════════════════════════════
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  video_id   uuid references public.videos(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════
--  TABLE : user_notes
-- ══════════════════════════════════════════════
create table if not exists public.user_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  video_id   uuid references public.videos(id) on delete cascade,
  content    text not null default '',
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

-- ══════════════════════════════════════════════
--  TABLE : tcb_requests
-- ══════════════════════════════════════════════
create table if not exists public.tcb_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  email       text not null,
  motivation  text not null,
  experience  text not null,
  gym         text,
  belt        text not null,
  status      text not null default 'pending',
  created_at  timestamptz default now()
);

-- ══════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ══════════════════════════════════════════════
alter table public.videos        enable row level security;
alter table public.segments      enable row level security;
alter table public.favorites     enable row level security;
alter table public.comments      enable row level security;
alter table public.user_notes    enable row level security;
alter table public.tcb_requests  enable row level security;

-- Videos : lecture publique
create policy "videos_read_public"
  on public.videos for select using (true);

-- Segments : lecture publique
create policy "segments_read_public"
  on public.segments for select using (true);

-- Favorites : accès à ses propres favoris
create policy "favorites_select_own"
  on public.favorites for select to authenticated using (auth.uid() = user_id);
create policy "favorites_insert_own"
  on public.favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "favorites_delete_own"
  on public.favorites for delete to authenticated using (auth.uid() = user_id);

-- Comments : lecture publique, écriture authentifiée
create policy "comments_read_public"
  on public.comments for select using (true);
create policy "comments_insert_auth"
  on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comments_delete_own"
  on public.comments for delete to authenticated using (auth.uid() = user_id);

-- User notes : strictement privées
create policy "notes_select_own"
  on public.user_notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert_own"
  on public.user_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_update_own"
  on public.user_notes for update to authenticated using (auth.uid() = user_id);

-- TCB requests : accès à sa propre demande
create policy "tcb_select_own"
  on public.tcb_requests for select to authenticated using (auth.uid() = user_id);
create policy "tcb_insert_own"
  on public.tcb_requests for insert to authenticated with check (auth.uid() = user_id);
```

---

### Étape 4 — Configurer les variables d'environnement

Crée un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### Étape 5 — Peupler la base de données depuis YouTube

Le peuplement se fait via un **script à coller dans la console du navigateur** sur la page de la playlist. Aucune clé API n'est nécessaire.

#### Instructions

1. Ouvre la playlist YouTube dans ton navigateur :
   **https://youtube.com/playlist?list=PLt3jppIFiNQCKNicEB625FISr-zAAr3Hz**

2. **Fais défiler la page jusqu'en bas** pour que toutes les vidéos se chargent

3. Ouvre les outils développeur : **F12 → onglet Console**

4. Ouvre le fichier `scripts/youtube-playlist-to-sql.js` (inclus dans le projet), copie tout son contenu et colle-le dans la console, puis appuie sur **Entrée**

5. Le script génère automatiquement un bloc SQL et tente de le **copier dans le presse-papier**

6. Va dans **Supabase Dashboard → SQL Editor**, colle le SQL et clique **Run**

> Le script extrait le titre, l'URL, la miniature et la durée de chaque vidéo visible sur la page. Les vidéos privées ou supprimées sont ignorées automatiquement.

---

### Étape 6 — Créer un compte

1. Lance le serveur : `npm run dev`
2. Va sur `http://localhost:3000/login`
3. Onglet **Inscription** → entre ton email + mot de passe

> ⚠️ **Confirmation email** : après l'inscription, Supabase envoie un email de confirmation. **Rien ne se passe sur la page tant que l'email n'est pas validé** — c'est normal. Ouvre ta boîte mail, clique sur le lien de confirmation, puis reviens sur `/login` pour te connecter.
>
> Pour désactiver cette étape en développement local : **Authentication → Providers → Email → désactiver "Confirm email"**.

> La gestion des membres TCB (approbation des demandes) se fait directement dans **Supabase Dashboard → Table Editor → tcb_requests**, en passant le champ `status` à `approved` et en modifiant le `user_metadata` de l'utilisateur concerné.

---

### Étape 7 — Lancer l'application

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
grapplevault/
├── scripts/
│   └── youtube-playlist-to-sql.js  # Script console navigateur → génère le SQL d'import
├── src/
│   ├── app/
│   │   ├── page.tsx              # Accueil — catalogue + filtres par championnat
│   │   ├── layout.tsx            # Layout global (orbes, Toaster)
│   │   ├── globals.css           # Design system Liquid Glass
│   │   ├── login/page.tsx        # Connexion / Inscription + Google OAuth
│   │   ├── profile/page.tsx      # Profil + badge TCB neon
│   │   ├── favorites/page.tsx    # Vidéos favorites
│   │   ├── hall-of-fame/page.tsx # Légendes BJJ (carrousel 3D)
│   │   ├── secret-tcb/page.tsx   # Espace membres TCB
│   │   └── video/[id]/page.tsx   # Page vidéo individuelle
│   ├── components/
│   │   ├── Header.tsx            # Navigation + drawer mobile
│   │   ├── VideoCard.tsx         # Carte vidéo glass
│   │   ├── VideoPlayer.tsx       # Lecteur avec timestamps cliquables
│   │   ├── FighterCarousel.tsx   # Carrousel Hall of Fame (flip 3D)
│   │   ├── TcbRequestForm.tsx    # Questionnaire demande TCB
│   │   ├── FavoriteButton.tsx    # Bouton favori animé
│   │   ├── CommentSection.tsx    # Commentaires par vidéo
│   │   ├── NoteTaker.tsx         # Notes personnelles
│   │   ├── SearchBar.tsx         # Recherche plein texte
│   │   └── AvatarUploader.tsx    # Upload avatar (Supabase Storage)
│   └── lib/
│       └── supabase.ts           # Client Supabase (public, côté client)
└── .env.local                    # Variables d'environnement (non versionné)
```

---

## 📱 Fonctionnalités principales

- 🎬 Catalogue vidéos avec filtres par championnat (Worlds, ADCC, Europeans, Brasileiros, Pan Ams, Open)
- 🔍 Recherche plein texte (titre + description + contexte)
- ⭐ Système de favoris
- 💬 Commentaires par vidéo
- 📝 Notes personnelles liées à chaque vidéo
- 🏆 Hall of Fame — 7 légendes BJJ en carrousel 3D interactif
- 🔒 Espace TCB avec système de candidature par questionnaire

---

## 🎨 Design System — Liquid Glass

- `backdrop-filter: blur() saturate()` pour les fonds translucides
- Pseudo-élément `::before` pour les highlights spéculaires
- Orbes de lumière animés en position fixe (fond)
- Palette : `#05050D` (fond) + `#facc15` (accent or)
- Animations CSS 3D : `rotateY`, `backface-visibility`, `transform-style: preserve-3d`

---

## 👨‍🎓 Contexte académique

Ce projet illustre la mise en pratique de :

- Architecture **fullstack moderne** avec Next.js 16 App Router et Server Actions
- Gestion de l'**authentification multi-méthode** et des **autorisations par niveaux** (RLS PostgreSQL)
- Intégration d'un **BaaS** (Supabase) comme alternative à un backend custom
- Automatisation de la **collecte de données** via script console navigateur
- Conception d'une **UI/UX cohérente** avec un design system custom
- Usage responsable des **IA génératives** comme outils de développement augmenté

---

*Développé avec l'assistance de Claude Code (Anthropic) & Gemini (Google) via VS Code*

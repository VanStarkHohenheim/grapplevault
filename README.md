# 🥋 GrappleVault

> Plateforme VOD & e-learning dédiée au Jiu-Jitsu Brésilien (BJJ) — Projet d'étude

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📌 Présentation

**GrappleVault** est une application web fullstack développée dans le cadre d'un projet d'étude. Elle permet aux pratiquants de BJJ de consulter une bibliothèque de vidéos de compétitions, de sauvegarder leurs favoris, de laisser des commentaires et d'accéder à un espace exclusif réservé aux membres du club TCB.

Le projet a été conçu avec une UI **Liquid Glass** inspirée des tendances design modernes (glassmorphism), et développé en autonomie assistée par des outils d'IA générative.

---

## 🤖 Outils d'IA utilisés dans le développement

Ce projet a été développé avec l'assistance de deux agents IA intégrés directement dans l'environnement de développement **Visual Studio Code** :

### 🔵 Claude Code (Anthropic) — via extension VS Code
- Génération et refactoring de composants React/TypeScript complexes
- Mise en place du système d'authentification Supabase (email/password + Google OAuth)
- Création du panel d'administration (Server Actions, CRUD vidéos, gestion TCB)
- Débogage de logique métier (filtres, RLS Supabase, flux OAuth)
- Rédaction de ce README

### 🟡 Gemini (Google) — via extension VS Code
- Assistance à la conception de l'architecture de la base de données
- Suggestions de structure de composants
- Recherche de solutions techniques et documentation

> L'utilisation de ces outils s'inscrit dans une démarche de **développement augmenté** : les IA ont joué le rôle d'assistants techniques, tandis que les décisions d'architecture, de design et de fonctionnalités sont restées sous contrôle humain.

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Routing, SSR, Server Actions |
| Langage | **TypeScript 5** | Typage statique |
| Style | **Tailwind CSS v4** | Utility-first CSS |
| Backend / BDD | **Supabase** | Auth, PostgreSQL, Storage, RLS |
| UI Components | **Lucide React** | Icônes |
| Animations | **Framer Motion** | Transitions et animations |
| Notifications | **Sonner** | Toast notifications |
| Lecteur vidéo | **React Player** | Lecture YouTube / Vimeo |
| Effets visuels | **Canvas Confetti** | Effets de célébration |

---

## 🗄️ Schéma de la base de données

```
┌─────────────────────────────────────────────────────────────────┐
│                     auth.users  (Supabase)                      │
│                                                                 │
│  id            uuid  PK                                         │
│  email         text                                             │
│  user_metadata {                                                │
│    tcb_member  boolean  ← donne accès à l'espace TCB            │
│    avatar_url  text                                             │
│    full_name   text                                             │
│  }                                                              │
└────┬──────────────────────────────┬───────────────┬────────────┘
     │ FK (cascade)                 │ FK (cascade)  │ FK (cascade)
     ▼                              ▼               ▼
┌─────────────────┐    ┌────────────────────┐  ┌────────────────┐
│  tcb_requests   │    │     favorites      │  │   user_notes   │
│                 │    │                    │  │                │
│  id        uuid │    │  id          uuid  │  │  id       uuid │
│  user_id   uuid │    │  user_id     uuid  │  │  user_id  uuid │
│  email     text │    │  video_id    uuid ─┼─►│  video_id uuid │
│  motivation text│    │  created_at        │  │  content  text │
│  experience text│    └────────────────────┘  │  created_at    │
│  belt      text │                            └────────────────┘
│  gym       text │
│  status    text │    ┌────────────────────┐
│  ┌─ pending     │    │      comments      │
│  ├─ approved    │    │                    │
│  └─ rejected    │    │  id          uuid  │
│  created_at     │    │  user_id     uuid  │
└─────────────────┘    │  video_id    uuid ─┼─►┐
                       │  content     text  │  │
                       │  created_at        │  │
                       └────────────────────┘  │
                                               │
┌──────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                           videos                                │
│                                                                 │
│  id                  uuid   PK                                  │
│  title               text                                       │
│  description         text                                       │
│  url                 text   ← URL YouTube / Vimeo               │
│  poster_url          text   ← URL miniature                     │
│  platform            text   ← "youtube" | "vimeo"              │
│  competition_context text   ← "ADCC 2017", "Worlds 2019"...    │
│  duration            integer ← durée en secondes               │
│  created_at          timestamptz                                │
└─────────────────────────────────────────────────────────────────┘
```

### Politique de sécurité (Row Level Security)

Toutes les tables ont la **RLS activée** :

| Table | Règle |
|---|---|
| `tcb_requests` | Un utilisateur ne peut lire/insérer que sa propre demande |
| `favorites` | Un utilisateur ne peut gérer que ses propres favoris |
| `comments` | Lecture publique, écriture authentifiée uniquement |
| `user_notes` | Lecture/écriture strictement privées |
| `videos` | Lecture publique, écriture réservée au `service_role` (admin) |

---

## 🔐 Authentification

Deux méthodes de connexion disponibles :

1. **Email / Mot de passe** — avec générateur de mot de passe sécurisé (`crypto.getRandomValues`) et jauge de force visuelle
2. **Google OAuth** — via Supabase Auth (flux implicite)

### Niveaux d'accès

| Rôle | Accès |
|---|---|
| Visiteur non connecté | Catalogue vidéos public, Hall of Fame |
| Utilisateur connecté | + Favoris, commentaires, notes, profil |
| Membre TCB | + Espace vidéos exclusif TCB |
| Admin | + Panel d'administration complet (`/admin`) |

---

## 📱 Fonctionnalités

### Côté utilisateur
- 🎬 **Catalogue vidéos** — filtres par championnat (Worlds, ADCC, Europeans, Brasileiros, Pan Ams, Open)
- ⭐ **Favoris** — sauvegarde des vidéos préférées
- 💬 **Commentaires** — discussions par vidéo
- 📝 **Notes personnelles** — prises de notes liées à chaque vidéo
- 🏆 **Hall of Fame** — carrousel interactif des légendes BJJ avec animation de carte 3D flip
- 🔒 **Espace TCB** — accès conditionnel, demande d'intégration par questionnaire

### Côté admin (`/admin`)
- ✅ Gestion des demandes TCB (approuver / rejeter)
- 🎬 CRUD complet sur les vidéos (ajout, modification, suppression)
- 🔑 Double sécurité : vérification côté client + `assertAdmin()` côté serveur

---

## 🎨 Design System — Liquid Glass

L'interface suit un langage visuel **Liquid Glass** :

- Fonds translucides avec `backdrop-filter: blur() saturate()`
- Highlight spéculaire via pseudo-élément `::before`
- Orbes de lumière animés en arrière-plan (`float-slow`, `float-slower`)
- Palette : noir profond `#05050D` + accent or `#facc15`
- Animations 3D CSS (`rotateY`, `backface-visibility`, `transform-style: preserve-3d`)
- Scrollbar custom, skeleton loaders, animations shimmer

---

## 🚀 Installation locale

```bash
# Cloner le projet
git clone https://github.com/TON_USERNAME/grapplevault.git
cd grapplevault

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local
# Remplir les variables (voir ci-dessous)

# Lancer le serveur de développement
npm run dev
```

### Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAIL=admin@email.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@email.com
```

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Accueil — catalogue vidéos + filtres
│   ├── layout.tsx            # Layout global (orbes, Toaster)
│   ├── globals.css           # Design system Liquid Glass
│   ├── login/page.tsx        # Connexion / Inscription
│   ├── profile/page.tsx      # Profil utilisateur + badge TCB
│   ├── favorites/page.tsx    # Vidéos favorites
│   ├── hall-of-fame/page.tsx # Légendes BJJ
│   ├── secret-tcb/page.tsx   # Espace membres TCB
│   ├── video/[id]/page.tsx   # Page vidéo individuelle
│   └── admin/
│       ├── page.tsx          # Dashboard admin
│       └── actions.ts        # Server Actions (CRUD, approbations)
├── components/
│   ├── Header.tsx            # Navigation + drawer mobile
│   ├── VideoCard.tsx         # Carte vidéo glass
│   ├── VideoPlayer.tsx       # Lecteur vidéo intégré
│   ├── FighterCarousel.tsx   # Carrousel Hall of Fame 3D
│   ├── TcbRequestForm.tsx    # Formulaire demande TCB
│   ├── FavoriteButton.tsx    # Bouton favori avec animation
│   ├── CommentSection.tsx    # Section commentaires
│   ├── NoteTaker.tsx         # Prise de notes
│   ├── SearchBar.tsx         # Barre de recherche
│   └── AvatarUploader.tsx    # Upload avatar (Supabase Storage)
└── lib/
    ├── supabase.ts           # Client Supabase (public, côté client)
    └── supabase-admin.ts     # Client Supabase (service_role, serveur uniquement)
```

---

## 👨‍🎓 Contexte académique

Ce projet a été réalisé dans le cadre d'une formation en développement web. Il illustre la mise en pratique de :

- Architecture **fullstack moderne** avec Next.js App Router et Server Actions
- Gestion de l'**authentification** et des **autorisations** par niveaux (RLS, rôles, metadata)
- Intégration d'un **BaaS** (Backend as a Service) avec Supabase
- Conception d'une **UI/UX cohérente** avec un design system custom (Liquid Glass)
- Utilisation responsable des **outils IA** comme assistants au développement (Claude Code, Gemini)

---

*Développé avec passion pour le BJJ — assisté par Claude Code & Gemini via VS Code*

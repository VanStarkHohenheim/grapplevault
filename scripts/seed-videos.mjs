/**
 * seed-videos.mjs
 *
 * Récupère toutes les vidéos d'une playlist YouTube via l'API YouTube Data v3
 * et les insère dans la table `videos` de Supabase.
 *
 * Usage :
 *   node scripts/seed-videos.mjs
 *
 * Variables d'environnement requises dans .env.local :
 *   YOUTUBE_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── Chargement de .env.local ─────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  } catch {
    console.error('❌  Impossible de lire .env.local — lance le script depuis la racine du projet.');
    process.exit(1);
  }
}
loadEnv();

const YOUTUBE_API_KEY   = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Playlist cible ───────────────────────────────────────────
const PLAYLIST_ID = 'PLt3jppIFiNQCKNicEB625FISr-zAAr3Hz';

if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error('❌  Variables manquantes dans .env.local :');
  if (!YOUTUBE_API_KEY)   console.error('   - YOUTUBE_API_KEY');
  if (!SUPABASE_URL)      console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY);

// ── Utilitaires ──────────────────────────────────────────────

/** Convertit une durée ISO 8601 (PT4M13S) en secondes */
function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? '0', 10);
  const m = parseInt(match[2] ?? '0', 10);
  const s = parseInt(match[3] ?? '0', 10);
  return h * 3600 + m * 60 + s;
}

/** Choisit la meilleure miniature disponible */
function bestThumbnail(thumbnails) {
  return (
    thumbnails?.maxres?.url  ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url    ??
    thumbnails?.medium?.url  ??
    thumbnails?.default?.url ??
    null
  );
}

// ── Récupération de la playlist ──────────────────────────────

async function fetchPlaylistItems() {
  const items = [];
  let pageToken = '';

  console.log(`\n📋  Récupération de la playlist ${PLAYLIST_ID}...\n`);

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part',       'snippet,contentDetails');
    url.searchParams.set('playlistId', PLAYLIST_ID);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key',        YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res  = await fetch(url.toString());
    const data = await res.json();

    if (data.error) {
      console.error('❌  Erreur API YouTube :', data.error.message);
      process.exit(1);
    }

    items.push(...data.items);
    pageToken = data.nextPageToken ?? '';
    console.log(`   → ${items.length} vidéo(s) récupérée(s)...`);
  } while (pageToken);

  return items;
}

/** Récupère les détails (durée) pour une liste d'IDs */
async function fetchVideoDetails(videoIds) {
  const details = {};
  const chunks  = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part',  'contentDetails,snippet');
    url.searchParams.set('id',    chunk.join(','));
    url.searchParams.set('key',   YOUTUBE_API_KEY);

    const res  = await fetch(url.toString());
    const data = await res.json();

    for (const item of data.items ?? []) {
      details[item.id] = {
        duration:    parseDuration(item.contentDetails?.duration ?? ''),
        description: item.snippet?.description ?? '',
      };
    }
  }

  return details;
}

// ── Insertion dans Supabase ──────────────────────────────────

async function seedVideos() {
  const playlistItems = await fetchPlaylistItems();

  const videoIds = playlistItems
    .map(i => i.contentDetails?.videoId)
    .filter(Boolean);

  console.log(`\n⏳  Récupération des détails pour ${videoIds.length} vidéos...\n`);
  const details = await fetchVideoDetails(videoIds);

  const rows = playlistItems
    .filter(item => {
      const id = item.contentDetails?.videoId;
      // Exclure les vidéos privées/supprimées
      return id && item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video';
    })
    .map(item => {
      const videoId   = item.contentDetails.videoId;
      const snippet   = item.snippet;
      const detail    = details[videoId] ?? {};
      const thumbnail = bestThumbnail(snippet.thumbnails);

      return {
        title:               snippet.title,
        description:         detail.description || snippet.description || null,
        url:                 `https://www.youtube.com/watch?v=${videoId}`,
        poster_url:          thumbnail,
        platform:            'youtube',
        competition_context: null,   // À renseigner manuellement via le panel admin
        duration:            detail.duration ?? 0,
      };
    });

  console.log(`\n📥  Insertion de ${rows.length} vidéos dans Supabase...\n`);

  let inserted = 0;
  let skipped  = 0;

  for (const row of rows) {
    // Vérifie si la vidéo existe déjà (par URL)
    const { data: existing } = await supabase
      .from('videos')
      .select('id')
      .eq('url', row.url)
      .maybeSingle();

    if (existing) {
      skipped++;
      process.stdout.write('·');
      continue;
    }

    const { error } = await supabase.from('videos').insert(row);
    if (error) {
      console.error(`\n❌  Erreur pour "${row.title}" :`, error.message);
    } else {
      inserted++;
      process.stdout.write('✓');
    }
  }

  console.log(`\n\n✅  Terminé !`);
  console.log(`   ${inserted} vidéo(s) insérée(s)`);
  console.log(`   ${skipped}  vidéo(s) déjà présente(s) (ignorées)\n`);
  console.log('💡  Tu peux maintenant renseigner le champ "competition_context" de chaque vidéo');
  console.log('   via le panel admin → http://localhost:3000/admin\n');
}

seedVideos().catch(err => {
  console.error('❌  Erreur inattendue :', err);
  process.exit(1);
});

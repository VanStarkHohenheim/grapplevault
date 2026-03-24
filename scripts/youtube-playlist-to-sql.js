/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         GrappleVault — Scraper playlist YouTube             ║
 * ║                                                             ║
 * ║  INSTRUCTIONS :                                             ║
 * ║  1. Ouvre la playlist YouTube dans ton navigateur           ║
 * ║     https://youtube.com/playlist?list=PLt3jppIFiNQCKNicEB625FISr-zAAr3Hz
 * ║  2. Fais défiler la page jusqu'en bas pour tout charger     ║
 * ║  3. Ouvre la console (F12 → Console)                        ║
 * ║  4. Colle ce script et appuie sur Entrée                    ║
 * ║  5. Copie le SQL généré → colle dans Supabase SQL Editor    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

(function () {

  // ── Utilitaires ─────────────────────────────────────────────

  /** Convertit "4:13" ou "1:02:45" en secondes */
  function timeToSeconds(str) {
    if (!str) return 0;
    const parts = str.trim().split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  /** Échappe les apostrophes pour SQL */
  function esc(str) {
    return (str ?? '').replace(/'/g, "''");
  }

  // ── Scraping des éléments de la playlist ────────────────────

  const items = document.querySelectorAll('ytd-playlist-video-renderer');

  if (items.length === 0) {
    console.warn('⚠️  Aucune vidéo trouvée. Assure-toi d\'être sur la page de la playlist ET d\'avoir scrollé jusqu\'en bas pour tout charger.');
    return;
  }

  const rows = [];

  items.forEach((item) => {
    // ID vidéo
    const anchor  = item.querySelector('a#video-title');
    const href    = anchor?.href ?? '';
    const videoId = new URLSearchParams(new URL(href, location.href).search).get('v');

    if (!videoId) return;

    // Titre
    const title = anchor?.title?.trim() || anchor?.textContent?.trim() || 'Sans titre';

    // Durée (texte visible ex: "12:34")
    const durationEl  = item.querySelector('span.ytd-thumbnail-overlay-time-status-renderer');
    const durationStr  = durationEl?.textContent?.trim() ?? '';
    const duration     = timeToSeconds(durationStr);

    // Miniature YouTube (format maxresdefault disponible en général)
    const posterUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // URL de la vidéo
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    rows.push({ title, url, posterUrl, duration, videoId });
  });

  if (rows.length === 0) {
    console.warn('⚠️  Aucune vidéo valide extraite.');
    return;
  }

  // ── Génération du SQL ────────────────────────────────────────

  const lines = rows.map(r =>
    `('${esc(r.title)}', '${esc(r.url)}', '${esc(r.posterUrl)}', 'youtube', NULL, ${r.duration})`
  );

  const sql = `-- GrappleVault — Import playlist YouTube (${rows.length} vidéos)
-- Généré le ${new Date().toLocaleDateString('fr-FR')}
-- Colle ce SQL dans : Supabase Dashboard → SQL Editor

INSERT INTO public.videos (title, url, poster_url, platform, competition_context, duration)
VALUES
${lines.join(',\n')}
ON CONFLICT DO NOTHING;
`;

  // ── Affichage ────────────────────────────────────────────────

  console.log('');
  console.log(`%c✅  ${rows.length} vidéos extraites`, 'color: #22c55e; font-weight: bold; font-size: 14px');
  console.log('');
  console.log('%c📋  SQL généré — copie tout ci-dessous :', 'color: #facc15; font-weight: bold');
  console.log('');
  console.log(sql);

  // Copie automatique dans le presse-papier si autorisé
  if (navigator.clipboard) {
    navigator.clipboard.writeText(sql).then(() => {
      console.log('%c📎  SQL copié dans le presse-papier !', 'color: #60a5fa; font-weight: bold');
    }).catch(() => {
      console.log('%c⚠️  Copie automatique refusée — copie manuellement le SQL ci-dessus.', 'color: #f97316');
    });
  }

  console.log('');
  console.log('%c💡  Prochaine étape : renseigne competition_context pour chaque vidéo', 'color: #a78bfa');
  console.log('   → Panel admin : http://localhost:3000/admin → onglet Vidéos');

})();

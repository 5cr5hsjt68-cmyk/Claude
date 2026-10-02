// Serveur du tableau de bord : sert la page et la route /api/news.
// Le navigateur n'appelle jamais les API d'actualité directement (pas de clé
// exposée, pas de problème de CORS).

import express from 'express';
import { fileURLToPath } from 'node:url';
import { createNewsService } from './news/service.js';
import { france24 } from './news/sources/france24.js';
import { rfi } from './news/sources/rfi.js';
import { gnews } from './news/sources/gnews.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT) || 3000;
const ttlMinutes = Number(process.env.NEWS_CACHE_TTL_MINUTES) || 24 * 60;

const news = createNewsService({
  // Ordre de repli : principale, puis secours.
  sources: [france24, rfi, gnews],
  ttlMs: ttlMinutes * 60 * 1000,
  cacheFile: `${root}data/news-cache.json`,
});

const app = express();
app.disable('x-powered-by');
app.use(express.static(`${root}public`));

app.get('/api/news', async (_req, res) => {
  try {
    const data = await news.getNews();
    res.set('Cache-Control', 'no-store').json(data);
  } catch (err) {
    // Filet de sécurité : la page reçoit toujours une réponse lisible.
    console.error('[actus] erreur inattendue :', err);
    res.json({ articles: [], source: null, fetchedAt: null, stale: true, message: 'Les actualités sont momentanément indisponibles.' });
  }
});

app.listen(port, () => {
  console.log(`Tableau de bord : http://localhost:${port}`);
  if (!gnews.isConfigured()) console.log('[actus] GNEWS_API_KEY absente : secours GNews désactivé.');
});

// Source principale : flux RSS « À la une » de France 24 en français. Sans clé.
// Testé le 2026-10-02 : HTTP 200, 10 articles avec titre, lien, date et image.
// À relire : conditions d'usage du flux (non trouvées).

import { fetchRss } from '../rss.js';

export const france24 = {
  id: 'france24',
  name: 'France 24',
  attribution: 'Source : France 24',
  attributionUrl: 'https://www.france24.com/fr/',
  url: 'https://www.france24.com/fr/rss',
  isConfigured: () => true,
  fetchArticles(limit) {
    return fetchRss(this.url, this.name, limit);
  },
};

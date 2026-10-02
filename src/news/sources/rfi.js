// Première source de secours : flux RSS de RFI en français. Sans clé.
// Testé le 2026-10-02 : HTTP 200, 10 articles avec titre, lien, date et image.
// À relire : conditions d'usage du flux (non trouvées).

import { fetchRss } from '../rss.js';

export const rfi = {
  id: 'rfi',
  name: 'RFI',
  attribution: 'Source : RFI',
  attributionUrl: 'https://www.rfi.fr/fr/',
  url: 'https://www.rfi.fr/fr/rss',
  isConfigured: () => true,
  fetchArticles(limit) {
    return fetchRss(this.url, this.name, limit);
  },
};

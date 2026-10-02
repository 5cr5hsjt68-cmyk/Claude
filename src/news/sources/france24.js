// Source principale : flux RSS « À la une » de France 24 en français. Sans clé.
// À CONFIRMER : adresse du flux, champs, conditions d'usage (non testés, réseau bloqué).

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

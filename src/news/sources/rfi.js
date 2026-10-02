// Première source de secours : flux RSS de RFI en français. Sans clé.
// À CONFIRMER : adresse du flux, champs, conditions d'usage (non testés, réseau bloqué).

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

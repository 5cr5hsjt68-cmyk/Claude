// Seconde source de secours : GNews (annuaire Public APIs, catégorie News).
// Clé gratuite, lue dans GNEWS_API_KEY ; la source est ignorée si la clé est absente.
// Testé le 2026-10-02 sans clé : HTTP 400 {"errors":["You did not provide an API key."]}
// (l'adresse répond). À confirmer avec une clé : nom des champs, limite gratuite, conditions.

import { fetchJson } from '../http.js';
import { makeArticle } from '../article.js';

const BASE_URL = 'https://gnews.io/api/v4/top-headlines';

export const gnews = {
  id: 'gnews',
  name: 'GNews',
  attribution: 'Données : GNews',
  attributionUrl: 'https://gnews.io/',
  isConfigured: () => Boolean(process.env.GNEWS_API_KEY),
  async fetchArticles(limit) {
    const params = new URLSearchParams({
      category: 'general',
      lang: 'fr',
      max: String(Math.min(limit, 10)),
      apikey: process.env.GNEWS_API_KEY,
    });
    const body = await fetchJson(`${BASE_URL}?${params}`);
    if (!Array.isArray(body?.articles)) {
      throw new Error(`GNews : champ "articles" absent${body?.errors ? ` (${[].concat(body.errors).join(', ')})` : ''}`);
    }
    const articles = body.articles
      .map((a) =>
        makeArticle({
          title: a.title,
          description: a.description,
          url: a.url,
          image: a.image,
          publishedAt: a.publishedAt,
          sourceName: a.source?.name,
        }),
      )
      .filter(Boolean);
    if (articles.length === 0) throw new Error('GNews : aucun article');
    return articles;
  },
};

// Actus du jour : cache + chaîne de repli.
//
// 1. Cache encore frais        -> on le renvoie, aucun appel.
// 2. Sinon, on essaie les sources dans l'ordre ; la première qui répond gagne.
// 3. Si toutes tombent         -> dernière valeur connue, avec son heure et un message.
// 4. Aucune valeur connue      -> liste vide et message clair (jamais d'erreur 500).
//
// Après un échec complet, on attend RETRY_AFTER_FAILURE_MS avant de réessayer,
// pour ne pas marteler des API déjà en panne à chaque chargement de page.

import { FileCache } from './cache.js';

const RETRY_AFTER_FAILURE_MS = 15 * 60 * 1000;

export function createNewsService({ sources, ttlMs, cacheFile, limit = 10, now = () => Date.now(), log = console }) {
  const cache = new FileCache(cacheFile);
  let inFlight = null;
  let lastFailureAt = 0;

  async function refresh() {
    const errors = [];
    for (const source of sources) {
      if (!source.isConfigured()) continue;
      try {
        const articles = await source.fetchArticles(limit);
        const entry = {
          articles,
          source: { id: source.id, name: source.name, attribution: source.attribution, attributionUrl: source.attributionUrl },
          fetchedAt: new Date(now()).toISOString(),
        };
        await cache.set(entry);
        lastFailureAt = 0;
        if (errors.length) log.warn(`[actus] repli sur ${source.name} après : ${errors.join(' | ')}`);
        return { entry, errors };
      } catch (err) {
        errors.push(`${source.name} : ${err.message}`);
      }
    }
    lastFailureAt = now();
    log.error(`[actus] toutes les sources ont échoué : ${errors.join(' | ')}`);
    return { entry: null, errors };
  }

  async function getNews() {
    const cached = await cache.get();
    const age = cached ? now() - Date.parse(cached.fetchedAt) : Infinity;
    if (cached && age < ttlMs) return present(cached, false);

    const recentlyFailed = now() - lastFailureAt < RETRY_AFTER_FAILURE_MS;
    if (!recentlyFailed) {
      inFlight ??= refresh().finally(() => (inFlight = null));
      const { entry } = await inFlight;
      if (entry) return present(entry, false);
    }

    if (cached) {
      return present(cached, true, 'Les sources d\'actualité ne répondent pas pour le moment : voici les derniers titres connus.');
    }
    return {
      articles: [],
      source: null,
      fetchedAt: null,
      stale: true,
      message: 'Les actualités sont momentanément indisponibles. Réessayez plus tard.',
    };
  }

  return { getNews };
}

function present(entry, stale, message = null) {
  return { ...entry, stale, message };
}

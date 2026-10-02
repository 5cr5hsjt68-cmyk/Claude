// Tests réels : appellent vraiment chaque source et vérifient que les champs
// utilisés par le tableau de bord existent toujours.
// Lancer : npm run test:live   (nécessite un accès Internet)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { france24 } from '../src/news/sources/france24.js';
import { rfi } from '../src/news/sources/rfi.js';
import { gnews } from '../src/news/sources/gnews.js';

for (const source of [france24, rfi, gnews]) {
  test(`${source.name} renvoie des articles au format commun`, { skip: !source.isConfigured() && 'clé absente' }, async () => {
    const articles = await source.fetchArticles(5);

    assert.ok(articles.length > 0, 'au moins un article');
    for (const a of articles) {
      assert.equal(typeof a.title, 'string');
      assert.ok(a.title.length > 0, 'titre non vide');
      assert.match(a.url, /^https?:\/\//, 'lien http(s)');
      assert.equal(typeof a.sourceName, 'string');
    }
    // La date de publication sert à l'affichage : on exige qu'au moins un article l'ait.
    assert.ok(articles.some((a) => a.publishedAt), 'au moins une date de publication');
  });
}

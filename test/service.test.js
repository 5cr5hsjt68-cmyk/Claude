// Tests hors ligne du cache et de la chaîne de repli, avec de fausses sources.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewsService } from '../src/news/service.js';

const article = (title) => ({ title, description: null, url: `https://example.org/${title}`, image: null, publishedAt: null, sourceName: 'Test' });
const quietLog = { warn() {}, error() {} };

function fakeSource(id, behaviour) {
  return {
    id,
    name: id,
    attribution: `Source : ${id}`,
    attributionUrl: 'https://example.org/',
    calls: 0,
    isConfigured: () => true,
    async fetchArticles() {
      this.calls++;
      return behaviour();
    },
  };
}

const ok = (title) => () => [article(title)];
const down = () => { throw new Error('HTTP 503'); };

function setup(sources, { ttlMs = 60_000 } = {}) {
  let clock = Date.parse('2026-10-02T08:00:00Z');
  const service = createNewsService({ sources, ttlMs, cacheFile: null, now: () => clock, log: quietLog });
  return { service, advance: (ms) => (clock += ms) };
}

test('utilise la source principale quand elle répond', async () => {
  const main = fakeSource('principale', ok('a'));
  const backup = fakeSource('secours', ok('b'));
  const { service } = setup([main, backup]);

  const news = await service.getNews();
  assert.equal(news.source.id, 'principale');
  assert.equal(news.stale, false);
  assert.equal(news.fetchedAt, '2026-10-02T08:00:00.000Z');
  assert.equal(backup.calls, 0);
});

test('bascule sur la source de secours si la principale tombe', async () => {
  const { service } = setup([fakeSource('principale', down), fakeSource('secours', ok('b'))]);
  const news = await service.getNews();
  assert.equal(news.source.id, 'secours');
  assert.equal(news.articles[0].title, 'b');
});

test("sert le cache tant qu'il est frais, sans rappeler l'API", async () => {
  const main = fakeSource('principale', ok('a'));
  const { service, advance } = setup([main]);
  await service.getNews();
  advance(30_000);
  await service.getNews();
  assert.equal(main.calls, 1);
  advance(31_000);
  await service.getNews();
  assert.equal(main.calls, 2);
});

test('renvoie la dernière valeur connue avec un message si tout tombe', async () => {
  let up = true;
  const main = fakeSource('principale', () => (up ? [article('a')] : down()));
  const { service, advance } = setup([main, fakeSource('secours', down)]);
  await service.getNews();
  up = false;
  advance(120_000);

  const news = await service.getNews();
  assert.equal(news.stale, true);
  assert.equal(news.articles[0].title, 'a');
  assert.equal(news.fetchedAt, '2026-10-02T08:00:00.000Z');
  assert.match(news.message, /derniers titres connus/);
});

test('renvoie une liste vide et un message si rien n\'a jamais marché', async () => {
  const { service } = setup([fakeSource('principale', down)]);
  const news = await service.getNews();
  assert.deepEqual(news.articles, []);
  assert.equal(news.stale, true);
  assert.ok(news.message);
});

test("attend avant de réessayer des sources en panne", async () => {
  const main = fakeSource('principale', down);
  const { service, advance } = setup([main]);
  await service.getNews();
  await service.getNews();
  assert.equal(main.calls, 1);
  advance(16 * 60_000);
  await service.getNews();
  assert.equal(main.calls, 2);
});

test('ignore une source non configurée (clé absente)', async () => {
  const keyed = { ...fakeSource('avec-cle', ok('k')), isConfigured: () => false };
  const { service } = setup([keyed, fakeSource('libre', ok('l'))]);
  const news = await service.getNews();
  assert.equal(news.source.id, 'libre');
});

test('regroupe les appels simultanés en un seul', async () => {
  const main = fakeSource('principale', ok('a'));
  const { service } = setup([main]);
  await Promise.all([service.getNews(), service.getNews(), service.getNews()]);
  assert.equal(main.calls, 1);
});

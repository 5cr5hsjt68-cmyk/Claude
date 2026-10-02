// Tests hors ligne du lecteur RSS. Le XML ci-dessous est un exemple écrit à la
// main au format RSS 2.0 standard, PAS une copie d'une vraie réponse.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRss } from '../src/news/rss.js';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Exemple</title>
    <item>
      <title>Premier titre &amp; suite</title>
      <link>https://example.org/a</link>
      <description><![CDATA[<p>Un <b>chapeau</b> en HTML.</p>]]></description>
      <pubDate>Fri, 02 Oct 2026 06:30:00 GMT</pubDate>
      <media:content url="https://example.org/a.jpg" medium="image"/>
    </item>
    <item>
      <title>Sans lien valide</title>
      <link>javascript:alert(1)</link>
    </item>
    <item>
      <title>Deuxième titre</title>
      <link>https://example.org/b</link>
      <enclosure url="https://example.org/b.mp3" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`;

test('convertit les items au format commun et écarte les liens invalides', () => {
  const articles = parseRss(xml, 'Exemple', 10);
  assert.equal(articles.length, 2);
  assert.deepEqual(articles[0], {
    title: 'Premier titre & suite',
    description: 'Un chapeau en HTML.',
    url: 'https://example.org/a',
    image: 'https://example.org/a.jpg',
    publishedAt: '2026-10-02T06:30:00.000Z',
    sourceName: 'Exemple',
  });
  assert.equal(articles[1].image, null, "une pièce jointe audio n'est pas une image");
  assert.equal(articles[1].publishedAt, null);
});

test('respecte la limite', () => {
  assert.equal(parseRss(xml, 'Exemple', 1).length, 1);
});

test('échoue clairement sur un document qui n\'est pas un flux RSS', () => {
  assert.throws(() => parseRss('<html><body>Erreur</body></html>', 'Exemple'), /sans <channel>/);
});

// Lecture d'un flux RSS 2.0 et conversion au format commun.

import { XMLParser } from 'fast-xml-parser';
import { fetchText } from './http.js';
import { makeArticle } from './article.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '#text',
  processEntities: true,
});

export async function fetchRss(url, sourceName, limit) {
  const xml = await fetchText(url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  return parseRss(xml, sourceName, limit);
}

export function parseRss(xml, sourceName, limit = 10) {
  let doc;
  try {
    doc = parser.parse(xml);
  } catch (err) {
    throw new Error(`flux RSS illisible (${sourceName}) : ${err.message}`);
  }
  const channel = doc?.rss?.channel;
  if (!channel) throw new Error(`flux RSS sans <channel> (${sourceName})`);

  const items = [].concat(channel.item ?? []);
  const articles = items
    .map((item) =>
      makeArticle({
        title: text(item.title),
        description: text(item.description),
        url: text(item.link) || text(item.guid),
        image: imageOf(item),
        publishedAt: text(item.pubDate) || text(item['dc:date']),
        sourceName,
      }),
    )
    .filter(Boolean)
    .slice(0, limit);

  if (articles.length === 0) throw new Error(`flux RSS vide (${sourceName})`);
  return articles;
}

function text(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return typeof node['#text'] === 'string' ? node['#text'] : '';
}

// Les flux placent l'image à différents endroits : on essaie les plus courants.
function imageOf(item) {
  for (const key of ['media:content', 'media:thumbnail', 'enclosure']) {
    for (const node of [].concat(item[key] ?? [])) {
      const url = node?.['@url'];
      const type = node?.['@type'] ?? '';
      if (url && (key !== 'enclosure' || type.startsWith('image/'))) return url;
    }
  }
  return null;
}

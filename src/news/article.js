// Format unique d'un article, identique quelle que soit la source.
//
// {
//   title:       string            titre
//   description: string | null     chapeau, texte brut
//   url:         string            lien http(s) vers l'article
//   image:       string | null     image http(s)
//   publishedAt: string | null     date ISO 8601
//   sourceName:  string            nom du média
// }

export function makeArticle({ title, description, url, image, publishedAt, sourceName }) {
  const cleanTitle = cleanText(title);
  const cleanUrl = httpUrl(url);
  if (!cleanTitle || !cleanUrl) return null;
  return {
    title: cleanTitle,
    description: cleanText(description) || null,
    url: cleanUrl,
    image: httpUrl(image),
    publishedAt: isoDate(publishedAt),
    sourceName: cleanText(sourceName) || new URL(cleanUrl).host,
  };
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  // Les chapeaux RSS contiennent souvent du HTML, parfois échappé deux fois :
  // on retire les balises avant et après décodage, et &amp; en dernier.
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function httpUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

function isoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

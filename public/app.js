// Bloc « Actus du jour » : appelle uniquement notre serveur (/api/news).

const els = {
  updated: document.getElementById('news-updated'),
  notice: document.getElementById('news-notice'),
  list: document.getElementById('news-list'),
  attribution: document.getElementById('news-attribution'),
};

const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

async function loadNews() {
  let data;
  try {
    const res = await fetch('/api/news');
    data = await res.json();
  } catch {
    data = { articles: [], stale: true, message: 'Impossible de joindre le serveur.' };
  }
  render(data);
}

function render({ articles = [], source, fetchedAt, stale, message }) {
  els.updated.textContent = fetchedAt
    ? `Mis à jour le ${dateTime.format(new Date(fetchedAt))}`
    : 'Pas encore de mise à jour';
  els.updated.classList.toggle('is-stale', Boolean(stale));

  els.notice.hidden = !message;
  els.notice.textContent = message ?? '';

  els.list.replaceChildren(...articles.map(renderArticle));

  els.attribution.replaceChildren();
  if (source?.attribution) {
    const a = document.createElement('a');
    a.href = source.attributionUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = source.attribution;
    els.attribution.append(a);
  }
}

function renderArticle(article) {
  const li = document.createElement('li');
  li.className = 'news-item';

  const link = document.createElement('a');
  link.href = article.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = article.title;

  const meta = document.createElement('div');
  meta.className = 'news-meta';
  meta.textContent = [article.sourceName, article.publishedAt && time.format(new Date(article.publishedAt))]
    .filter(Boolean)
    .join(' · ');

  li.append(link, meta);
  if (article.description) {
    const p = document.createElement('p');
    p.className = 'news-description';
    p.textContent = article.description;
    li.append(p);
  }
  return li;
}

loadNews();

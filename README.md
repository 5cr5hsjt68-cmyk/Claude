# Tableau de bord — Actus du jour

Petit tableau de bord Node.js + Express qui affiche les grands titres de
l'actualité internationale en français, rafraîchis une fois par jour.

## Lancer

```bash
cp .env.example .env   # puis remplir les valeurs voulues
npm install
npm start              # http://localhost:3000
```

## Sources et repli

| Ordre | Source | Adresse d'appel | Clé | Cache |
|---|---|---|---|---|
| 1 (principale) | France 24, flux RSS | `https://www.france24.com/fr/rss` | non | 24 h |
| 2 (secours) | RFI, flux RSS | `https://www.rfi.fr/fr/rss` | non | 24 h |
| 3 (secours) | GNews (annuaire Public APIs) | `https://gnews.io/api/v4/top-headlines?category=general&lang=fr` | `GNEWS_API_KEY`, gratuite | 24 h |

Si les trois sources tombent, la page affiche les derniers titres connus
(conservés dans `data/news-cache.json`) avec leur heure et un message. Après un
échec complet, le serveur attend 15 minutes avant de réessayer.

> **État des tests réels (2 octobre 2026)** : France 24 et RFI répondent
> (HTTP 200, 10 articles avec titre, lien, date et image). GNews répond mais
> n'a pas été testé avec une clé. Conditions d'usage des trois sources à relire.
>
> Derrière un proxy d'entreprise ou de sandbox, Node 22 n'utilise pas
> `HTTPS_PROXY` par défaut : lancer avec `NODE_USE_ENV_PROXY=1`.

## Tests

```bash
npm test            # hors ligne : cache, repli, lecture RSS
npm run test:live   # appelle les vraies sources et vérifie les champs utilisés
```

## Organisation

- `src/server.js` — serveur, route `/api/news`, page statique
- `src/news/service.js` — cache + chaîne de repli
- `src/news/cache.js` — dernière valeur connue (mémoire + disque)
- `src/news/http.js` — appel HTTP commun (délai max 8 s, User-Agent)
- `src/news/article.js` — format commun d'un article
- `src/news/rss.js` — lecture des flux RSS
- `src/news/sources/*.js` — un fichier par source
- `public/` — page du tableau de bord (n'appelle que `/api/news`)

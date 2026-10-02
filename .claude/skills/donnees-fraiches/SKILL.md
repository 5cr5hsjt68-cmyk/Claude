---
name: donnees-fraiches
description: À utiliser dès qu'on me demande une donnée du jour qui change souvent et que mes connaissances peuvent avoir en retard (météo, qualité de l'air, cours d'une crypto, taux de change, jours fériés, lever et coucher du soleil, séismes récents, position de l'ISS, actus spatiales ou tech). J'appelle une API publique gratuite, sans clé, et je réponds avec la valeur, la source et l'heure.
---

# Données fraîches

Quand la question porte sur une donnée qui change, ne réponds pas de mémoire :
appelle l'adresse adaptée ci-dessous (curl ou lecture d'URL), lis la réponse, et
réponds avec la valeur, la source et l'heure de la donnée.

| Besoin | Adresse (sans clé) |
|---|---|
| Coordonnées d'une ville | https://geocoding-api.open-meteo.com/v1/search?name={ville}&count=1&language=fr |
| Météo actuelle | https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto |
| Prévisions 7 jours | https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto |
| Qualité de l'air | https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=european_aqi,pm2_5&timezone=auto |
| Crypto en euros | https://api.kraken.com/0/public/Ticker?pair=XBTEUR,ETHEUR,SOLEUR (le bitcoin s'écrit XBT) |
| Taux de change | https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CHF |
| Jours fériés à venir | https://date.nager.at/api/v3/NextPublicHolidays/{code pays, ex. FR} |
| Lever et coucher du soleil | https://api.sunrise-sunset.org/json?lat={lat}&lng={lon}&formatted=0&tzid=Europe/Paris |
| Séismes des dernières 24 h | https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson |
| Position de l'ISS | https://api.wheretheiss.at/v1/satellites/25544 |
| Actus spatiales | https://api.spaceflightnewsapi.net/v4/articles/?limit=5 |
| Actus tech | https://hacker-news.firebaseio.com/v0/topstories.json puis https://hacker-news.firebaseio.com/v0/item/{id}.json |
| Résumé Wikipédia | https://fr.wikipedia.org/api/rest_v1/page/summary/{titre} |

## Règles
- Si un appel échoue, dis-le. N'invente jamais une valeur.
- Donne toujours l'heure de la donnée et son fuseau.
- Cite la source en une ligne (exemple : « Source : Open-Meteo, 14 h 05 »).
- Pour un besoin absent du tableau, cherche une API sans clé dans
  https://raw.githubusercontent.com/public-apis/public-apis/master/README.md,
  teste-la, et précise que c'est une source trouvée à l'instant.

// Appel HTTP commun à toutes les sources : délai maximum de 8 secondes,
// User-Agent identifiable, erreurs explicites.

export const TIMEOUT_MS = 8000;
export const USER_AGENT = 'tableau-de-bord-actus/0.1 (usage personnel)';

export async function fetchText(url, { headers = {} } = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, ...headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error(`délai dépassé (${TIMEOUT_MS / 1000} s) pour ${hostOf(url)}`);
    }
    throw new Error(`réseau indisponible pour ${hostOf(url)} : ${err.cause?.code ?? err.message}`);
  }
  if (!res.ok) {
    throw new Error(`${hostOf(url)} a répondu HTTP ${res.status}`);
  }
  return res.text();
}

export async function fetchJson(url, options) {
  const text = await fetchText(url, options);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`réponse non JSON de ${hostOf(url)}`);
  }
}

function hostOf(url) {
  return new URL(url).host;
}

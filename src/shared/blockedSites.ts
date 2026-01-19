export const BLOCKED_SITES_KEY = "blocked_sites";

function isValidIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})(\.\d{1,3}){3}$/);
  if (!m) return false;
  return host.split(".").every((p) => {
    const n = Number(p);
    return Number.isInteger(n) && n >= 0 && n <= 255;
  });
}

export function isValidDomain(host: string): boolean {
  const h = (host || "").toLowerCase().trim();
  if (!h) return false;

  if (h === "localhost") return true;
  if (isValidIPv4(h)) return true;

  if (!h.includes(".")) return false;

  const labels = h.split(".");
  if (labels.some((l) => !l || l.length > 63)) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,63}$/.test(tld)) return false;

  for (const label of labels) {
    if (!/^[a-z0-9-]+$/.test(label)) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
  }

  return true;
}


// zwraca domenę (bez www) albo "" jeśli niepoprawna.
export function extractDomainFromUrl(urlOrDomain: string): string {
  const raw = (urlOrDomain || "").trim();
  if (!raw) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    return isValidDomain(host) ? host : "";
  } catch {
    const host = raw.replace(/^www\./i, "").split("/")[0].toLowerCase();
    return isValidDomain(host) ? host : "";
  }
}

export function normalizeStoredDomain(domain: string): string {
  return (domain || "").trim().toLowerCase();
}

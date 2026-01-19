import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BLOCKED_SITES_KEY,
  extractDomainFromUrl,
  normalizeStoredDomain,
} from "../../shared/blockedSites";

// odczytuje listę zablokowanych stron ze storage
async function readBlockedSitesFromStorage(): Promise<string[]> {
  try {
    const result = await chrome.storage.local.get([BLOCKED_SITES_KEY]);
    const value = result?.[BLOCKED_SITES_KEY];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

// zapisuje listę zablokowanych stron do storage
async function writeBlockedSitesToStorage(sites: string[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [BLOCKED_SITES_KEY]: sites });
  } catch {
    // no-op
  }
}

// hook do zarządzania listą zablokowanych stron
export function useBlockedSites() {
  const [blockedSites, setBlockedSites] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sites = await readBlockedSitesFromStorage();

      // auto-clean: usuń śmieci, które nie są poprawną domeną
      const cleaned = Array.from(
        new Set(sites.map((s) => extractDomainFromUrl(s)).filter(Boolean))
      ).sort();

      if (!alive) return;
      setBlockedSites(cleaned);
      void writeBlockedSitesToStorage(cleaned);
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
      if (area !== "local") return;
      if (!changes?.[BLOCKED_SITES_KEY]) return;
      const next = changes[BLOCKED_SITES_KEY].newValue;
      if (Array.isArray(next)) {
        const cleaned = Array.from(
          new Set(next.map((s: string) => extractDomainFromUrl(s)).filter(Boolean))
        ).sort();
        setBlockedSites(cleaned);
      }
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  const addSite = useCallback(async (urlOrDomain: string) => {
    const domain = extractDomainFromUrl(urlOrDomain);
    if (!domain) return;

    setBlockedSites((prev) => {
      if (prev.includes(domain)) return prev;
      const next = [...prev, domain].sort();
      void writeBlockedSitesToStorage(next);
      return next;
    });
  }, []);

  const removeSite = useCallback(async (domain: string) => {
    const raw = normalizeStoredDomain(domain);
    if (!raw) return;

    setBlockedSites((prev) => {
      const next = prev.filter((x) => x !== raw);
      void writeBlockedSitesToStorage(next);
      return next;
    });
  }, []);

  const isBlocked = useCallback(
    (urlOrDomain: string) => {
      const domain = extractDomainFromUrl(urlOrDomain);
      if (!domain) return false;
      return blockedSites.includes(domain);
    },
    [blockedSites]
  );

  return useMemo(
    () => ({ blockedSites, addSite, removeSite, isBlocked }),
    [blockedSites, addSite, removeSite, isBlocked]
  );
}

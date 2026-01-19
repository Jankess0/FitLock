import { useEffect, useState } from 'react';

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function useActiveTabUrl() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    try {
      if (chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = tabs?.[0]?.url ?? '';
          const domain = extractDomain(url);
          setCurrentDomain(domain);
        });
      }
    } catch (e) {
      console.warn('Nie udało się pobrać domeny aktywnej karty:', e);
    }
  }, []);

  return { currentDomain };
}

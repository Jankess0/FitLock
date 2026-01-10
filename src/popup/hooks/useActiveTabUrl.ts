import { useEffect, useState } from 'react';

export function useActiveTabUrl() {
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    // Pobieramy URL aktywnej karty (wymaga permission "tabs")
    try {
      if (chrome?.tabs?.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = tabs?.[0]?.url ?? '';
          setCurrentUrl(url);
        });
      }
    } catch (e) {
      console.warn('Nie udało się pobrać URL aktywnej karty:', e);
    }
  }, []);

  return { currentUrl };
}

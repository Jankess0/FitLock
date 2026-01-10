import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fitlock_dark_mode';

const safeChromeStorageGet = async (key: string) => {
  try {
    if (!chrome?.storage?.local?.get) return undefined;
    const result = await chrome.storage.local.get([key]);
    return result?.[key];
  } catch {
    return undefined;
  }
};

const safeChromeStorageSet = async (key: string, value: unknown) => {
  try {
    if (!chrome?.storage?.local?.set) return;
    await chrome.storage.local.set({ [key]: value });
  } catch {
    // ignorujemy – popup ma działać nawet bez storage
  }
};

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    // Przy starcie: czytamy preferencję z chrome.storage i ustawiamy klasę na <html>
    const init = async () => {
      const saved = await safeChromeStorageGet(STORAGE_KEY);
      if (typeof saved === 'boolean') {
        document.documentElement.classList.toggle('dark', saved);
        setDarkMode(saved);
      }
    };
    init();
  }, []);

  const toggleDarkMode = async () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      // Zapisujemy ustawienie, żeby pamiętało po zamknięciu popupu
      void safeChromeStorageSet(STORAGE_KEY, next);
      return next;
    });
  };

  return { darkMode, toggleDarkMode };
}

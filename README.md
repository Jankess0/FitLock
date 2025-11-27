# FitLock 🔒🏃‍♂️

> **Zablokuj rozpraszacze. Odblokuj je ruchem.**
> Rozszerzenie do przeglądarki Chrome, które motywuje do aktywności fizycznej, blokując dostęp do wybranych stron (np. Social Media) do momentu osiągnięcia dziennego celu fitness.

---

## 📋 O Projekcie

FitLock to inżynierski projekt rozszerzenia (Browser Extension) zgodnego z **Manifest V3**. Aplikacja integruje się z **API Strava**, pobierając dane o aktywności użytkownika (dystans, czas ruchu, kroki).

**Główna zasada działania:**
1. Użytkownik loguje się kontem Strava.
2. Ustawia cel dzienny (np. 5 km biegu).
3. Definiuje listę stron blokowanych (np. `youtube.com`, `facebook.com`).
4. FitLock blokuje te strony, wyświetlając ekran motywacyjny, dopóki cel nie zostanie zrealizowany.

**Autorzy:** Kamil Janik, Tomasz Kapusta.

---

## 🛠️ Stack Technologiczny

Projekt wykorzystuje nowoczesne podejście do tworzenia rozszerzeń ("Modern Web Stack"):

* **Core:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Typowanie, Komponenty)
* **Build Tool:** [Vite](https://vitejs.dev/) (Szybki build, HMR)
* **Extension Tooling:** [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) (Automatyczne odświeżanie w Chrome)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Platforma:** Chrome Extension Manifest V3
* **State Management:** React Context + `chrome.storage.local`
* **API:** Strava API (OAuth 2.0)

---

## 📂 Struktura Projektu

Struktura plików została podzielona na logiczne moduły rozszerzenia:

```text
fitlock/
├── public/
│   ├── icons/             # Ikony aplikacji
│   └── block-screen.html  # Statyczna strona wyświetlana po zablokowaniu
├── src/
│   ├── background/        # [Service Worker] Logika backendowa (Auth, API Stravy, Alarmy)
│   │   ├── index.ts
│   │   └── authService.ts
│   ├── popup/             # [Frontend] Interfejs w dymku (React)
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── content/           # [Content Scripts] Logika wstrzykiwana na strony (opcjonalnie)
│   └── shared/            # Wspólny kod (Konfiguracja, Typy, Helpery)
│       ├── config.ts
│       └── types.ts
├── dist/                  # Zbudowana wersja (ten folder ładujemy do Chrome)
├── manifest.json          # Mózg rozszerzenia (uprawnienia, definicje)
└── vite.config.ts         # Konfiguracja builda i serwera dev


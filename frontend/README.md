# 📱 OdebraćTelefon - Mobilna Aplikacja

Mobilna aplikacja React Native (Expo) do sprawdzania numerów telefonów i identyfikacji potencjalnych spamerów. Aplikacja łączy się z backendem API, który analizuje dane z serwisu odebractelefon.pl.

## 🚀 Funkcjonalności

- ✅ **Sprawdzanie numerów telefonów** - Analizuj numer i uzyskaj szczegółowe informacje
- ✅ **Analiza spamu** - System AI identyfikuje typ spamu na podstawie opinii użytkowników
- ✅ **Historia wyszukiwań** - Przechowuj historię wszystkich sprawdzonych numerów
- ✅ **Szczegółowe komentarze** - Przeglądaj opinie użytkowników o numerze
- ✅ **Filtrowanie komentarzy** - Sortuj komentarze po typie oceny
- ✅ **Udostępnianie wyników** - Podziel się wynikami analizy z innymi
- ✅ **Tryb offline** - Historia dostępna bez internetu (opóźnione)
- ✅ **Konfiguracja** - Zmień adres backend'u w ustawieniach

## 📋 Wymagania

- Node.js v14 lub wyżej
- npm lub yarn
- Expo CLI (`npm install -g expo-cli`)
- Telefon/emulator z Expo (aplikacja Expo lub symulator iOS/Android)

## 📥 Instalacja

### 1. Przygotowanie

```bash
# Klonowanie/pobranie projektu
cd frontend

# Instalacja zależności
npm install
# lub
yarn install
```

### 2. Konfiguracja

Skopiuj plik `.env.example` na `.env` i dostosuj do swoich potrzeb:

```bash
cp .env.example .env
```

Edytuj `.env` i ustaw adres Backend'u:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**WAŻNE**: Zmień `localhost` na IP adres twojego komputera jeśli testujesz na fizycznym urządzeniu.

### 3. Uruchomienie Backend'u

Upewnij się, że backend jest uruchomiony:

```bash
cd ../  # Wróć do głównego folderu
npm start  # Uruchom backend na porcie 3000
```

### 4. Uruchomienie Aplikacji

```bash
cd frontend
npm start
# lub
expo start
```

## 🎮 Użycie Aplikacji

### Ekran Główny - Sprawdzenie Numeru

1. **Wpisz numer telefonu** - Format: `506965423` lub `+48 506 965 423`
2. **Naciśnij "Sprawdź numer"** - Aplikacja połączy się z backendem
3. **Przejrzyj wyniki** - Analiza pojawi się na ekranie wyników

### Ekran Wyników

Wyniki zawierają:

- **Verdict** - Ostateczny werdykt (Wysokie/Średnie/Niskie ryzyko)
- **Pewność** - Procent pewności analizy (0-100%)
- **Rozkład opinii** - Liczba: negatywnych, neutralnych, pozytywnych
- **Typy spamu** - Top 3 najprawdopodobniejsze typy
- **Kategorie** - Które kategorie zgłaszano
- **Komentarze** - Pełne opinie użytkowników z filtrowaniem

### Ekran Historii

- **Ostatnie wyszukiwania** - Lista poprzednio sprawdzonych numerów
- **Usuwanie** - Kliknij X aby usunąć z historii
- **Wyczyść** - Wyczyść całą historię

### Ekran Ustawień

- **Adres Backend'u** - Zmień URL serwera API
- **Powiadomienia** - Włącz/wyłącz
- **Historia** - Włącz/wyłącz zapisywanie
- **O aplikacji** - Informacje o wersji
- **Linki** - Bezpośrednie linki do odebractelefon.pl

## 🏗️ Struktura Projektu

```
frontend/
├── App.js                          # Główny komponent z nawigacją
├── app.json                        # Konfiguracja Expo
├── package.json                    # Zależności
├── .env.example                    # Zmienne środowiska
│
├── screens/                        # Ekrany aplikacji
│   ├── CheckerScreen.js           # Ekran sprawdzania numeru
│   ├── ResultsScreen.js           # Ekran wyników
│   ├── HistoryScreen.js           # Ekran historii
│   └── SettingsScreen.js          # Ekran ustawień
│
├── services/                       # Serwisy i API
│   └── apiService.js              # Komunikacja z backendem
│
├── utils/                          # Funkcje pomocnicze
│   └── helpers.js                 # Kolory, formatowanie, walidacja
│
└── assets/                         # Zasoby (ikony, splashy)
```

## 🔌 Integracja z Backendem

Aplikacja komunikuje się z backendem poprzez API:

### Endpoint Analizy

```javascript
POST /api/analyze-phone
Body: { phoneNumber: "506965423" }

Response: {
  success: true,
  phoneNumber: "506965423",
  reviewCount: 6,
  spamAnalysis: {
    mostLikelySpam: "telemarketer",
    confidence: 94,
    recommendation: {
      verdict: "WYSOKIE RYZYKO",
      shouldAnswer: "NO"
    }
  }
}
```

### Endpoint Komentarzy

```javascript
POST /api/get-comments
Body: { phoneNumber: "506965423", filter: { rating: 1 } }

Response: {
  success: true,
  comments: [
    {
      category: "Telemarketer",
      rating: 1,
      author: "John",
      comment: "Natarczywy telemarketer"
    }
  ]
}
```

## 🎨 Tema Aplikacji

Aplikacja używa następujących kolorów:

- **Primary**: `#10B981` (Zielony)
- **Danger**: `#EF4444` (Czerwony)
- **Warning**: `#F59E0B` (Pomarańczowy)
- **Background**: `#FFFFFF` / `#1F2937` (Biały/Ciemny)

## 📱 Budowanie dla Produkcji

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

### Web

```bash
npm run web
```

## 🐛 Troubleshooting

### "Backend niedostępny"

- Sprawdź czy backend jest uruchomiony (`npm start` w folderze głównym)
- Sprawdź czy adres URL w `.env` jest poprawny
- Jeśli testujesz na fizycznym urządzeniu, użyj IP adresu zamiast `localhost`

### "Błąd połączenia"

- Sprawdź połączenie internetowe
- Sprawdź czy firewall blokuje port 3000
- Przeładuj aplikację (Ctrl+C i `expo start`)

### "Historia nie jest zapisywana"

- Sprawdź czy w ustawieniach włączono "Zapisywanie historii"
- Sprawdź czy aplikacja ma permission do AsyncStorage
- Wyczyść dane aplikacji i spróbuj ponownie

### "Błąd przy ładowaniu komentarzy"

- Wznowienie numer i spróbuj ponownie
- Sprawdź czy dane są dostępne na odebractelefon.pl
- Sprawdź logi backend'u

## 📦 Zależności

Główne zależności:

- **React Native** - Framework mobilny
- **Expo** - Platforma do tworzenia aplikacji RN
- **React Navigation** - Nawigacja w aplikacji
- **Axios** - HTTP client
- **AsyncStorage** - Lokalne przechowywanie danych
- **Material Icons** - Ikony

## 🔐 Bezpieczeństwo

- ✅ Wszelkie dane przechowywane lokalnie
- ✅ Brak przechowywania haseł
- ✅ HTTPS w produkcji
- ✅ Brak logowania danych osób

## 📄 Licencja

MIT

## 🤝 Wsparcie

W przypadku problemów:

1. Sprawdź czy backend jest uruchomiony
2. Sprawdź czy połączenie internetowe działa
3. Sprawdź czy odebractelefon.pl jest dostępny
4. Czytaj logi aplikacji w konsoli Expo

## 📚 Dodatkowe Zasoby

- [Dokumentacja Expo](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [React Native Docs](https://reactnative.dev)
- [odebractelefon.pl](https://www.odebractelefon.pl)

---

**Developed with ❤️ using React Native & Expo**

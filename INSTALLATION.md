# 🚀 Pełny Przewodnik Instalacji - OdebraćTelefon

Kompletny przewodnik instalacji i konfiguracji projektu (backend + frontend).

## 📋 Spis Treści

1. [Wymagania](#wymagania)
2. [Instalacja Backend'u](#instalacja-backendu)
3. [Instalacja Frontend'u](#instalacja-frontendu)
4. [Konfiguracja](#konfiguracja)
5. [Uruchomienie](#uruchomienie)
6. [Testowanie](#testowanie)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Wymagania

### Ogólne

- **Node.js** v14+ ([pobierz](https://nodejs.org/))
- **npm** (zainstalowane z Node.js)

### Do Frontend'u

- **Expo CLI** - `npm install -g expo-cli`
- **iOS**: Mac + Xcode (opcjonalnie, do testowania)
- **Android**: Android Studio lub Emulator

---

## 🔧 Instalacja Backend'u

Backend to serwer Node.js + Express do scrapowania i analizy danych.

### Krok 1: Przygotowanie

```bash
# Przejdź do folderu backend'u
cd /ścieżka/do/projektu

# Sprawdź wersje
node -v    # Powinno być v14+
npm -v     # Powinno być 6+
```

### Krok 2: Instalacja Zależności

```bash
# Instalacja
npm install

# Powinny zainstalować się:
# - express (serwer)
# - axios (pobieranie stron)
# - cheerio (parsing HTML)
# - node-cache (cachowanie)
```

### Krok 3: Weryfikacja

```bash
# Sprawdź czy serwer startuje
npm start

# Powinieneś zobaczyć:
# ✅ Serwer backend uruchomiony na porcie 3000
# 📱 POST /api/analyze-phone - analiza spamu dla numeru
# 💬 POST /api/get-comments - pobierz komentarze
# 📊 POST /api/get-statistics - pobierz statystyki
# 🏥 GET /api/health - sprawdzenie statusu
```

Jeśli wszystko działa, naciśnij `Ctrl+C` aby zatrzymać serwer.

---

## 📱 Instalacja Frontend'u

Frontend to aplikacja React Native (Expo) na telefonie/emulatorze.

### Krok 1: Przygotowanie Expo

```bash
# Zainstaluj Expo CLI globalnie
npm install -g expo-cli

# Sprawdź wersję
expo --version  # Powinno być 49+
```

### Krok 2: Instalacja Zależności

```bash
# Przejdź do folderu frontend'u
cd frontend

# Instalacja
npm install

# Powinny zainstalować się:
# - react-native
# - @react-navigation
# - axios
# - @react-native-async-storage/async-storage
```

### Krok 3: Konfiguracja

```bash
# Skopiuj plik zmiennych
cp .env.example .env
```

Teraz edytuj `.env` i ustaw poprawny adres backend'u.

**WAŻNE**: Zmień `localhost` na swój IP jeśli testujesz na fizycznym urządzeniu:

```env
# Dla testowania na komputerze
EXPO_PUBLIC_API_URL=http://localhost:3000

# Dla testowania na telefonie (zamień 192.168.x.x swoim IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Aby znaleźć swój IP:

**Windows:**
```bash
ipconfig
# Szukaj: IPv4 Address: 192.168.x.x
```

**Mac/Linux:**
```bash
ifconfig
# Szukaj: inet 192.168.x.x
```

---

## 🎮 Uruchomienie

### Opcja 1: Terminal (Rekomendowana)

#### Terminal 1 - Backend

```bash
# W głównym folderze projektu
npm start

# Backend powinien działać na http://localhost:3000
```

#### Terminal 2 - Frontend

```bash
# W folderze frontend/
cd frontend
npm start

# Powinieneś zobaczyć:
# › Metro Bundler ready.
# › Press 'a' to open Android Emulator.
# › Press 'i' to open iOS Simulator.
# › Press 'w' to open Web in your browser.
# › Press 'r' to reload app.
# › Press 'q' to quit.
```

### Opcja 2: Testowanie Web (Szybko)

Jeśli chcesz szybko przetestować bez emulatora:

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend Web
cd frontend
npm run web

# Otwiera się automatycznie w przeglądarce na http://localhost:19006
```

### Opcja 3: Testowanie na Telefonie

1. **Zainstaluj Expo** - Pobierz z App Store (iOS) lub Google Play (Android)

2. **W Terminalu**:
   ```bash
   # W folderze frontend/
   npm start
   
   # Powinieneś zobaczyć QR kod
   ```

3. **Na Telefonie**:
   - Otwórz aplikację **Expo**
   - Naciśnij "Scan QR Code"
   - Odskanuj kod z terminala
   - Czekaj na załadowanie aplikacji (~30 sekund)

---

## ✅ Testowanie

### Health Check

```bash
# Sprawdź czy backend działa
curl http://localhost:3000/api/health

# Powinna zwrócić:
# {"status":"OK","message":"Backend jest aktywny"}
```

### Testowanie API Backend'u

```bash
# Analiza numeru
curl -X POST http://localhost:3000/api/analyze-phone \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"506965423"}'

# Pobranie komentarzy
curl -X POST http://localhost:3000/api/get-comments \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"506965423"}'
```

### Testowanie Frontend'u

1. Otwórz aplikację w emulatorze/telefonie
2. Wpisz numer: `506965423`
3. Naciśnij "Sprawdź numer"
4. Powinna pojawić się analiza

---

## 🐛 Troubleshooting

### Backend nie startuje

**Problem**: `Error: listen EADDRINUSE :::3000`

**Rozwiązanie**: Port 3000 jest już zajęty
```bash
# Znajdź proces na porcie 3000 (Mac/Linux)
lsof -i :3000

# Zabij proces
kill -9 <PID>

# Lub użyj innego portu
PORT=3001 npm start
```

### Frontend nie widzi backend'u

**Problem**: "Backend niedostępny" w aplikacji

**Możliwe przyczyny**:
1. Backend nie jest uruchomiony
2. URL w `.env` jest niepoprawny
3. Firewall blokuje port 3000

**Rozwiązanie**:
```bash
# 1. Sprawdź czy backend działa
curl http://localhost:3000/api/health

# 2. Sprawdź `.env` w folderze frontend/
cat .env

# 3. Jeśli testujesz na telefonie, użyj IP zamiast localhost
# EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

### "Brak połączenia z backendem"

**Problem**: Axios nie może się połączyć

**Rozwiązania**:
1. Sprawdź połączenie internetowe
2. Sprawdź URL w `.env`
3. Sprawdź firewall
4. Przeładuj aplikację (Ctrl+C i `npm start`)

### Historia nie jest zapisywana

**Problem**: Po restarcie aplikacji historia znika

**Rozwiązanie**: 
- Sprawdź czy w ustawieniach włączono "Zapisywanie historii"
- AsyncStorage może być czyszczone przy reinstalacji

### Błędy przy instalacji npm

**Problem**: `npm ERR! ERR! code ERESOLVE`

**Rozwiązanie**:
```bash
# Wymuś instalację z --legacy-peer-deps
npm install --legacy-peer-deps
```

### Aplikacja jest powolna

**Rozwiązanie**:
1. Sprawdź czy debugger nie jest włączony
2. Uruchom `expo start` bez Metro debugger'a
3. Wyłącz Fast Refresh (naciśnij 's' w Metro)

---

## 📁 Struktura Projektu

Po poprawnej instalacji powinieneś mieć:

```
projekt/
├── server.js                 # Backend główny
├── package.json              # Backend zależności
├── .env.example              # Backend env
├── README.md                 # Backend dokumentacja
├── ADVANCED-CONFIG.js        # Backend konfiguracja zaawansowana
│
├── frontend/
│   ├── App.js               # Frontend główny
│   ├── app.json             # Expo konfiguracja
│   ├── package.json         # Frontend zależności
│   ├── .env.example         # Frontend env
│   ├── babel.config.js      # Babel konfiguracja
│   ├── README.md            # Frontend dokumentacja
│   │
│   ├── screens/             # Ekrany aplikacji
│   ├── services/            # Serwisy API
│   ├── utils/               # Funkcje pomocnicze
│   └── node_modules/        # Zależności
│
├── test-api.sh              # Skrypt testów backend'u
└── client-example.js        # Przykładowy klient Node.js
```

---

## 🎯 Szybki Start (Skrót)

Dla niecierpliwych:

```bash
# Terminal 1 - Backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
npm start

# Na telefonie - odskanuj QR kod lub wejdź na http://localhost:19006
```

---

## 📚 Następne Kroki

Po poprawnej instalacji:

1. **Przeczytaj dokumentację**:
   - `README.md` - Backend
   - `frontend/README.md` - Frontend

2. **Eksploruj kod**:
   - `server.js` - Logika backend'u
   - `frontend/App.js` - Nawigacja aplikacji

3. **Testuj**:
   - Wpisz różne numery
   - Sprawdź historię
   - Zmień ustawienia

4. **Rozbudowuj**:
   - Dodaj nowe typy spamu
   - Rozbuduj UI
   - Dodaj powiadomienia

---

## ❓ FAQ

**P: Czy mogę uruchomić tylko frontend bez backend'u?**
O: Nie, frontend wymaga backend'u do działania.

**P: Czy aplikacja pracuje offline?**
O: Historia pracuje offline, ale analiza nowych numerów wymaga internetu.

**P: Czy mogę zmienić port backend'u?**
O: Tak, ustaw zmienną `PORT` lub zmień w `server.js`.

**P: Czy mogę budować aplikację do sklepu?**
O: Tak, użyj `eas build` (patrz `frontend/README.md`).

---

## 🆘 Potrzeba Pomocy?

1. Sprawdź `README.md` w folderze backend'u
2. Sprawdź `frontend/README.md`
3. Czytaj logi błędów w konsoli
4. Sprawdź czy porty są dostępne
5. Spróbuj restart (Ctrl+C i ponownie start)

---

**Gratulacje! Powinna mieć teraz w pełni funkcjonalną aplikację! 🎉**

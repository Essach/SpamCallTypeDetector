# 🎉 OdebraćTelefon - Kompletny Projekt

**Gratulacje!** Właśnie otrzymałeś **kompletny, gotowy do użytku projekt** składający się z:

1. ✅ **Backend Node.js + Express** - Scrapowanie i analiza spamu
2. ✅ **Frontend React Native + Expo** - Aplikacja mobilna  
3. ✅ **Pełna dokumentacja** - Wszystko co potrzebujesz
4. ✅ **Przykłady i testy** - Szybki start

---

## 📁 Co Jest w Folderze?

### Backend Files
```
server.js                  ← GŁÓWNY SERWER
package.json              ← Zależności backend'u
.env.example-backend      ← Zmienne środowiska
README-backend.md         ← Dokumentacja API
```

### Frontend Folder
```
frontend/
├── App.js                ← GŁÓWNY KOMPONENT
├── app.json              ← Konfiguracja Expo
├── package.json          ← Zależności
├── README.md             ← Dokumentacja
│
├── screens/              ← 4 Ekrany
│   ├── CheckerScreen.js  
│   ├── ResultsScreen.js  
│   ├── HistoryScreen.js  
│   └── SettingsScreen.js 
│
├── services/             ← API Integration
│   └── apiService.js     
│
└── utils/                ← Helper Functions
    └── helpers.js        
```

### Documentation
```
INSTALLATION.md          ← 👈 ZACZNIJ TUTAJ! Pełny guide
PROJECT_SUMMARY.md       ← Podsumowanie projektu
test-api.sh              ← Bash testy backend'u
client-example.js        ← Przykładowy klient Node.js
```

---

## 🚀 QUICK START (3 MINUTY)

### Terminal 1 - Backend

```bash
# 1. Instalacja
npm install

# 2. Uruchomienie
npm start

# ✅ Powinieneś zobaczyć: "Serwer backend uruchomiony na porcie 3000"
```

### Terminal 2 - Frontend

```bash
# 1. Przejdź do frontend
cd frontend

# 2. Instalacja
npm install --legacy-peer-deps

# 3. Konfiguracja (opcjonalnie, jeśli testujesz na telefonie)
cp .env.example .env
# Edytuj .env i zmień localhost na swój IP

# 4. Uruchomienie
npm start

# ✅ Powinieneś zobaczyć QR kod w terminalu
```

### Testowanie Aplikacji

**Na komputerze** (Web):
- Naciśnij `w` w terminalu frontend'u
- Otwiera się http://localhost:19006

**Na telefonie**:
- Zainstaluj Expo (App Store / Google Play)
- Odskanuj QR kod z terminalu

---

## 📊 Co Robi Projekt?

### Backend

```javascript
// Backend analizuje opinie ze strony odebractelefon.pl:
POST /api/analyze-phone { phoneNumber: "506965423" }

// Zwraca:
{
  spamType: "telemarketer",        // Typ spamu
  confidence: 94,                   // Pewność 0-100%
  comments: [...],                  // Opinie użytkowników
  recommendation: {
    verdict: "WYSOKIE RYZYKO",     // Rekomendacja
    shouldAnswer: "NIE ODBIERAJ"
  }
}
```

### Frontend

Aplikacja pozwala:
- ✅ Wpisać numer telefonu
- ✅ Uzyskać analizę spamu
- ✅ Przeczytać opinie użytkowników
- ✅ Zapisać w historii
- ✅ Udostępnić wyniki
- ✅ Zmienić ustawienia

---

## 🛠️ Główne Technologie

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Cheerio** - HTML scraping
- **Axios** - HTTP requests

### Frontend
- **React Native** - Mobilny framework
- **Expo** - Platforma
- **React Navigation** - Routing
- **Axios** - API calls
- **AsyncStorage** - Local storage

---

## 📖 Dokumentacja

### MUSISZ PRZECZYTAĆ
1. **INSTALLATION.md** - Pełny guide instalacji
2. **frontend/README.md** - Dokumentacja aplikacji
3. **README-backend.md** - Dokumentacja API

### Opcjonalnie
- **PROJECT_SUMMARY.md** - Podsumowanie
- **ADVANCED-CONFIG.js** - Zaawansowane konfiguracje

---

## ✨ Highlights Projektu

### Backend
- 🔍 Inteligentna analiza 13 typów spamu
- ⚡ Caching (1 godzina TTL)
- 🎯 Dokładne słowa kluczowe
- 📊 Analiza statystyk
- 🛡️ Error handling

### Frontend
- 🎨 Material Design UI
- 📱 Responsywny layout
- 🔄 AsyncStorage caching
- 💬 Filtrowanie komentarzy
- ⚙️ Konfiguracja URL

---

## 🎯 Test Projektu

### 1. Sprawdzenie Backend'u

```bash
# W terminalu backend'u powinna być:
✅ Serwer backend uruchomiony na porcie 3000
📱 POST /api/analyze-phone
💬 POST /api/get-comments
📊 POST /api/get-statistics
🏥 GET /api/health
```

### 2. Test API

```bash
# W nowym terminalu:
curl http://localhost:3000/api/health

# Powinna zwrócić:
{"status":"OK","message":"Backend jest aktywny"}
```

### 3. Testowanie Aplikacji

1. Otwórz aplikację (web lub telefon)
2. Wpisz numer: `506965423`
3. Naciśnij "Sprawdź numer"
4. Powinna pojawić się analiza

---

## ⚙️ Konfiguracja

### Backend (.env.example-backend)

```env
PORT=3000                    # Port serwera
CACHE_TTL=3600              # Cache timeout (sekundy)
REQUEST_TIMEOUT=10000       # Timeout żądań (ms)
DEBUG=false                 # Debug mode
```

### Frontend (frontend/.env.example)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
# ⚠️ ZMIEŃ localhost NA SWÓJ IP JEŚLI TESTUJESZ NA TELEFONIE
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

---

## 🚨 Częste Błędy

### "Backend niedostępny"
- ✅ Sprawdź czy backend jest uruchomiony (`npm start`)
- ✅ Sprawdź URL w frontend/.env
- ✅ Jeśli telefon - użyj IP zamiast localhost

### "npm ERR! code ERESOLVE"
```bash
npm install --legacy-peer-deps
```

### "Port 3000 jest zajęty"
```bash
# Znajdź proces
lsof -i :3000

# Zabij proces
kill -9 <PID>
```

### Historia nie jest zapisywana
- Sprawdź czy w ustawieniach włączono "Zapisywanie historii"
- Wyczyść cache aplikacji

---

## 📋 Pliki CSS/Style

Frontend używa **StyleSheet** z React Native - wszystkie style są zdefiniowane w plikach JS.

Główne kolory:
- Primary: `#10B981` (Green)
- Danger: `#EF4444` (Red)
- Warning: `#F59E0B` (Orange)

---

## 🔌 API Endpoints

### Analizy
```
POST /api/analyze-phone
Body: { phoneNumber: "506965423" }
```

### Komentarze
```
POST /api/get-comments
Body: { phoneNumber: "506965423", filter: { rating: 1 } }
```

### Statystyki
```
POST /api/get-statistics
Body: { phoneNumber: "506965423" }
```

### Health
```
GET /api/health
```

---

## 🎓 Następne Kroki

### Dla Początkujących
1. Przeczytaj INSTALLATION.md
2. Zainstaluj zależności
3. Uruchom backend i frontend
4. Testuj aplikację

### Dla Zaawansowanych
1. Czytaj kod backend'u (server.js)
2. Czytaj komponenty frontend'u (screens/)
3. Eksploruj ADVANCED-CONFIG.js
4. Rozbuduj funkcjonalność

### Deployment
1. Backend - Heroku/Railway
2. Frontend - Expo EAS build
3. Produkcja - HTTPS, auth, etc.

---

## 🆘 Potrzebujesz Pomocy?

### Dokumentacja
- 📖 INSTALLATION.md - Setup
- 📖 frontend/README.md - Frontend
- 📖 README-backend.md - Backend
- 📖 PROJECT_SUMMARY.md - Overview

### Pliki Testowe
- 🧪 test-api.sh - Bash testy
- 🧪 client-example.js - Node.js testy

### Przykłady
- 📝 client-example.js - Jak używać API z Node.js
- 📝 ADVANCED-CONFIG.js - Zaawansowane konfiguracje

---

## ✅ Checklist Instalacji

```
[ ] Node.js zainstalowany (node -v)
[ ] npm zainstalowany (npm -v)
[ ] Backend: npm install
[ ] Backend: npm start (Terminal 1)
[ ] Frontend: cd frontend
[ ] Frontend: npm install --legacy-peer-deps
[ ] Frontend: cp .env.example .env
[ ] Frontend: npm start (Terminal 2)
[ ] Testowanie: Odskanuj QR kod
[ ] Test numeru: 506965423
[ ] Historia: Sprawdź ostatnie wyszukiwania
[ ] Ustawienia: Zmień URL (opcjonalnie)
```

---

## 🎉 Gratulacje!

**Masz teraz pełny projekt do pracy!**

### Następnym razem
1. Przeczytaj dokumentację
2. Zainstaluj zależności
3. Uruchom backend
4. Uruchom frontend
5. Ciesz się aplikacją! 🚀

---

## 📞 Szybkie Linki

| Link | Opis |
|------|------|
| [INSTALLATION.md](./INSTALLATION.md) | 👈 Zacznij tutaj! |
| [frontend/README.md](./frontend/README.md) | Dokumentacja Frontend |
| [README-backend.md](./README-backend.md) | Dokumentacja Backend |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Podsumowanie |

---

## 📄 Licencja

MIT - Wolny do użytku 🎁

---

**Powodzenia w pracy z projektem! 🚀**

Jeśli masz pytania - poczytaj dokumentację w folderze.  
Wszystko jest tutaj! 📚


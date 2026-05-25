# 🏗️ Architektura Projektu OdebraćTelefon

## 📊 Diagram Aplikacji

```
┌─────────────────────────────────────────────────────────────────┐
│                     ODEBRAC TELEFON APP                          │
│                   (React Native + Expo)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Axios HTTP
                              │ (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NODE.JS + EXPRESS API                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/analyze-phone                                 │  │
│  │  POST /api/get-comments                                  │  │
│  │  POST /api/get-statistics                                │  │
│  │  GET /api/health                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Axios + Cheerio
                              │ Web Scraping
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ODEBRACTELEFON.PL                                   │
│              (Źródło danych)                                     │
│                                                                  │
│  https://www.odebractelefon.pl/numer-telefonu/506965423         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow Aplikacji

### 1. User -> Frontend

```
User
  │
  ├─ Wpisz numer telefonu
  │
  ├─ Naciśnij "Sprawdź"
  │
  └─ Frontend przygotowuje request
```

### 2. Frontend -> Backend

```
Axios POST
│
├─ URL: http://localhost:3000/api/analyze-phone
├─ Body: { phoneNumber: "506965423" }
│
└─ Headers: Content-Type: application/json
```

### 3. Backend - Processing

```
Backend receives request
  │
  ├─ 1. Czyszczenie numeru (506965423)
  │
  ├─ 2. Scrapowanie HTML z odebractelefon.pl
  │     └─ Cheerio - parsing <div class="review">
  │
  ├─ 3. Ekstrakcja danych
  │     ├─ Kategoria (telemarketer, etc)
  │     ├─ Ocena (1-5)
  │     ├─ Komentarz
  │     └─ Autor
  │
  ├─ 4. Analiza słów kluczowych
  │     └─ Szukaj w każdym typie spamu
  │
  ├─ 5. Obliczanie confidence
  │     └─ % pewności (0-100%)
  │
  └─ 6. Cachowanie rezultatu (1 godzina)
```

### 4. Backend -> Frontend (Response)

```javascript
{
  success: true,
  phoneNumber: "506965423",
  reviewCount: 6,
  averageRating: "1.00",
  categories: {
    "Telemarketer": 4,
    "Ankieta": 1,
    "szkoła języków obcych": 1
  },
  spamAnalysis: {
    mostLikelySpam: "telemarketer",
    confidence: 94,
    spamTypes: [...],
    recommendation: {
      verdict: "WYSOKIE RYZYKO",
      shouldAnswer: "NO"
    }
  }
}
```

### 5. Frontend - Rendering

```
Response received
  │
  ├─ ResultsScreen.js renders
  │
  ├─ 1. Verdict Card (Wysokie ryzyko)
  ├─ 2. Confidence Meter (94%)
  ├─ 3. Rating Distribution (6 negatywne)
  ├─ 4. Spam Types (Top 3)
  ├─ 5. Comments (Filtrowane)
  │
  └─ User sees results
```

### 6. User Actions

```
User can:
  │
  ├─ Share results (Share API)
  ├─ View comments (FlatList + Filter)
  ├─ Go to history (AsyncStorage)
  ├─ Check settings
  │
  └─ OR check another number
```

---

## 📦 Struktura Danych

### Database-like Structure (AsyncStorage)

```javascript
// History
{
  "phone_history": [
    {
      id: 1715738345000,
      phoneNumber: "506965423",
      spamType: "telemarketer",
      confidence: 94,
      date: "2026-05-14T14:32:25.000Z",
      fullData: { ...analysisResult }
    },
    { ... }
  ]
}

// Settings
{
  "app_settings": {
    apiUrl: "http://localhost:3000",
    notificationsEnabled: true,
    darkMode: true,
    saveHistory: true
  }
}
```

---

## 🔌 API Request/Response Flow

### Request

```
POST /api/analyze-phone HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 32

{"phoneNumber":"506965423"}
```

### Processing

```javascript
// server.js
app.post('/api/analyze-phone', async (req, res) => {
  const { phoneNumber } = req.body;  // "506965423"
  
  // 1. Validate
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  // 2. Check cache
  const cached = cache.get(cleanNumber);
  if (cached) return res.json(cached);
  
  // 3. Scrape
  const data = await scrapePhoneNumber(cleanNumber);
  
  // 4. Analyze
  const analysis = analyzeSpam(data.reviews);
  
  // 5. Cache
  cache.set(cleanNumber, result);
  
  // 6. Return
  res.json(result);
});
```

### Response

```json
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234

{
  "success": true,
  "phoneNumber": "506965423",
  "spamAnalysis": {
    "mostLikelySpam": "telemarketer",
    "confidence": 94
  }
}
```

---

## 🎨 Frontend Architecture

### Navigation Structure

```
App.js (NavigationContainer)
  │
  └─ Tab.Navigator (Bottom Tabs)
      │
      ├─ Checker Stack
      │  ├─ CheckerScreen
      │  └─ ResultsScreen
      │
      ├─ History Stack
      │  ├─ HistoryScreen
      │  └─ ResultsScreen (from history)
      │
      └─ Settings Stack
         └─ SettingsScreen
```

### Screen Lifecycle

```
CheckerScreen
  │
  ├─ STATE:
  │  ├─ phoneNumber: string
  │  ├─ loading: boolean
  │  ├─ backendConnected: boolean
  │  └─ recentSearches: array
  │
  ├─ EFFECTS:
  │  ├─ useEffect - check backend
  │  └─ useEffect - load history
  │
  ├─ HANDLERS:
  │  ├─ handleAnalyze()
  │  ├─ handleRecentSearch()
  │  └─ handleQuickAnalyze()
  │
  └─ RENDER:
     ├─ Status Card
     ├─ Input Field
     ├─ Analyze Button
     ├─ Recent Searches
     └─ Info Card
```

---

## 💾 Data Flow Diagram

```
USER INPUT
    │
    ▼
VALIDATION
    ├─ Length check (7-15 chars)
    ├─ Format check ([0-9+])
    │
    └─ ❌ Invalid → Show Alert
    
    ✅ Valid → Continue
    │
    ▼
API REQUEST
    │
    ├─ POST to /api/analyze-phone
    │
    └─ Response
        │
        ├─ ✅ Success
        │   │
        │   ├─ Save to history (AsyncStorage)
        │   ├─ Navigate to Results
        │   │
        │   └─ DISPLAY RESULTS
        │
        └─ ❌ Error
            │
            └─ Show Alert
```

---

## 🔍 Spam Analysis Algorithm

```
ALGORITHM: AnalyzeSpam

INPUT: Array of reviews

PROCESS:
  1. Combine all text from reviews
  2. For each spam type:
     └─ Count keyword matches
  3. Sort by match count (descending)
  4. Return top 3 types with confidence

CONFIDENCE CALCULATION:
  confidence = (matchCount * 15) %  // Rough estimate
  confidence = min(100%, confidence)

OUTPUT: {
  mostLikelySpam: string,
  confidence: number (0-100),
  spamTypes: array of { type, confidence, matchCount }
}
```

---

## 🏪 Cache Strategy

```
REQUEST FOR "506965423"
    │
    ├─ Check cache
    │  │
    │  ├─ CACHE HIT (< 1 hour old)
    │  │  └─ Return cached result ⚡ (instant)
    │  │
    │  └─ CACHE MISS / EXPIRED
    │     │
    │     ├─ Scrape odebractelefon.pl
    │     ├─ Analyze spam
    │     ├─ Cache result (TTL: 3600s)
    │     └─ Return result
    │
    └─ RESPONSE to client
```

---

## 🔐 Error Handling

```
TRY
  │
  ├─ Scrape website
  │  │
  │  ├─ Timeout (10s)
  │  ├─ 404 - Page not found
  │  ├─ 500 - Server error
  │  └─ Network error
  │
  ├─ Parse HTML
  │  │
  │  └─ Invalid structure
  │
  └─ Return data
      
CATCH
  │
  ├─ Log error
  ├─ Return error response
  │  └─ { success: false, error: "..." }
  │
  └─ Frontend shows Alert
```

---

## 📈 Performance Optimization

### Backend
- ✅ Node-cache (avoid re-scraping)
- ✅ HTTP timeout (10s)
- ✅ Efficient regex for keyword matching

### Frontend
- ✅ AsyncStorage caching
- ✅ FlatList (virtualized lists)
- ✅ Lazy loading comments
- ✅ Memoization (optional)

---

## 🔄 Offline Capability

```
ONLINE MODE
  │
  ├─ Can analyze new numbers
  └─ Can view comments from backend

OFFLINE MODE
  │
  ├─ ❌ Cannot analyze new numbers
  ├─ ✅ Can view history (AsyncStorage)
  └─ ✅ Can view cached results
```

---

## 📱 Component Hierarchy

```
App.js
│
├─ NavigationContainer
│  └─ Tab.Navigator
│     │
│     ├─ CheckerStack
│     │  ├─ CheckerScreen
│     │  └─ ResultsScreen
│     │     ├─ VerdictCard
│     │     ├─ ConfidenceMeter
│     │     ├─ RatingSection
│     │     ├─ SpamTypesSection
│     │     ├─ CategoriesSection
│     │     └─ CommentsSection
│     │
│     ├─ HistoryStack
│     │  ├─ HistoryScreen
│     │  │  └─ HistoryItem (FlatList)
│     │  └─ ResultsScreen
│     │
│     └─ SettingsStack
│        └─ SettingsScreen
│           ├─ SettingCard
│           ├─ LinkCard
│           └─ FooterText

services/
└─ apiService.js
   ├─ phoneService
   ├─ historyService
   └─ settingsService

utils/
└─ helpers.js
   ├─ colors
   ├─ spamLevels
   ├─ formatters
   ├─ validators
   └─ converters
```

---

## 🚀 Deployment Architecture

```
PRODUCTION SETUP
│
├─ Frontend
│  ├─ iOS (App Store)
│  ├─ Android (Google Play)
│  └─ Web (https://app.odebractelefon.pl)
│
├─ Backend
│  ├─ Heroku / Railway / VPS
│  ├─ HTTPS (Let's Encrypt)
│  ├─ Node.js cluster
│  └─ Redis cache
│
├─ Database (optional)
│  ├─ MongoDB
│  └─ User history
│
└─ CDN
   └─ Static assets
```

---

## 🔗 Integration Points

### External APIs
- **odebractelefon.pl** - Data source (public HTML)

### Internal APIs
- **Express endpoints** - 4 routes
- **Cheerio** - HTML parser
- **Axios** - HTTP client

### Local Storage
- **AsyncStorage** - History & settings

---

## 📊 Data Models

### Analysis Result

```typescript
{
  success: boolean,
  phoneNumber: string,
  url: string,
  reviewCount: number,
  averageRating: string,
  categories: { [key: string]: number },
  mostCommonCategory: string,
  spamAnalysis: {
    mostLikelySpam: string,
    confidence: number,
    spamTypes: Array<{
      type: string,
      confidence: number,
      matchCount: number
    }>,
    recommendation: {
      verdict: string,
      message: string,
      shouldAnswer: string,
      spamType: string
    }
  }
}
```

### Review/Comment

```typescript
{
  category: string,
  rating: number, // 1, 3, or 5
  author: string,
  comment: string,
  date: string
}
```

---

**Architecture zrozumiała? 🎨**

Teraz możesz czytać kod ze zrozumieniem! 📚

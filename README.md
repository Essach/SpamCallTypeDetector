# Backend OdebraćTelefon - Dokumentacja API

## 📖 Opisanie

Backend do scrapowania opinii i ocen ze strony https://www.odebractelefon.pl oraz analizy najprawdopodobniejszego typu spamu na podstawie słów kluczowych w komentarzach.

## 🚀 Instalacja

### Wymagania
- Node.js v14 lub wyżej
- npm lub yarn

### Kroki instalacji

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera
npm start

# Dla développmentu (z auto-reload)
npm run dev
```

Serwer powinien być dostępny na `http://localhost:3000`

---

## 📡 API Endpoints

### 1. **POST /api/analyze-phone** - Analiza numeru telefonu

Analizuje numer telefonu i zwraca najprawdopodobniejszy typ spamu.

#### Request

```json
{
  "phoneNumber": "506965423"
}
```

#### Response

```json
{
  "success": true,
  "phoneNumber": "506965423",
  "url": "https://www.odebractelefon.pl/numer-telefonu/506965423",
  "reviewCount": 6,
  "averageRating": "1.00",
  "categories": {
    "Telemarketer": 4,
    "Ankieta": 1,
    "szkoła języków obcych (Telemarketer)": 1
  },
  "mostCommonCategory": "Telemarketer",
  "spamAnalysis": {
    "mostLikelySpam": "telemarketer",
    "confidence": 94,
    "spamTypes": [
      {
        "type": "telemarketer",
        "confidence": 94,
        "matchCount": 7
      },
      {
        "type": "survey",
        "confidence": 15,
        "matchCount": 1
      }
    ],
    "ratingAnalysis": {
      "negativeCount": 6,
      "neutralCount": 0,
      "positiveCount": 0,
      "negativePercentage": "100.00",
      "spamProbability": 100
    },
    "recommendation": {
      "verdict": "WYSOKIE RYZYKO SPAMU",
      "message": "Na podstawie 6 opinii, ten numer ma 100% szansy bycia spamem.",
      "shouldAnswer": "NO",
      "spamType": "telemarketer"
    }
  },
  "scrapedAt": "2026-05-13T14:30:45.123Z"
}
```

#### Przykład cURL

```bash
curl -X POST http://localhost:3000/api/analyze-phone \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "506965423"}'
```

#### Przykład JavaScript

```javascript
async function analyzePhone(phoneNumber) {
  const response = await fetch('http://localhost:3000/api/analyze-phone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber })
  });
  
  const data = await response.json();
  return data;
}

// Użycie
analyzePhone('506965423').then(result => {
  console.log(result.spamAnalysis.mostLikelySpam);
  console.log(result.spamAnalysis.recommendation);
});
```

#### Możliwe Typy Spamu

- `telemarketer` - Telemarketing
- `fraudScam` - Oszustwo/Scam
- `debtCollection` - Windykacja/Ściąganie długów
- `silentCall` - Cicha rozmowa/dzwonka
- `unwantedCall` - Nechciany telefon
- `maliciousCall` - Złośliwe połączenie
- `callCenter` - Call center
- `survey` - Ankieta
- `nonProfit` - Organizacja non-profit
- `political` - Polityka
- `fax` - Fax
- `sms` - SMS
- `automat` - Automat

---

### 2. **POST /api/get-comments** - Pobranie komentarzy

Pobiera wszystkie komentarze dla danego numeru telefonu z opcjonalnym filtrowaniem.

#### Request

```json
{
  "phoneNumber": "506965423",
  "filter": {
    "rating": 1,
    "category": "Telemarketer",
    "hasComment": true
  }
}
```

**Parametry filtru (wszystkie opcjonalne):**
- `rating` - Ocena: `1` (negatywna), `3` (neutralna), `5` (pozytywna)
- `category` - Filtr po kategorii (tekst do wyszukania)
- `hasComment` - `true` aby wyświetlić tylko komentarze z tekstem

#### Response

```json
{
  "success": true,
  "phoneNumber": "506965423",
  "totalComments": 6,
  "filteredCount": 2,
  "comments": [
    {
      "category": "szkoła języków obcych (Telemarketer)",
      "rating": 1,
      "ratingLabel": "Negatywna",
      "author": "Pablo",
      "comment": "dosyć natarczywa osoba chciała wcisnąć darmową godzinę nauki w szkole języków obcych, nawet ich konsultant ma dzwonić w ciągu 48 godzin, chociaż żadnego potwierdzenia chęci z mojej strony nie było.",
      "date": "12.05.2026"
    },
    {
      "category": "Telemarketer",
      "rating": 1,
      "ratingLabel": "Negatywna",
      "author": "Anonimowy",
      "comment": "Zaproszenie na darmową lekcję angielskiego",
      "date": ""
    }
  ]
}
```

#### Przykład cURL

```bash
# Pobierz wszystkie komentarze
curl -X POST http://localhost:3000/api/get-comments \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "506965423"}'

# Pobierz tylko negatywne komentarze z tekstem
curl -X POST http://localhost:3000/api/get-comments \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "506965423",
    "filter": {
      "rating": 1,
      "hasComment": true
    }
  }'
```

#### Przykład JavaScript

```javascript
async function getComments(phoneNumber, filter = {}) {
  const response = await fetch('http://localhost:3000/api/get-comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber, filter })
  });
  
  return await response.json();
}

// Użycie
getComments('506965423', { rating: 1, hasComment: true })
  .then(data => {
    console.log(`Znaleźliśmy ${data.filteredCount} negatywnych komentarzy`);
    data.comments.forEach(comment => {
      console.log(`${comment.author}: ${comment.comment}`);
    });
  });
```

---

### 3. **POST /api/get-statistics** - Statystyki numeru

Pobiera szczegółowe statystyki dla numeru telefonu.

#### Request

```json
{
  "phoneNumber": "506965423"
}
```

#### Response

```json
{
  "success": true,
  "statistics": {
    "phoneNumber": "506965423",
    "totalReviews": 6,
    "averageRating": "1.00",
    "categories": {
      "Telemarketer": 4,
      "Ankieta": 1,
      "szkoła języków obcych (Telemarketer)": 1
    },
    "ratingDistribution": {
      "negative": 6,
      "neutral": 0,
      "positive": 0
    },
    "mostCommonCategory": "Telemarketer",
    "spamProbability": 100
  }
}
```

#### Przykład cURL

```bash
curl -X POST http://localhost:3000/api/get-statistics \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "506965423"}'
```

---

### 4. **GET /api/health** - Health Check

Sprawdza czy serwer jest aktywny.

#### Response

```json
{
  "status": "OK",
  "message": "Backend jest aktywny"
}
```

#### Przykład cURL

```bash
curl http://localhost:3000/api/health
```

---

## 🔍 Mechanizm Analizy Spamu

Backend analizuje spam na dwa sposoby:

### 1. Analiza Słów Kluczowych
- System przeszukuje wszystkie komentarze i kategorie w poszukiwaniu słów charakterystycznych dla danego typu spamu
- Każde słowo kluczowe zwiększa "confidence" danego typu spamu
- Zwraca Top 3 najprawdopodobniejsze typy spamu

### 2. Analiza Ocen
- Liczba opinii negatywnych (ocena 1)
- Procent negatywnych opinii
- `spamProbability` = (liczba negatywnych opinii / wszystkie opinie) * 100

### Poziomy Ryzyka

| Ryzyko | Spam Probability | Akcja |
|--------|------------------|-------|
| WYSOKIE | ≥ 80% | NIE ODBIERAJ |
| ŚREDNIE | 50-79% | OSTROŻNIE |
| NISKIE | 20-49% | MOŻLIWE |
| BEZPIECZNE | < 20% | TAK ODBIERAJ |

---

## 💾 Caching

Backend automatycznie cachuje wyniki na **1 godzinę** dla każdego numeru telefonu. To zmniejsza liczbę zapytań do serwisu i przyspiesza odpowiedzi.

Aby wyczyścić cache, zrestartuj serwer.

---

## 🛠️ Rozszerzenia

### Dodanie Nowych Słów Kluczowych

Edytuj obiekt `spamKeywords` w `server.js`:

```javascript
const spamKeywords = {
  yourNewSpamType: [
    'słowo1', 'słowo2', 'słowo3'
  ]
};
```

### Zmiana Czasu Cache'u

Zmień parametr `stdTTL` w:
```javascript
const cache = new NodeCache({ stdTTL: 3600 }); // czas w sekundach
```

### Dodanie Logowania

```javascript
console.log(`Analizuję: ${phoneNumber}`);
```

---

## ⚠️ Błędy i Rozwiązania

### "Nie udało się pobrać danych dla tego numeru telefonu"

- Sprawdź połączenie internetowe
- Serwis odebractelefon.pl może być niedostępny
- Spróbuj ponownie za chwilę

### "Numer telefonu jest zbyt krótki"

- Podaj co najmniej 7 cyfr
- Format: `506965423` lub `+48506965423`

### Timeout

- Zwiększ timeout w kodzie
- Sprawdź szybkość internetu

---

## 📊 Przykład Integracji Frontend

```javascript
// React Hook
import { useState } from 'react';

function PhoneAnalyzer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/analyze-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <input 
        value={phoneNumber} 
        onChange={(e) => setPhoneNumber(e.target.value)} 
        placeholder="Numer telefonu"
      />
      <button onClick={analyze} disabled={loading}>
        {loading ? 'Analizuję...' : 'Analizuj'}
      </button>
      
      {result && (
        <div>
          <h3>{result.spamAnalysis.recommendation.verdict}</h3>
          <p>Confidence: {result.spamAnalysis.confidence}%</p>
          <p>Rekomendacja: {result.spamAnalysis.recommendation.shouldAnswer}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 Bezpieczeństwo

- Nie przechowujemy żadnych danych osobowych
- Logi dostępu do numerów mogą być rejestrowane
- CORS może być skonfigurowany dla produkcji
- Wszystkie dane pochodzą z publicznego serwisu

---

## 📝 Licencja

MIT

---

## 🤝 Wsparcie

W przypadku problemów, sprawdź:
1. Czy Node.js jest zainstalowany (`node -v`)
2. Czy wszystkie zależności zostały zainstalowane (`npm install`)
3. Czy port 3000 jest dostępny
4. Czy odebractelefon.pl jest dostępny
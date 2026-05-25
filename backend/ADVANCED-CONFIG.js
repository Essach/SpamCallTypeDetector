/**
 * ADVANCED CONFIGURATION EXAMPLES
 * 
 * Ta sekcja zawiera zaawansowane przykłady użycia i rozszerzeń
 */

// ============================================================
// 1. ROZSZERZENIE SŁÓW KLUCZOWYCH
// ============================================================

/*
Aby dodać nowe słowa kluczowe, edytuj "spamKeywords" w server.js:

const spamKeywords = {
  telemarketer: [
    'telemarketer', 'oferta', 'produkt', 'usług', 'darmow', 'promocj',
    // ... dodaj tutaj nowe słowa
  ],
  // Dodaj nowy typ spamu
  insurance: [
    'ubezpieczenie', 'polisa', 'ochrona', 'czego', 'rozliczenie',
    'agent ubezpieczeniowy', 'oferta ubezpieczenia'
  ]
};
*/

// ============================================================
// 2. INTEGRACJA Z BAZĄ DANYCH (MongoDB)
// ============================================================

/*
const mongoose = require('mongoose');

// Schema dla przechowywania analizy spamu
const phoneAnalysisSchema = new mongoose.Schema({
  phoneNumber: String,
  spamType: String,
  confidence: Number,
  reviewCount: Number,
  analysis: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PhoneAnalysis = mongoose.model('PhoneAnalysis', phoneAnalysisSchema);

// Funkcja do zapisania w bazie
async function saveAnalysisToDb(phoneNumber, analysis) {
  const record = new PhoneAnalysis({
    phoneNumber,
    spamType: analysis.mostLikelySpam,
    confidence: analysis.confidence,
    reviewCount: analysis.ratingAnalysis.spamProbability,
    analysis
  });
  return await record.save();
}

// Endpoint do pobierania z cache'u bazy
app.post('/api/analyze-phone-cached', async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Sprawdzenie bazy
  const cached = await PhoneAnalysis.findOne({ phoneNumber });
  
  if (cached && new Date() - cached.updatedAt < 24 * 60 * 60 * 1000) {
    return res.json({ success: true, fromCache: true, data: cached });
  }
  
  // Jeśli nie ma w bazie, scrapuj i zapisz
  const result = await scrapePhoneNumber(phoneNumber);
  const analysis = analyzeSpam(result.reviews);
  await saveAnalysisToDb(phoneNumber, analysis);
  
  res.json({ success: true, fromCache: false, data: analysis });
});
*/

// ============================================================
// 3. WEBHOOK NOTYFIKACJI
// ============================================================

/*
// Wysyłanie notyfikacji gdy spamProbability > 80%
const axios = require('axios');

async function notifyIfHighRisk(phoneNumber, spamAnalysis) {
  if (spamAnalysis.analysis.spamProbability >= 80) {
    await axios.post(process.env.WEBHOOK_URL, {
      phoneNumber,
      spamType: spamAnalysis.mostLikelySpam,
      confidence: spamAnalysis.confidence,
      timestamp: new Date()
    });
  }
}

// W endpoint'e analyze-phone
const spamAnalysis = analyzeSpam(scrapedData.reviews);
await notifyIfHighRisk(cleanNumber, spamAnalysis);
*/

// ============================================================
// 4. RATE LIMITING
// ============================================================

/*
const rateLimit = require('express-rate-limit');

// Limit: 100 requestów na 15 minut
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Zbyt dużo requestów, spróbuj później'
});

app.use(limiter);

// Lub specific limiter dla analyze-phone
const analyzeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.phoneNumber
});

app.post('/api/analyze-phone', analyzeLimiter, async (req, res) => {
  // ...
});
*/

// ============================================================
// 5. AUTENTYKACJA (JWT)
// ============================================================

/*
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware do weryfikacji token'u
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token wymagany' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieważny token' });
  }
}

// Endpoint do logowania
app.post('/api/login', (req, res) => {
  const token = jwt.sign({ userId: 'user123' }, JWT_SECRET, {
    expiresIn: '24h'
  });
  res.json({ token });
});

// Protected endpoint
app.post('/api/analyze-phone', verifyToken, async (req, res) => {
  // ...
});
*/

// ============================================================
// 6. LOGGING I MONITORING
// ============================================================

/*
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// W każdym request'cie
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    timestamp: new Date()
  });
  next();
});

// Logowanie błędów
app.use((err, req, res, next) => {
  logger.error('Błąd:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date()
  });
  res.status(500).json({ error: err.message });
});
*/

// ============================================================
// 7. BATCH PROCESSING
// ============================================================

/*
// Analiza wielu numerów na raz
app.post('/api/analyze-batch', async (req, res) => {
  const { phoneNumbers } = req.body;
  
  if (!Array.isArray(phoneNumbers) || phoneNumbers.length > 100) {
    return res.status(400).json({ 
      error: 'Maksymalnie 100 numerów na raz' 
    });
  }
  
  const results = [];
  
  for (const phoneNumber of phoneNumbers) {
    try {
      const scrapedData = await scrapePhoneNumber(phoneNumber);
      const analysis = analyzeSpam(scrapedData.reviews);
      results.push({
        phoneNumber,
        success: true,
        spamType: analysis.mostLikelySpam,
        confidence: analysis.confidence
      });
    } catch (error) {
      results.push({
        phoneNumber,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    total: phoneNumbers.length,
    successful: results.filter(r => r.success).length,
    results
  });
});
*/

// ============================================================
// 8. EXPORT DANYCH
// ============================================================

/*
const csv = require('csv-writer').createObjectCsvWriter;

// Endpoint do eksportu raportów
app.post('/api/export-report', async (req, res) => {
  const { phoneNumber, format } = req.body;
  
  const scrapedData = await scrapePhoneNumber(phoneNumber);
  const analysis = analyzeSpam(scrapedData.reviews);
  
  if (format === 'csv') {
    const writer = csv({
      path: `/tmp/report_${phoneNumber}.csv`,
      header: [
        { id: 'category', title: 'Kategoria' },
        { id: 'comment', title: 'Komentarz' },
        { id: 'author', title: 'Autor' },
        { id: 'rating', title: 'Ocena' }
      ]
    });
    
    await writer.writeRecords(scrapedData.reviews);
    
    res.download(`/tmp/report_${phoneNumber}.csv`);
  }
  
  // Format JSON
  res.json({
    phoneNumber,
    analysis,
    reviews: scrapedData.reviews
  });
});
*/

// ============================================================
// 9. CACHE OPTIMIZATION
// ============================================================

/*
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

async function getCachedOrFetch(phoneNumber) {
  // Sprawdzenie Redis
  const cached = await redisClient.get(phoneNumber);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Pobierz dane
  const data = await scrapePhoneNumber(phoneNumber);
  
  // Zapisz w Redis na 1 dzień
  await redisClient.setex(phoneNumber, 86400, JSON.stringify(data));
  
  return data;
}
*/

// ============================================================
// 10. MACHINE LEARNING (KLASYFIKACJA SPAMU)
// ============================================================

/*
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-use/universal-sentence-encoder');

// Model do klasyfikacji tekstu
let model;

async function initMLModel() {
  model = await use.load();
}

async function classifyCommentML(comment) {
  const embedding = await model.embed([comment]);
  const data = await embedding.data();
  
  // Porównanie embeddings'ów z znanych spamów
  // ... logika klasyfikacji ...
  
  return { spamScore: 0.85, confidence: 0.92 };
}
*/

// ============================================================
// DEPLOYMENT
// ============================================================

/*
// DOCKER - Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

// docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

// .env.production
NODE_ENV=production
PORT=3000
CACHE_TTL=3600
*/

// ============================================================
// SECURITY BEST PRACTICES
// ============================================================

/*
// 1. Helmet - bezpieczeństwo headers'ów
const helmet = require('helmet');
app.use(helmet());

// 2. CORS - Cross-Origin Resource Sharing
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// 3. Input Validation
const { body, validationResult } = require('express-validator');

app.post('/api/analyze-phone',
  body('phoneNumber')
    .isLength({ min: 7, max: 15 })
    .matches(/^[+0-9\s-()]*$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
);

// 4. Rate limiting (jak wyżej)
// 5. Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000);
  next();
});
*/

console.log('🎓 Advanced Configuration Examples - patrz komentarze w tym pliku');
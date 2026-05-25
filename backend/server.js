const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache na 1 godzinę

// Middleware
app.use(express.json());

// Definicja słów kluczowych dla różnych typów spamu
const spamKeywords = {
  telemarketer: [
    'telemarketer', 'oferta', 'produkt', 'usług', 'darmow', 'promocj',
    'zaproszeni', 'lekcj', 'nauk', 'konsultant', 'natarczyw',
    'wcisnął', 'sprzedaż', 'polis', 'ubezpieczeni', 'kredyt'
  ],
  fraudScam: [
    'oszust', 'oszukańsk', 'scam', 'frauda', 'fałszyw', 'podszyw',
    'haslanyć', 'dane', 'bankow', 'karty', 'pin', 'potwierdzeni',
    'podatek', 'uwierzytelni', 'weryfikacj'
  ],
  debtCollection: [
    'dług', 'zaległ', 'ściągani', 'windykacj', 'komornik', 'sąd',
    'rozprawa', 'należność', 'zapłat', 'ratę', 'przeterminovan'
  ],
  silentCall: [
    'cicha', 'dzwonek', 'tylko dzwonek', 'bez głosu', 'automatycz',
    'zarejestrowana', 'pusta', 'milczacy'
  ],
  unwantedCall: [
    'niechcian', 'niezażądan', 'natrętne', 'bez przyczyny', 'uciążliw',
    'dokuczliw', 'drażniące', 'irytujące'
  ],
  maliciousCall: [
    'złośliw', 'przemocy', 'groźby', 'wyzwiska', 'kierdy', 'prześmiewc',
    'mobbing', 'nękani', 'zastraszani', 'agresj'
  ],
  callCenter: [
    'call center', 'centrum', 'call centre', 'operatorka', 'operator',
    'centrala', 'biuro', 'zespół', 'pracownik'
  ],
  survey: [
    'ankiet', 'badani', 'sondaż', 'opinii', 'opinia', 'pytani',
    'wymniość', 'statystyk', 'badań', 'pytał'
  ],
  nonProfit: [
    'fundacj', 'organizacj', 'charytatywn', 'non-profit', 'wsparci',
    'darowiznę', 'członkowstw', 'dobroczynnie', 'zbior'
  ],
  political: [
    'polityka', 'polityczn', 'wybor', 'kampania', 'kandydat',
    'partia', 'głos', 'poparci', 'wyborcy'
  ],
  fax: [
    'fax', 'faksu', 'faksem', 'faksowy', 'dokument'
  ],
  sms: [
    'sms', 'wiadomość', 'smsem', 'tekst', 'teksowa'
  ],
  automat: [
    'automat', 'automatycz', 'robot', 'system', 'IVR', 'głos syntetycz'
  ]
};

// Funkcja do scrapowania numeru telefonu
async function scrapePhoneNumber(phoneNumber) {
  try {
    // Sprawdzenie cache'u
    const cachedData = cache.get(phoneNumber);
    if (cachedData) {
      return cachedData;
    }

    // Budowanie URL
    const url = `https://www.odebractelefon.pl/numer-telefonu/${phoneNumber}`;
    
    // Pobieranie strony
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // Parsing HTML
    const $ = cheerio.load(data);
    
    // Ekstrakcja recenzji
    const reviews = [];
    const categories = {};
    let totalRating = 0;
    let ratingCount = 0;

    $('.review').each((index, element) => {
      const $review = $(element);
      
      // Pobieranie oceny
      const scoreClass = $review.find('.score').attr('class');
      let rating = null;
      if (scoreClass.includes('negative')) rating = 1;
      else if (scoreClass.includes('neutral')) rating = 3;
      else if (scoreClass.includes('positive')) rating = 5;

      // Pobieranie kategorii
      const category = $review.find('h3 span[itemprop="name"]').text().trim();
      
      // Pobieranie autora
      const author = $review.find('span[itemprop="author"]').text().trim();
      
      // Pobieranie komentarza
      const comment = $review.find('span.review_comment[itemprop="description"]').text().trim();
      
      // Pobieranie daty
      const date = $review.find('time[itemprop="datePublished"]').text().trim();

      if (rating) {
        totalRating += rating;
        ratingCount++;
      }

      // Zliczanie kategorii
      if (category) {
        categories[category] = (categories[category] || 0) + 1;
      }

      reviews.push({
        category,
        rating,
        author,
        comment,
        date,
        reviewId: $review.data('reviewid')
      });
    });

    // Obliczanie średniej oceny
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : null;

    // Wyznaczanie najczęstszej kategorii
    const mostCommonCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    
    const result = {
      phoneNumber,
      url,
      reviewCount: reviews.length,
      averageRating,
      categories,
      mostCommonCategory: mostCommonCategory ? mostCommonCategory[0] : null,
      reviews,
      scrapedAt: new Date().toISOString()
    };

    // Zapisanie w cache'u
    cache.set(phoneNumber, result);

    return result;
  } catch (error) {
    console.error(`Błąd przy scrapowaniu ${phoneNumber}:`, error.message);
    throw error;
  }
}

// Funkcja do analizy spamu na podstawie słów kluczowych
function analyzeSpam(reviews) {
  const keywordMatches = {};
  const allText = reviews
    .map(r => (r.comment + ' ' + r.category).toLowerCase())
    .join(' ');

  // Zliczanie trafionych słów kluczowych
  Object.entries(spamKeywords).forEach(([spamType, keywords]) => {
    let matchCount = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
    });
    if (matchCount > 0) {
      keywordMatches[spamType] = matchCount;
    }
  });

  // Sortowanie i zwrócenie wyniku
  const sortedMatches = Object.entries(keywordMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3 typy spamu

  return {
    spamTypes: sortedMatches.map(([type, count]) => ({
      type,
      confidence: Math.min(100, (count * 15)), // Rough confidence calculation
      matchCount: count
    })),
    mostLikelySpam: sortedMatches.length > 0 ? sortedMatches[0][0] : 'unknown',
    confidence: sortedMatches.length > 0 ? Math.min(100, (sortedMatches[0][1] * 15)) : 0,
    analysis: analyzeByRating(reviews)
  };
}

// Analiza na podstawie ocen
function analyzeByRating(reviews) {
  const negativeReviews = reviews.filter(r => r.rating === 1).length;
  const neutralReviews = reviews.filter(r => r.rating === 3).length;
  const positiveReviews = reviews.filter(r => r.rating === 5).length;

  return {
    negativeCount: negativeReviews,
    neutralCount: neutralReviews,
    positiveCount: positiveReviews,
    negativePercentage: reviews.length > 0 ? ((negativeReviews / reviews.length) * 100).toFixed(2) : 0,
    spamProbability: reviews.length > 0 ? Math.round((negativeReviews / reviews.length) * 100) : 0
  };
}

// ENDPOINT 1: Analiza numeru telefonu
app.post('/api/analyze-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Numer telefonu jest wymagany' });
    }

    // Czyszczenie numeru telefonu
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (cleanNumber.length < 7) {
      return res.status(400).json({ error: 'Numer telefonu jest zbyt krótki' });
    }

    // Scrapowanie
    const scrapedData = await scrapePhoneNumber(cleanNumber);

    // Analiza spamu
    const spamAnalysis = analyzeSpam(scrapedData.reviews);

    // Przygotowanie odpowiedzi
    const response = {
      success: true,
      phoneNumber: scrapedData.phoneNumber,
      url: scrapedData.url,
      reviewCount: scrapedData.reviewCount,
      averageRating: scrapedData.averageRating,
      categories: scrapedData.categories,
      mostCommonCategory: scrapedData.mostCommonCategory,
      spamAnalysis: {
        mostLikelySpam: spamAnalysis.mostLikelySpam,
        confidence: spamAnalysis.confidence,
        spamTypes: spamAnalysis.spamTypes,
        ratingAnalysis: spamAnalysis.analysis,
        recommendation: generateRecommendation(spamAnalysis, scrapedData.reviewCount)
      },
      scrapedAt: scrapedData.scrapedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Błąd w endpoint analyze-phone:', error);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać danych dla tego numeru telefonu',
      details: error.message
    });
  }
});

// ENDPOINT 2: Zwrócenie komentarzy
app.post('/api/get-comments', async (req, res) => {
  try {
    const { phoneNumber, filter } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Numer telefonu jest wymagany' });
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    // Scrapowanie
    const scrapedData = await scrapePhoneNumber(cleanNumber);

    // Filtrowanie komentarzy
    let comments = scrapedData.reviews;

    if (filter) {
      if (filter.rating) {
        comments = comments.filter(r => r.rating === filter.rating);
      }
      if (filter.category) {
        comments = comments.filter(r => r.category.toLowerCase().includes(filter.category.toLowerCase()));
      }
      if (filter.hasComment) {
        comments = comments.filter(r => r.comment && r.comment.length > 0);
      }
    }

    const response = {
      success: true,
      phoneNumber: scrapedData.phoneNumber,
      totalComments: scrapedData.reviewCount,
      filteredCount: comments.length,
      comments: comments.map(comment => ({
        category: comment.category,
        rating: comment.rating,
        ratingLabel: getRatingLabel(comment.rating),
        author: comment.author || 'Anonimowy',
        comment: comment.comment,
        date: comment.date
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Błąd w endpoint get-comments:', error);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać komentarzy',
      details: error.message
    });
  }
});

// ENDPOINT 3: Zwrócenie statystyk (dodatkowy)
app.post('/api/get-statistics', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Numer telefonu jest wymagany' });
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const scrapedData = await scrapePhoneNumber(cleanNumber);

    const stats = {
      phoneNumber: scrapedData.phoneNumber,
      totalReviews: scrapedData.reviewCount,
      averageRating: scrapedData.averageRating,
      categories: scrapedData.categories,
      ratingDistribution: {
        negative: scrapedData.reviews.filter(r => r.rating === 1).length,
        neutral: scrapedData.reviews.filter(r => r.rating === 3).length,
        positive: scrapedData.reviews.filter(r => r.rating === 5).length
      },
      mostCommonCategory: scrapedData.mostCommonCategory,
      spamProbability: Math.round((scrapedData.reviews.filter(r => r.rating === 1).length / scrapedData.reviewCount) * 100) || 0
    };

    res.json({ success: true, statistics: stats });
  } catch (error) {
    console.error('Błąd w endpoint get-statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Nie udało się pobrać statystyk',
      details: error.message
    });
  }
});

// Funkcja pomocnicza do generowania rekomendacji
function generateRecommendation(spamAnalysis, reviewCount) {
  const probability = spamAnalysis.analysis.spamProbability;

  if (reviewCount === 0) {
    return {
      verdict: 'BRAK DANYCH',
      message: 'Brak opinii dla tego numeru w bazie. Bądź ostrożny z nieznanymi numerami.',
      shouldAnswer: 'UNKNOWN'
    };
  }

  if (probability >= 80) {
    return {
      verdict: 'WYSOKIE RYZYKO SPAMU',
      message: `Na podstawie ${reviewCount} opinii, ten numer ma ${probability}% szansy bycia spamem.`,
      shouldAnswer: 'NO',
      spamType: spamAnalysis.mostLikelySpam
    };
  } else if (probability >= 50) {
    return {
      verdict: 'ŚREDNIE RYZYKO',
      message: `${probability}% opinii jest negatywnych. Potencjalnie niechciany numer.`,
      shouldAnswer: 'CAUTION',
      spamType: spamAnalysis.mostLikelySpam
    };
  } else if (probability >= 20) {
    return {
      verdict: 'NISKIE RYZYKO',
      message: `${probability}% opinii jest negatywnych. Zazwyczaj bezpieczny.`,
      shouldAnswer: 'MAYBE',
      spamType: spamAnalysis.mostLikelySpam
    };
  } else {
    return {
      verdict: 'BEZPIECZNY',
      message: `Tylko ${probability}% opinii jest negatywnych. Wygląda na bezpieczny numer.`,
      shouldAnswer: 'YES',
      spamType: 'legitimate'
    };
  }
}

// Funkcja do konwersji oceny na label
function getRatingLabel(rating) {
  switch (rating) {
    case 1:
      return 'Negatywna';
    case 3:
      return 'Neutralna';
    case 5:
      return 'Pozytywna';
    default:
      return 'Nieznana';
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend jest aktywny' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Nieobsługiwany błąd:', err);
  res.status(500).json({
    success: false,
    error: 'Wewnętrzny błąd serwera',
    details: err.message
  });
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serwer backend uruchomiony na porcie ${PORT}`);
  console.log(`📱 POST /api/analyze-phone - analiza spamu dla numeru`);
  console.log(`💬 POST /api/get-comments - pobierz komentarze`);
  console.log(`📊 POST /api/get-statistics - pobierz statystyki`);
  console.log(`🏥 GET /api/health - sprawdzenie statusu`);
});

module.exports = app;

/**
 * Przykładowy klient do testowania API OdebraćTelefon Backend
 * 
 * Użycie: node client-example.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

/**
 * Utility funkcja do wysyłania POST requestów
 */
function makeRequest(path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Utility funkcja do wysyłania GET requestów
 */
function makeGetRequest(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', chunk => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Helper funkcja do Pretty print'u JSON
 */
function printJson(title, obj) {
    console.log('\n' + '='.repeat(60));
    console.log(`📌 ${title}`);
    console.log('='.repeat(60));
    console.log(JSON.stringify(obj, null, 2));
}

/**
 * Helper do wyświetlania wyniku analizy
 */
function printAnalysisResult(result) {
    if (!result.success) {
        console.log(`❌ Błąd: ${result.error}`);
        return;
    }

    const { spamAnalysis } = result;

    console.log('\n' + '='.repeat(60));
    console.log(`📱 ANALIZA NUMERU: ${result.phoneNumber}`);
    console.log('='.repeat(60));
    console.log(`\n🌐 URL: ${result.url}`);
    console.log(`📊 Liczba opinii: ${result.reviewCount}`);
    console.log(`⭐ Średnia ocena: ${result.averageRating}`);
    console.log(`🏷️  Główna kategoria: ${result.mostCommonCategory}`);

    console.log('\n📈 ROZKŁAD OCEN:');
    console.log(`  • Negatywne: ${spamAnalysis.ratingAnalysis.negativeCount}`);
    console.log(`  • Neutralne: ${spamAnalysis.ratingAnalysis.neutralCount}`);
    console.log(`  • Pozytywne: ${spamAnalysis.ratingAnalysis.positiveCount}`);

    console.log('\n⚠️  ANALIZA SPAMU:');
    console.log(`  • Typ: ${spamAnalysis.mostLikelySpam.toUpperCase()}`);
    console.log(`  • Pewność: ${spamAnalysis.confidence}%`);
    console.log(`  • Prawdopodobieństwo spamu: ${spamAnalysis.ratingAnalysis.spamProbability}%`);

    console.log('\n🔝 TOP TYPY SPAMU:');
    spamAnalysis.spamTypes.forEach((spam, index) => {
        console.log(`  ${index + 1}. ${spam.type} (${spam.confidence}%) - ${spam.matchCount} trafień`);
    });

    console.log('\n💡 REKOMENDACJA:');
    const rec = spamAnalysis.recommendation;
    console.log(`  Status: ${rec.verdict}`);
    console.log(`  Wiadomość: ${rec.message}`);
    console.log(`  Czy odebrać? ${rec.shouldAnswer}`);

    console.log('');
}

/**
 * Główna funkcja testowa
 */
async function runTests() {
    try {
        console.log('\n🚀 TESTOWANIE API ODEBRACTELEFON BACKEND\n');

        // 1. Health Check
        console.log('⏳ Sprawdzanie statusu serwera...');
        const health = await makeGetRequest('/api/health');
        console.log(`✅ Serwer: ${health.status} - ${health.message}`);

        // 2. Analiza numeru telefonu
        const phoneNumber = '506965423';
        console.log(`\n⏳ Analiza numeru ${phoneNumber}...`);
        const analysis = await makeRequest('/api/analyze-phone', {
            phoneNumber: phoneNumber
        });
        printAnalysisResult(analysis);

        // 3. Pobranie komentarzy
        console.log('⏳ Pobieranie komentarzy...');
        const comments = await makeRequest('/api/get-comments', {
            phoneNumber: phoneNumber
        });

        if (comments.success) {
            console.log('\n' + '='.repeat(60));
            console.log('💬 KOMENTARZE');
            console.log('='.repeat(60));
            console.log(`\nŁącznie komentarzy: ${comments.totalComments}\n`);

            comments.comments.slice(0, 3).forEach((comment, index) => {
                console.log(`${index + 1}. [${comment.ratingLabel}] ${comment.category}`);
                console.log(`   Autor: ${comment.author}`);
                if (comment.comment) {
                    console.log(`   Tekst: "${comment.comment.substring(0, 100)}..."`);
                }
                console.log('');
            });

            if (comments.comments.length > 3) {
                console.log(`... i ${comments.comments.length - 3} więcej komentarzy`);
            }
        }

        // 4. Pobranie komentarzy z filtrem
        console.log('\n⏳ Pobieranie negatywnych komentarzy...');
        const negativeComments = await makeRequest('/api/get-comments', {
            phoneNumber: phoneNumber,
            filter: {
                rating: 1,
                hasComment: true
            }
        });

        if (negativeComments.success) {
            console.log('\n' + '='.repeat(60));
            console.log('❌ NEGATYWNE KOMENTARZE (Z TEKSTEM)');
            console.log('='.repeat(60));
            console.log(`Znaleźliśmy: ${negativeComments.filteredCount}\n`);

            negativeComments.comments.forEach((comment, index) => {
                console.log(`${index + 1}. ${comment.author}`);
                console.log(`   "${comment.comment}"`);
                console.log('');
            });
        }

        // 5. Pobranie statystyk
        console.log('⏳ Pobieranie statystyk...');
        const stats = await makeRequest('/api/get-statistics', {
            phoneNumber: phoneNumber
        });

        if (stats.success) {
            const s = stats.statistics;
            console.log('\n' + '='.repeat(60));
            console.log('📊 STATYSTYKI');
            console.log('='.repeat(60));
            console.log(`\nNumer: ${s.phoneNumber}`);
            console.log(`Recenzji: ${s.totalReviews}`);
            console.log(`Średnia ocena: ${s.averageRating}`);
            console.log(`Prawdopodobieństwo spamu: ${s.spamProbability}%`);
            console.log(`\nRozkład ocen:`);
            console.log(`  • Negatywne: ${s.ratingDistribution.negative}`);
            console.log(`  • Neutralne: ${s.ratingDistribution.neutral}`);
            console.log(`  • Pozytywne: ${s.ratingDistribution.positive}`);
            console.log(`\nKategorie:`);
            Object.entries(s.categories).forEach(([cat, count]) => {
                console.log(`  • ${cat}: ${count}`);
            });
        }

        // 6. Test z innym numerem (jeśli istnieje)
        console.log('\n⏳ Test z innym numerem...');
        const otherPhone = '585123456';
        const otherAnalysis = await makeRequest('/api/analyze-phone', {
            phoneNumber: otherPhone
        });

        if (otherAnalysis.success) {
            console.log(`\n✅ ${otherPhone}: ${otherAnalysis.spamAnalysis.recommendation.verdict}`);
        } else {
            console.log(`⚠️  ${otherPhone}: ${otherAnalysis.error}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ TESTOWANIE UKOŃCZONE');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Błąd:', error.message);
        console.log('\n💡 Upewnij się, że:');
        console.log('   1. Serwer jest uruchomiony (npm start)');
        console.log('   2. Działa na porcie 3000');
        console.log('   3. Połączenie internetowe jest aktywne\n');
    }
}

// Uruchomienie testów
runTests();
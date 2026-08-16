import * as Notifications from 'expo-notifications';

// Ustaw swój prawdziwy adres backendu z Vercel
const BASE_URL = 'https://spamcalldetectbackend.vercel.app';

// Krótkie etykiety do powiadomienia
const verdictEmoji = {
  'WYSOKIE RYZYKO SPAMU': '🔴',
  'ŚREDNIE RYZYKO': '🟠',
  'NISKIE RYZYKO': '🟡',
  BEZPIECZNY: '🟢',
  'BRAK DANYCH': '⚪',
};

/**
 * Headless task uruchamiany natywnie przez IncomingCallHeadlessTaskService.kt
 * Nazwa "IncomingCallCheck" musi być identyczna jak w Kotlinie i w rejestracji poniżej.
 */
async function headlessCallTask(taskData) {
  const { phoneNumber } = taskData;

  if (!phoneNumber) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/analyze-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();

    if (!data.success) {
      await showNotification(
        phoneNumber,
        'Nie udało się sprawdzić numeru',
        'Brak danych z serwera analizy.'
      );
      return;
    }

    const { recommendation, confidence } = data.spamAnalysis;
    const emoji = verdictEmoji[recommendation.verdict] || 'ℹ️';

    await showNotification(
      phoneNumber,
      `${emoji} ${recommendation.verdict} (${confidence}%)`,
      recommendation.message,
      data // przekazujemy pełne dane, żeby tapnięcie powiadomienia mogło otworzyć ResultsScreen
    );
  } catch (error) {
    console.error('Błąd w headless task:', error);
    await showNotification(
      phoneNumber,
      'Błąd sprawdzania numeru',
      'Nie udało się połączyć z serwerem analizy.'
    );
  }
}

async function showNotification(phoneNumber, title, body, fullData) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${title} — ${phoneNumber}`,
      body,
      data: { phoneNumber, analysisResult: fullData || null },
    },
    trigger: null, // natychmiast
  });
}

export default headlessCallTask;

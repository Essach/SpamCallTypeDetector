/**
 * THEME COLORS
 */
export const colors = {
  // Primary
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryDark: '#047857',

  // Secondary
  secondary: '#F59E0B',
  secondaryLight: '#FEF3C7',
  secondaryDark: '#D97706',

  // Background
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgDark: '#1F2937',
  bgDarker: '#111827',

  // Text
  text: '#111827',
  textLight: '#6B7280',
  textLighter: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Status Colors
  danger: '#f17e6e',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Borders
  border: '#E5E7EB',
  borderDark: '#374151',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

/**
 * SPAM LEVEL CONFIGURATION
 */
export const spamLevels = {
  HIGH: {
    label: 'WYSOKIE RYZYKO',
    color: colors.danger,
    bgColor: colors.dangerLight,
    icon: 'error',
    emoji: '⛔',
    shouldAnswer: 'NIE ODBIERAJ',
  },
  MEDIUM: {
    label: 'ŚREDNIE RYZYKO',
    color: colors.warning,
    bgColor: colors.warningLight,
    icon: 'warning',
    emoji: '⚠️',
    shouldAnswer: 'OSTROŻNIE',
  },
  LOW: {
    label: 'NISKIE RYZYKO',
    color: colors.info,
    bgColor: colors.infoLight,
    icon: 'info',
    emoji: 'ℹ️',
    shouldAnswer: 'MOŻLIWE',
  },
  SAFE: {
    label: 'BEZPIECZNY',
    color: colors.success,
    bgColor: colors.successLight,
    icon: 'check-circle',
    emoji: '✅',
    shouldAnswer: 'TAK ODBIERAJ',
  },
  UNKNOWN: {
    label: 'BRAK DANYCH',
    color: colors.textLight,
    bgColor: colors.bgSecondary,
    icon: 'help',
    emoji: '❓',
    shouldAnswer: 'NIEZNANE',
  },
};

/**
 * Pobranie poziomu spamu na podstawie prawdopodobieństwa
 * @param {number} probability - Procent spamu (0-100)
 * @returns {Object} Konfiguracja poziomu spamu
 */
export const getSpamLevel = (probability) => {
  if (probability >= 80) return spamLevels.HIGH;
  if (probability >= 50) return spamLevels.MEDIUM;
  if (probability >= 20) return spamLevels.LOW;
  if (probability >= 0) return spamLevels.SAFE;
  return spamLevels.UNKNOWN;
};

/**
 * FORMATTING UTILITIES
 */

/**
 * Format numeru telefonu
 * @param {string} phone - Numer telefonu
 * @returns {string} Sformatowany numer
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+48')) {
    const rest = cleaned.slice(3);
    return `+48 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
  } else if (cleaned.startsWith('48')) {
    const rest = cleaned.slice(2);
    return `+48 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
  } else if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  return cleaned;
};

/**
 * Format daty
 * @param {string} dateString - Data jako string
 * @returns {string} Sformatowana data
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return `Dzisiaj o ${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return `Wczoraj o ${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  return date.toLocaleDateString('pl-PL');
};

/**
 * Format confidence
 * @param {number} confidence - Pewność (0-100)
 * @returns {string} Sformatowana pewność
 */
export const formatConfidence = (confidence) => {
  return `${Math.round(confidence)}%`;
};

/**
 * Pobranie tekstu dla typu spamu
 * @param {string} spamType - Typ spamu
 * @returns {string} Opis
 */
export const getSpamTypeLabel = (spamType) => {
  const labels = {
    telemarketer: 'Telemarketing',
    fraudScam: 'Oszustwo',
    debtCollection: 'Windykacja',
    silentCall: 'Cicha rozmowa',
    unwantedCall: 'Nechciany telefon',
    maliciousCall: 'Złośliwe połączenie',
    callCenter: 'Call center',
    survey: 'Ankieta',
    nonProfit: 'Non-profit',
    political: 'Polityka',
    fax: 'Fax',
    sms: 'SMS',
    automat: 'Automat',
    unknown: 'Nieznany',
    legitimate: 'Legalne',
  };

  return labels[spamType] || spamType;
};

/**
 * VALIDATION UTILITIES
 */

/**
 * Walidacja numeru telefonu
 * @param {string} phone - Numer telefonu
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/[^0-9+]/g, '');

  if (!cleaned) {
    return { valid: false, error: 'Numer telefonu jest wymagany' };
  }

  if (cleaned.length < 7) {
    return { valid: false, error: 'Numer telefonu jest za krótki (minimum 7 cyfr)' };
  }

  if (cleaned.length > 15) {
    return { valid: false, error: 'Numer telefonu jest za długi' };
  }

  return { valid: true };
};

/**
 * CONVERSION UTILITIES
 */

/**
 * Konwersja % do paska
 * @param {number} percentage - Procent (0-100)
 * @returns {number} Wartość dla paska (0-1)
 */
export const percentToBar = (percentage) => {
  return Math.min(Math.max(percentage / 100, 0), 1);
};

/**
 * Pobranie koloru dla % spamu
 * @param {number} percentage - Procent (0-100)
 * @returns {string} Kolor
 */
export const getSpamPercentageColor = (percentage) => {
  const level = getSpamLevel(percentage);
  return level.color;
};

/**
 * ARRAY UTILITIES
 */

/**
 * Sortowanie komentarzy
 * @param {Array} comments - Lista komentarzy
 * @param {string} sortBy - Sortowanie: 'rating' | 'date'
 * @returns {Array} Posortowana lista
 */
export const sortComments = (comments, sortBy = 'date') => {
  const sorted = [...comments];

  if (sortBy === 'rating') {
    return sorted.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'date') {
    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return sorted;
};

/**
 * Filtrowanie komentarzy
 * @param {Array} comments - Lista komentarzy
 * @param {string} filterBy - Filtrowanie: 'negative' | 'positive' | 'neutral'
 * @returns {Array} Przefiltrowana lista
 */
export const filterComments = (comments, filterBy) => {
  if (filterBy === 'negative') {
    return comments.filter((c) => c.rating === 1);
  } else if (filterBy === 'positive') {
    return comments.filter((c) => c.rating === 5);
  } else if (filterBy === 'neutral') {
    return comments.filter((c) => c.rating === 3);
  }

  return comments;
};

/**
 * TOAST/NOTIFICATION MESSAGES
 */
export const messages = {
  error: {
    networkError: 'Brak połączenia z backendem',
    invalidPhone: 'Podaj prawidłowy numer telefonu',
    serverError: 'Błąd serwera. Spróbuj później',
    unknownError: 'Coś poszło nie tak',
  },
  success: {
    analyzeComplete: 'Analiza zakończona',
    copiedToClipboard: 'Skopiowano do schowka',
    historyCleared: 'Historia wyczyszczona',
  },
  info: {
    analyzing: 'Analizuję numer...',
    loading: 'Ładuję...',
    noData: 'Brak danych',
  },
};

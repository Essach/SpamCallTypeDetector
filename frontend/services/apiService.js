import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konfiguracja
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://spamcalldetectbackend.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor dla błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Błąd serwera. Spróbuj później.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Brak połączenia z backendem.'));
    }
    return Promise.reject(error);
  }
);

/**
 * Serwis do analizy numeru telefonu
 */
export const phoneService = {
  /**
   * Analiza numeru telefonu
   * @param {string} phoneNumber - Numer telefonu
   * @returns {Promise} Wynik analizy
   */
  async analyzePhone(phoneNumber) {
    try {
      const response = await api.post('/api/analyze-phone', {
        phoneNumber: phoneNumber.replace(/[^0-9+]/g, ''),
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Nie udało się przeanalizować numeru');
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Pobranie komentarzy dla numeru
   * @param {string} phoneNumber - Numer telefonu
   * @param {Object} filter - Filtr (opcjonalnie)
   * @returns {Promise} Lista komentarzy
   */
  async getComments(phoneNumber, filter = null) {
    try {
      const response = await api.post('/api/get-comments', {
        phoneNumber: phoneNumber.replace(/[^0-9+]/g, ''),
        filter,
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Nie udało się pobrać komentarzy');
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Pobranie statystyk dla numeru
   * @param {string} phoneNumber - Numer telefonu
   * @returns {Promise} Statystyki
   */
  async getStatistics(phoneNumber) {
    try {
      const response = await api.post('/api/get-statistics', {
        phoneNumber: phoneNumber.replace(/[^0-9+]/g, ''),
      });

      if (response.data.success) {
        return response.data.statistics;
      } else {
        throw new Error(response.data.error || 'Nie udało się pobrać statystyk');
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sprawdzenie statusu backend'u
   * @returns {Promise} Status
   */
  async checkHealth() {
    try {
      const response = await api.get('/api/health');
      return response.data.status === 'OK';
    } catch (error) {
      return false;
    }
  },
};

/**
 * Serwis do zarządzania historią
 */
export const historyService = {
  /**
   * Dodanie do historii
   * @param {Object} item - Element historii
   */
  async addToHistory(item) {
    try {
      const history = await this.getHistory();
      const newItem = {
        id: Date.now(),
        phoneNumber: item.phoneNumber,
        spamType: item.spamAnalysis?.mostLikelySpam,
        confidence: item.spamAnalysis?.confidence,
        date: new Date().toISOString(),
        fullData: item,
      };

      history.unshift(newItem);
      // Przechowuj tylko ostatnie 100 wpisów
      const trimmed = history.slice(0, 100);

      await AsyncStorage.setItem('@phone_history', JSON.stringify(trimmed));
      return newItem;
    } catch (error) {
      console.error('Błąd przy dodaniu do historii:', error);
    }
  },

  /**
   * Pobranie historii
   * @returns {Promise<Array>} Historia wyszukiwań
   */
  async getHistory() {
    try {
      const data = await AsyncStorage.getItem('@phone_history');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Błąd przy pobieraniu historii:', error);
      return [];
    }
  },

  /**
   * Usunięcie z historii
   * @param {number} id - ID elementu
   */
  async removeFromHistory(id) {
    try {
      const history = await this.getHistory();
      const filtered = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem('@phone_history', JSON.stringify(filtered));
    } catch (error) {
      console.error('Błąd przy usuwaniu z historii:', error);
    }
  },

  /**
   * Wyczyszczenie całej historii
   */
  async clearHistory() {
    try {
      await AsyncStorage.removeItem('@phone_history');
    } catch (error) {
      console.error('Błąd przy czyszczeniu historii:', error);
    }
  },
};

/**
 * Serwis ustawień
 */
export const settingsService = {
  /**
   * Pobranie ustawień
   * @returns {Promise<Object>} Ustawienia
   */
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem('@app_settings');
      return data
        ? JSON.parse(data)
        : {
            apiUrl: API_BASE_URL,
            notificationsEnabled: true,
            darkMode: true,
            saveHistory: true,
          };
    } catch (error) {
      console.error('Błąd przy pobieraniu ustawień:', error);
      return {};
    }
  },

  /**
   * Zapisanie ustawień
   * @param {Object} settings - Ustawienia
   */
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem('@app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Błąd przy zapisywaniu ustawień:', error);
    }
  },

  /**
   * Aktualizacja API URL
   * @param {string} url - Nowy adres URL
   */
  async updateApiUrl(url) {
    try {
      const settings = await this.getSettings();
      settings.apiUrl = url;
      await this.saveSettings(settings);
      // Aktualizuj axios config
      api.defaults.baseURL = url;
    } catch (error) {
      console.error('Błąd przy aktualizacji URL:', error);
    }
  },
};

export default api;

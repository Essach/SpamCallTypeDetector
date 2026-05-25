import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { phoneService, historyService } from '../services/apiService';
import { colors, validatePhoneNumber, formatPhoneNumber, messages } from '../utils/helpers';

const CheckerScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    checkBackendConnection();
    loadRecentSearches();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const connected = await phoneService.checkHealth();
      setBackendConnected(connected);
    } catch (error) {
      setBackendConnected(false);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const history = await historyService.getHistory();
      setRecentSearches(history.slice(0, 5));
    } catch (error) {
      console.error('Błąd przy ładowaniu historii:', error);
    }
  };

  const handleAnalyze = async () => {
    // Walidacja
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      Alert.alert('Błąd', validation.error);
      return;
    }

    if (!backendConnected) {
      Alert.alert('Błąd', messages.error.networkError);
      return;
    }

    setLoading(true);

    try {
      const result = await phoneService.analyzePhone(phoneNumber);

      // Dodaj do historii
      await historyService.addToHistory(result);

      // Przejdź do ekranu wyników
      navigation.navigate('Results', {
        analysisResult: result,
        phoneNumber,
      });

      setPhoneNumber('');
      loadRecentSearches();
    } catch (error) {
      Alert.alert('Błąd', error.message || messages.error.unknownError);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearch = (item) => {
    setPhoneNumber(item.phoneNumber);
  };

  const handleQuickAnalyze = async (number) => {
    setPhoneNumber(number);
    // Opóźnienie aby TextInput się zaktualizował
    setTimeout(() => {
      analyzePhone(number);
    }, 100);
  };

  const analyzePhone = async (number) => {
    const validation = validatePhoneNumber(number);
    if (!validation.valid) {
      Alert.alert('Błąd', validation.error);
      return;
    }

    if (!backendConnected) {
      Alert.alert('Błąd', messages.error.networkError);
      return;
    }

    setLoading(true);

    try {
      const result = await phoneService.analyzePhone(number);
      await historyService.addToHistory(result);

      navigation.navigate('Results', {
        analysisResult: result,
        phoneNumber: number,
      });

      setPhoneNumber('');
      loadRecentSearches();
    } catch (error) {
      Alert.alert('Błąd', error.message || messages.error.unknownError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Backend'u */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: backendConnected ? colors.successLight : colors.dangerLight,
            },
          ]}
        >
          <MaterialIcons
            name={backendConnected ? 'check-circle' : 'error'}
            size={20}
            color={backendConnected ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: backendConnected ? colors.success : colors.danger,
              },
            ]}
          >
            {backendConnected ? 'Backend aktywny' : 'Backend niedostępny'}
          </Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Numer telefonu</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="phone"
              size={20}
              color={colors.textLight}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="np. 506965423 lub +48 506 965 423"
              placeholderTextColor={colors.textLighter}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />
            {phoneNumber.length > 0 && (
              <TouchableOpacity onPress={() => setPhoneNumber('')}>
                <MaterialIcons name="close" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.hint}>Wpisz 9-15 cyfr (z prefiksem +48 lub bez)</Text>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            {
              opacity: loading || !phoneNumber || !backendConnected ? 0.6 : 1,
            },
          ]}
          onPress={handleAnalyze}
          disabled={loading || !phoneNumber || !backendConnected}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <>
              <MaterialIcons name="search" size={20} color={colors.textWhite} />
              <Text style={styles.analyzeButtonText}>Sprawdź numer</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Ostatnie wyszukiwania</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentScroll}
            >
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => handleQuickAnalyze(item.phoneNumber)}
                >
                  <Text style={styles.recentNumber}>{formatPhoneNumber(item.phoneNumber)}</Text>
                  <View
                    style={[
                      styles.recentBadge,
                      {
                        backgroundColor:
                          item.confidence > 70
                            ? colors.dangerLight
                            : item.confidence > 40
                            ? colors.warningLight
                            : colors.successLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentBadgeText,
                        {
                          color:
                            item.confidence > 70
                              ? colors.danger
                              : item.confidence > 40
                              ? colors.warning
                              : colors.success,
                        },
                      ]}
                    >
                      {item.confidence}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Examples */}
        <View style={styles.examplesSection}>
          <Text style={styles.sectionTitle}>Przykłady testowe</Text>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => handleQuickAnalyze('506965423')}
          >
            <MaterialIcons name="phone" size={16} color={colors.info} />
            <Text style={styles.exampleButtonText}>506965423 (Telemarketer)</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Jak to działa?</Text>
            <Text style={styles.infoText}>
              Aplikacja łączy się z bazą danych odebractelefon.pl i analizuje opinie
              użytkowników, aby określić typ spamu.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.bgSecondary,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textLight,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  analyzeButtonText: {
    marginLeft: 8,
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentScroll: {
    marginTop: 12,
  },
  recentItem: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
  },
  recentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  recentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examplesSection: {
    marginBottom: 24,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  exampleButtonText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
  },
});

export default CheckerScreen;

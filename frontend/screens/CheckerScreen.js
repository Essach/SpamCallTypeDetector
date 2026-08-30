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
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { phoneService, historyService } from '../services/apiService';
import { validatePhoneNumber, formatPhoneNumber, messages } from '../utils/helpers';

// Paleta: gleboki fiolet-granat w tle, elektryczny fiolet + indygo jako akcent
const theme = {
  bg: '#0D0A1F',
  bgSecondary: '#171232',
  bgCard: '#1E1840',
  border: '#332B5E',
  primary: '#8B5CF6',
  primaryDark: '#6D28D9',
  accent: '#6366F1',
  danger: '#F43F5E',
  dangerLight: 'rgba(244, 63, 94, 0.15)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.15)',
  text: '#F3F1FA',
  textLight: '#A7A0C9',
  textLighter: '#5F5789',
  textWhite: '#FFFFFF',
};

const CheckerScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const history = await historyService.getHistory();
      setRecentSearches(history.slice(0, 5));
    } catch (error) {
      console.error('Błąd przy ładowaniu historii:', error);
    }
  };

  const handleAnalyze = async () => {
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      Alert.alert('Błąd', validation.error);
      return;
    }

    setLoading(true);

    try {
      const result = await phoneService.analyzePhone(phoneNumber);
      await historyService.addToHistory(result);

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

  const handleQuickAnalyze = async (number) => {
    setPhoneNumber(number);
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
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Naglowek */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrap}>
            <MaterialIcons name="shield" size={28} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>Kto dzwoni?</Text>
          <Text style={styles.heroSubtitle}>Sprawdź numer zanim odbierzesz</Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="phone"
              size={20}
              color={theme.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="np. 506965423 lub +48 506 965 423"
              placeholderTextColor={theme.textLighter}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />
            {phoneNumber.length > 0 && (
              <TouchableOpacity onPress={() => setPhoneNumber('')}>
                <MaterialIcons name="close" size={20} color={theme.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            { opacity: loading || !phoneNumber ? 0.5 : 1 },
          ]}
          onPress={handleAnalyze}
          disabled={loading || !phoneNumber}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.textWhite} />
          ) : (
            <>
              <MaterialIcons name="search" size={20} color={theme.textWhite} />
              <Text style={styles.analyzeButtonText}>Sprawdź numer</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Ostatnie</Text>
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
                            ? theme.dangerLight
                            : item.confidence > 40
                            ? theme.warningLight
                            : theme.successLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentBadgeText,
                        {
                          color:
                            item.confidence > 70
                              ? theme.danger
                              : item.confidence > 40
                              ? theme.warning
                              : theme.success,
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
          <Text style={styles.sectionTitle}>Test</Text>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => handleQuickAnalyze('506965423')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="bolt" size={16} color={theme.accent} />
            <Text style={styles.exampleButtonText}>506965423 — Telemarketer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 6,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.bgSecondary,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.text,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  analyzeButtonText: {
    marginLeft: 8,
    color: theme.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  recentSection: {
    marginBottom: 28,
  },
  recentScroll: {
    marginTop: 12,
  },
  recentItem: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    minWidth: 140,
  },
  recentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  recentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  examplesSection: {
    marginBottom: 24,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  exampleButtonText: {
    marginLeft: 10,
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CheckerScreen;
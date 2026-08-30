import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { historyService } from '../services/apiService';
import {
  formatPhoneNumber,
  getSpamLevel,
  formatDate,
  getSpamTypeLabel,
} from '../utils/helpers';

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

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Błąd przy ładowaniu historii:', error);
      Alert.alert('Błąd', 'Nie udało się załadować historii');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (id) => {
    Alert.alert('Potwierdzenie', 'Czy chcesz usunąć ten element z historii?', [
      {
        text: 'Anuluj',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Usuń',
        onPress: async () => {
          await historyService.removeFromHistory(id);
          loadHistory();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz wyczyścić całą historię?',
      [
        {
          text: 'Anuluj',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Wyczyść',
          onPress: async () => {
            await historyService.clearHistory();
            loadHistory();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleItemPress = (item) => {
    navigation.navigate('HistoryResults', {
      analysisResult: item.fullData,
      phoneNumber: item.phoneNumber,
    });
  };

  const renderHistoryItem = ({ item }) => {
    const spamLevel = getSpamLevel(item.confidence);

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.85}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.phoneNumber}>{formatPhoneNumber(item.phoneNumber)}</Text>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: spamLevel.bgColor },
              ]}
            >
              <Text
                style={[
                  styles.confidenceText,
                  { color: spamLevel.color },
                ]}
              >
                {item.confidence}%
              </Text>
            </View>
          </View>

          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="label" size={14} color={theme.textLight} />
              <Text style={styles.detailText}>
                {getSpamTypeLabel(item.spamType)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="access-time" size={14} color={theme.textLight} />
              <Text style={styles.detailText}>{formatDate(item.date)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name="history" size={28} color={theme.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>Brak historii</Text>
      <Text style={styles.emptyStateText}>
        Historia pojawi się tutaj gdy sprawdzisz pierwszy numer
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {/* Naglowek */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <MaterialIcons name="history" size={28} color={theme.primary} />
        </View>
        <Text style={styles.heroTitle}>Historia</Text>
        <Text style={styles.heroSubtitle}>Twoje ostatnio sprawdzone numery</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />

          {history.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearHistory}
                activeOpacity={0.85}
              >
                <MaterialIcons name="delete-sweep" size={20} color={theme.danger} />
                <Text style={styles.clearButtonText}>Wyczyść historię</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bg,
    marginTop: 30,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
    justifyContent: 'start',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.textLight,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIconWrap: {
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 220,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.danger,
    backgroundColor: theme.dangerLight,
  },
  clearButtonText: {
    marginLeft: 8,
    color: theme.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default HistoryScreen;
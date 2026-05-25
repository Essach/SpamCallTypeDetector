import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { historyService } from '../services/apiService';
import {
  colors,
  formatPhoneNumber,
  getSpamLevel,
  formatDate,
  getSpamTypeLabel,
} from '../utils/helpers';

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
      'Czy na pewno chcesz wyczyscić całą historię?',
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
              <MaterialIcons name="label" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>
                {getSpamTypeLabel(item.spamType)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="access-time" size={14} color={colors.textLight} />
              <Text style={styles.detailText}>{formatDate(item.date)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={64} color={colors.textLight} />
      <Text style={styles.emptyStateTitle}>Brak historii</Text>
      <Text style={styles.emptyStateText}>
        Historia pojawi się tutaj gdy sprawdzisz pierwszy numer
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
              >
                <MaterialIcons name="delete-sweep" size={20} color={colors.danger} />
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
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
    color: colors.text,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
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
    color: colors.textLight,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 200,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  clearButtonText: {
    marginLeft: 8,
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HistoryScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { phoneService } from '../services/apiService';
import {
  getSpamLevel,
  formatPhoneNumber,
  getSpamTypeLabel,
  filterComments,
  sortComments,
} from '../utils/helpers';

// Paleta: gleboki fiolet-granat w tle, elektryczny fiolet + indygo jako akcent
const theme = {
  bg: '#0D0A1F',
  bgSecondary: '#171232',
  bgCard: '#1E1840',
  border: '#332B5E',
  primary: '#8B5CF6',
  accent: '#6366F1',
  danger: '#F43F5E',
  warning: '#FBBF24',
  success: '#34D399',
  text: '#F3F1FA',
  textLight: '#A7A0C9',
  textWhite: '#FFFFFF',
};

const ResultsScreen = ({ route }) => {
  // Gdy appka otwiera sie z deep linku (powiadomienie), przychodzi tylko "phone"
  // (patrz: linking config w App.js). Gdy z normalnej nawigacji w appce,
  // przychodzi phoneNumber + gotowy analysisResult.
  const params = route.params || {};
  const initialPhoneNumber = params.phoneNumber || params.phone;

  const [phoneNumber] = useState(initialPhoneNumber);
  const [analysisResult, setAnalysisResult] = useState(params.analysisResult || null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(!params.analysisResult);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentFilter, setCommentFilter] = useState('all');

  useEffect(() => {
    if (!analysisResult && phoneNumber) {
      fetchAnalysis();
    }
    loadComments();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const result = await phoneService.analyzePhone(phoneNumber);
      if (result.success) {
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('Blad przy pobieraniu analizy:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const result = await phoneService.getComments(phoneNumber);
      if (result.success) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu komentarzy:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const getFilteredComments = () => {
    if (commentFilter === 'all') {
      return sortComments(comments, 'date');
    }
    return sortComments(filterComments(comments, commentFilter), 'date');
  };

  if (!analysisResult || loadingAnalysis) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Ładuję wyniki...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const spam = analysisResult.spamAnalysis;
  const recommendation = spam.recommendation;
  const spamLevel = getSpamLevel(spam.ratingAnalysis.spamProbability);
  const filteredComments = getFilteredComments();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.phoneNumberContainer}>
            <MaterialIcons name="phone" size={24} color={theme.primary} />
            <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
          </View>
        </View>

        {/* Main Verdict Card */}
        <View
          style={[
            styles.verdictCard,
            { borderColor: spamLevel.color },
          ]}
        >
          <Text style={styles.verdictEmoji}>{spamLevel.emoji}</Text>
          <Text style={[styles.verdictTitle, { color: spamLevel.color }]}>
            {recommendation.verdict}
          </Text>
          <Text style={[styles.verdictAction, { color: spamLevel.color }]}>
            {recommendation.shouldAnswer}
          </Text>
          <Text style={styles.verdictMessage}>{recommendation.message}</Text>
        </View>

        {/* Confidence Meter */}
        <View style={styles.confidenceSection}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Pewność analizy</Text>
            <Text style={[styles.confidenceValue, { color: spamLevel.color }]}>
              {spam.confidence}%
            </Text>
          </View>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${spam.confidence}%`,
                  backgroundColor: spamLevel.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Rating Distribution */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rozkład opinii</Text>
          <View style={styles.ratingGrid}>
            <View style={styles.ratingItem}>
              <MaterialIcons name="thumb-down" size={24} color={theme.danger} />
              <Text style={styles.ratingCount}>{spam.ratingAnalysis.negativeCount}</Text>
              <Text style={styles.ratingLabel}>Negatywne</Text>
            </View>
            <View style={styles.ratingItem}>
              <MaterialIcons name="drag-handle" size={24} color={theme.warning} />
              <Text style={styles.ratingCount}>{spam.ratingAnalysis.neutralCount}</Text>
              <Text style={styles.ratingLabel}>Neutralne</Text>
            </View>
            <View style={styles.ratingItem}>
              <MaterialIcons name="thumb-up" size={24} color={theme.success} />
              <Text style={styles.ratingCount}>{spam.ratingAnalysis.positiveCount}</Text>
              <Text style={styles.ratingLabel}>Pozytywne</Text>
            </View>
          </View>
        </View>

        {/* Spam Types */}
        {spam.spamTypes.length > 0 && (
          <View style={styles.spamTypesSection}>
            <Text style={styles.sectionTitle}>Najprawdopodobniejsze typy</Text>
            {spam.spamTypes.map((item, index) => (
              <View key={index} style={styles.spamTypeCard}>
                <View style={styles.spamTypeHeader}>
                  <Text style={styles.spamTypeRank}>{index + 1}</Text>
                  <Text style={styles.spamTypeName}>{getSpamTypeLabel(item.type)}</Text>
                </View>
                <View style={styles.spamTypeBar}>
                  <View
                    style={[
                      styles.spamTypeBarFill,
                      {
                        width: `${item.confidence}%`,
                        backgroundColor:
                          item.confidence > 70
                            ? theme.danger
                            : item.confidence > 40
                            ? theme.warning
                            : theme.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.spamTypeConfidence}>{item.confidence}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Categories */}
        {analysisResult.categories && Object.keys(analysisResult.categories).length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Zgłaszane kategorie</Text>
            {Object.entries(analysisResult.categories).map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>
              Komentarze ({analysisResult.reviewCount})
            </Text>
            <TouchableOpacity onPress={loadComments} disabled={loadingComments}>
              <MaterialIcons
                name="refresh"
                size={20}
                color={theme.primary}
                style={loadingComments ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.filterButtons}>
            {['all', 'negative', 'positive', 'neutral'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  commentFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => setCommentFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    commentFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter === 'all'
                    ? 'Wszystkie'
                    : filter === 'negative'
                    ? 'Negatywne'
                    : filter === 'positive'
                    ? 'Pozytywne'
                    : 'Neutralne'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comments List */}
          {loadingComments ? (
            <View style={styles.loadingComments}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : filteredComments.length > 0 ? (
            <FlatList
              data={filteredComments}
              renderItem={({ item }) => (
                <View style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentRating}>
                      <MaterialIcons
                        name={
                          item.rating === 1
                            ? 'thumb-down'
                            : item.rating === 3
                            ? 'drag-handle'
                            : 'thumb-up'
                        }
                        size={16}
                        color={
                          item.rating === 1
                            ? theme.danger
                            : item.rating === 3
                            ? theme.warning
                            : theme.success
                        }
                      />
                      <Text style={styles.commentRatingText}>{item.ratingLabel}</Text>
                    </View>
                    <Text style={styles.commentAuthor}>{item.author}</Text>
                  </View>
                  <Text style={styles.commentCategory}>{item.category}</Text>
                  {item.comment && <Text style={styles.commentText}>{item.comment}</Text>}
                </View>
              )}
              keyExtractor={(item, index) => `${item.category}-${index}`}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noComments}>Brak komentarzy do wyświetlenia</Text>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bg,
    marginTop: 30,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.textLight,
  },
  header: {
    marginBottom: 20,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  verdictCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: theme.bgCard,
  },
  verdictEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  verdictAction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  verdictMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: theme.text,
  },
  confidenceSection: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  ratingItem: {
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: 14,
    flex: 1,
    marginHorizontal: 4,
  },
  ratingCount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 2,
  },
  spamTypesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  spamTypeCard: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  spamTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spamTypeRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    color: theme.textWhite,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    marginRight: 10,
    overflow: 'hidden',
  },
  spamTypeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  spamTypeBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  spamTypeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  spamTypeConfidence: {
    fontSize: 12,
    color: theme.textLight,
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCount: {
    color: theme.textWhite,
    fontWeight: '700',
    fontSize: 12,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  filterButtonTextActive: {
    color: theme.textWhite,
  },
  loadingComments: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  commentCard: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentRatingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textLight,
  },
  commentCategory: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '600',
    marginBottom: 6,
  },
  commentText: {
    fontSize: 13,
    color: theme.text,
    lineHeight: 18,
  },
  noComments: {
    textAlign: 'center',
    color: theme.textLight,
    paddingVertical: 20,
    fontSize: 14,
  },
  spacer: {
    height: 20,
  },
});

export default ResultsScreen;
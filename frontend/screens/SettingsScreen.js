import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { settingsService } from '../services/apiService';
import { NativeModules } from 'react-native';

const { RoleManagerModule } = NativeModules;

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

async function requestCallScreeningRole() {
  try {
    const result = await RoleManagerModule.requestCallScreeningRole();
    if (result === 'ALREADY_GRANTED') {
      Alert.alert('Gotowe', 'Aplikacja jest juz ustawiona jako program do identyfikacji spamu.');
    }
    // Jesli result === 'REQUESTED', system sam pokazal okienko wyboru -
    // uzytkownik zobaczy je zaraz po wywolaniu tej funkcji.
  } catch (error) {
    Alert.alert('Błąd', error.message || 'Nie udało się poprosić o uprawnienie.');
  }
}

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    saveHistory: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Błąd przy ładowaniu ustawień:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await settingsService.saveSettings(newSettings);
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
            <MaterialIcons name="settings" size={28} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>Ustawienia</Text>
          <Text style={styles.heroSubtitle}>Dostosuj aplikację do siebie</Text>
        </View>

        {/* Call Screening */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ochrona</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestCallScreeningRole}
            activeOpacity={0.85}
          >
            <MaterialIcons name="shield" size={20} color={theme.textWhite} />
            <Text style={styles.primaryButtonText}>
              Ustaw jako aplikację do wykrywania spamu
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencje Aplikacji</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeader}>
                <MaterialIcons name="save" size={20} color={theme.primary} />
                <Text style={styles.settingTitle}>Zapisywanie Historii</Text>
              </View>
              <Switch
                value={settings.saveHistory}
                onValueChange={(value) => handleSettingChange('saveHistory', value)}
                trackColor={{ false: theme.border, true: theme.primaryDark }}
                thumbColor={settings.saveHistory ? theme.primary : theme.textLighter}
              />
            </View>
            <Text style={styles.settingDescription}>
              Przechowuj historię wszystkich sprawdzanych numerów
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeader}>
                <MaterialIcons name="notifications" size={20} color={theme.primary} />
                <Text style={styles.settingTitle}>Powiadomienia</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) =>
                  handleSettingChange('notificationsEnabled', value)
                }
                trackColor={{ false: theme.border, true: theme.primaryDark }}
                thumbColor={
                  settings.notificationsEnabled ? theme.primary : theme.textLighter
                }
              />
            </View>
            <Text style={styles.settingDescription}>
              Otrzymuj powiadomienia o niskich wynikach analizy
            </Text>
          </View>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    marginLeft: 10,
    color: theme.textWhite,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  settingCard: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 10,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 8,
    lineHeight: 16,
  },
  spacer: {
    height: 20,
  },
});

export default SettingsScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { settingsService } from '../services/apiService';
import { colors } from '../utils/helpers';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:3000',
    notificationsEnabled: true,
    darkMode: true,
    saveHistory: true,
  });
  const [tempApiUrl, setTempApiUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      setSettings(savedSettings);
      setTempApiUrl(savedSettings.apiUrl);
    } catch (error) {
      console.error('Błąd przy ładowaniu ustawień:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await settingsService.saveSettings(newSettings);
  };

  const handleApiUrlChange = async () => {
    if (!tempApiUrl.trim()) {
      Alert.alert('Błąd', 'Podaj prawidłowy URL');
      return;
    }

    try {
      await settingsService.updateApiUrl(tempApiUrl);
      setSettings({ ...settings, apiUrl: tempApiUrl });
      setIsEditingUrl(false);
      Alert.alert('Sukces', 'URL został zaktualizowany');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zaktualizować URL');
    }
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.odebractelefon.pl');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Backend Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konfiguracja Backend'u</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <MaterialIcons name="dns" size={24} color={colors.primary} />
              <Text style={styles.settingTitle}>Adres Backend'u</Text>
            </View>

            {!isEditingUrl ? (
              <View>
                <Text style={styles.apiUrl}>{settings.apiUrl}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setTempApiUrl(settings.apiUrl);
                    setIsEditingUrl(true);
                  }}
                >
                  <MaterialIcons name="edit" size={16} color={colors.primary} />
                  <Text style={styles.editButtonText}>Edytuj</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  style={styles.urlInput}
                  placeholder="http://localhost:3000"
                  value={tempApiUrl}
                  onChangeText={setTempApiUrl}
                  placeholderTextColor={colors.textLighter}
                />
                <View style={styles.urlButtonsRow}>
                  <TouchableOpacity
                    style={[styles.urlButton, styles.cancelButton]}
                    onPress={() => setIsEditingUrl(false)}
                  >
                    <Text style={styles.cancelButtonText}>Anuluj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.urlButton, styles.saveButton]}
                    onPress={handleApiUrlChange}
                  >
                    <Text style={styles.saveButtonText}>Zapisz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={styles.settingDescription}>
              URL serwera, z którym łączy się aplikacja
            </Text>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencje Aplikacji</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeader}>
                <MaterialIcons name="save" size={24} color={colors.primary} />
                <Text style={styles.settingTitle}>Zapisywanie Historii</Text>
              </View>
              <Switch
                value={settings.saveHistory}
                onValueChange={(value) => handleSettingChange('saveHistory', value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.saveHistory ? colors.primary : colors.textLight}
              />
            </View>
            <Text style={styles.settingDescription}>
              Przechowuj historię wszystkich sprawdzanych numerów
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeader}>
                <MaterialIcons name="notifications" size={24} color={colors.primary} />
                <Text style={styles.settingTitle}>Powiadomienia</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) =>
                  handleSettingChange('notificationsEnabled', value)
                }
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={
                  settings.notificationsEnabled ? colors.primary : colors.textLight
                }
              />
            </View>
            <Text style={styles.settingDescription}>
              Otrzymuj powiadomienia o niskich wynikach analizy
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeader}>
                <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
                <Text style={styles.settingTitle}>Tryb Ciemny</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.darkMode ? colors.primary : colors.textLight}
                disabled
              />
            </View>
            <Text style={styles.settingDescription}>
              Tryb ciemny jest zawsze włączony (zmiana wymaga restartu aplikacji)
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Aplikacji</Text>

          <View style={styles.settingCard}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Wersja</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Źródło danych</Text>
              <Text style={styles.aboutValue}>odebractelefon.pl</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Platforma</Text>
              <Text style={styles.aboutValue}>React Native / Expo</Text>
            </View>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.aboutDescription}>
              Aplikacja OdebraćTelefon pomaga zidentyfikować potencjalnych spamerów
              poprzez analizę opinii użytkowników dostępnych w publicznej bazie danych.
            </Text>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Przydatne Linki</Text>

          <TouchableOpacity style={styles.linkCard} onPress={handleOpenWebsite}>
            <MaterialIcons name="language" size={20} color={colors.primary} />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Odwiedź odebractelefon.pl</Text>
              <Text style={styles.linkDescription}>
                Sprawdź pełną bazę numerów telefonu online
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkCard} onPress={handleOpenGitHub}>
            <MaterialIcons name="code" size={20} color={colors.primary} />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Kod Źródłowy</Text>
              <Text style={styles.linkDescription}>
                Projekt jest dostępny na GitHub
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 OdebraćTelefon App. Wszystkie prawa zastrzeżone.
          </Text>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 16,
  },
  apiUrl: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  editButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginVertical: 8,
    fontSize: 13,
  },
  urlButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  urlButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
    fontSize: 13,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  aboutDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  linkContent: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  linkDescription: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default SettingsScreen;

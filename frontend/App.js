import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import CheckerScreen from './screens/CheckerScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

import headlessCallTask from './headlessCallTask';

import { NativeModules, Alert } from 'react-native';

import { Linking } from 'react-native';

const linking = {
  prefixes: ['odebractelefon://'],
  config: {
    screens: {
      Checker: {
        screens: {
          Results: 'result', // <- nazwa ekranu do potwierdzenia z CheckerStack
        },
      },
    },
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { RoleManagerModule } = NativeModules;

async function requestCallScreeningRole() {
  try {
    const result = await RoleManagerModule.requestCallScreeningRole();
    if (result === 'ALREADY_GRANTED') {
      Alert.alert('Gotowe', 'Aplikacja jest juz ustawiona jako program do identyfikacji spamu.');
    }
    // Jesli result === 'REQUESTED', system sam pokazal okienko wyboru -
    // uzytkownik zobaczy je zaraz po wywolaniu tej funkcji.
  } catch (error) {
    Alert.alert('Blad', error.message || 'Nie udalo sie poprosic o uprawnienie.');
  }
}

async function checkCallScreeningStatus() {
  const granted = await RoleManagerModule.isCallScreeningRoleGranted();
  return granted;
}

// Stack Navigator dla Checkera
function CheckerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CheckerMain"
        component={CheckerScreen}
        options={{
          title: 'Sprawdź numer',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: 'Wyniki analizy',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator dla Historii
function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{
          title: 'Historia',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="HistoryResults"
        component={ResultsScreen}
        options={{
          title: 'Wyniki analizy',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator dla Ustawień
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: 'Ustawienia',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
      async function requestPermissions() {
        if (Platform.OS !== 'android') return;

        // 1. Uprawnienie do odczytu stanu telefonu (wykrywanie połączeń)
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          {
            title: 'Uprawnienie do wykrywania połączeń',
            message:
              'Aplikacja potrzebuje dostępu do stanu telefonu, aby sprawdzać przychodzące numery.',
            buttonPositive: 'Zgadzam się',
          }
        );
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          {
            title: 'Uprawnienie do odczytu numeru',
            message: 'Aplikacja potrzebuje dostępu do numeru przychodzącego połączenia.',
            buttonPositive: 'Zgadzam się',
          }
        );

        // 2. Uprawnienie do powiadomień (Android 13+)
        await Notifications.requestPermissionsAsync();
      }

      requestPermissions();
    }, []);

  return (
    <NavigationContainer linking={linking}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Checker') {
              iconName = focused ? 'phone' : 'phone-in-talk';
            } else if (route.name === 'History') {
              iconName = focused ? 'history' : 'history';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#1F2937',
            borderTopColor: '#374151',
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: 5,
          },
        })}
      >
        <Tab.Screen
          name="Checker"
          component={CheckerStack}
          options={{
            title: 'Sprawdź',
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStack}
          options={{
            title: 'Historia',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            title: 'Ustawienia',
          }}
        />
      </Tab.Navigator>
      <View>
        <TouchableOpacity onPress={requestCallScreeningRole}>
          <Text>Ustaw jako aplikacje do wykrywania spamu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => headlessCallTask({ phoneNumber: '123456789' })}>
          <Text>TEST powiadomienia</Text>
        </TouchableOpacity>
      </View>
    </NavigationContainer>
  );
}

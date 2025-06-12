import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Імпорт екранів
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TestsScreen from '../screens/TestsScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import TestDetailScreen from '../screens/TestDetailScreen';

// Імпорт адміністративних екранів
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminTestsScreen from '../screens/AdminTestsScreen';
import AdminEditTestScreen from '../screens/AdminEditTestScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminStatsScreen from '../screens/AdminStatsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const AdminStack = createStackNavigator();

// Створюємо контекст для доступу до функцій навігації
export const NavigationContext = React.createContext();

// Навігація для основних екранів користувача
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tests') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Головна' }} />
      <Tab.Screen name="Tests" component={TestsScreen} options={{ title: 'Тести' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профіль' }} />
    </Tab.Navigator>
  );
};

// Навігація для адміністративних екранів
const AdminNavigator = () => {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen 
        name="AdminTests" 
        component={AdminTestsScreen} 
      />
      <AdminStack.Screen 
        name="AdminEditTest" 
        component={AdminEditTestScreen} 
      />
      <AdminStack.Screen 
        name="AdminUsers" 
        component={AdminUsersScreen} 
      />
      <AdminStack.Screen 
        name="AdminStats" 
        component={AdminStatsScreen} 
      />
      <AdminStack.Screen 
        name="AdminSettings" 
        component={AdminSettingsScreen} 
      />
    </AdminStack.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef();

  // Функція для перевірки авторизації
  const checkLoginStatus = async () => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      const userRole = await SecureStore.getItemAsync('userRole');
      
      setIsLoggedIn(userToken !== null);
      setIsAdmin(userRole === 'admin');
    } catch (e) {
      console.log('Помилка перевірки авторизації:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Перевірка авторизації при запуску
  useEffect(() => {
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10 }}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <NavigationContext.Provider value={{ checkLoginStatus }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            isAdmin ? (
              // Адміністративні екрани
              <>
                <Stack.Screen name="Admin" component={AdminNavigator} />
              </>
            ) : (
              // Екрани звичайного користувача
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen 
                  name="TestDetail" 
                  component={TestDetailScreen} 
                  options={{
                    headerShown: true,
                    title: 'Тест',
                    headerBackTitle: 'Назад'
                  }}
                />
              </>
            )
          ) : (
            // Екрани авторизації
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContext.Provider>
    </NavigationContainer>
  );
};

export default AppNavigator; 
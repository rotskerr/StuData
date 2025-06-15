import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Імпорт екранів
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TestsScreen from '../screens/TestsScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import TestDetailScreen from '../screens/TestDetailScreen';

// Імпорт адміністративних екранів
import AdminScreen from '../screens/AdminScreen';

import AdminTestsScreen from '../screens/AdminTestsScreen';
import AdminEditTestScreen from '../screens/AdminEditTestScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminStatsScreen from '../screens/AdminStatsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';

// Імпорт нових адміністративних екранів для управління даними
import AdminFacultiesScreen from '../screens/AdminFacultiesScreen';
import AdminSpecialtiesScreen from '../screens/AdminSpecialtiesScreen';
import AdminGroupsScreen from '../screens/AdminGroupsScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import AuthGuard from '../components/AuthGuard';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const AdminStack = createStackNavigator();

export const NavigationContext = React.createContext();

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

const AdminNavigator = () => {
  return (
    <AuthGuard requiredRole="admin">
      <AdminStack.Navigator screenOptions={{ headerShown: false }}>
        <AdminStack.Screen name="AdminMain" component={AdminScreen} />
      
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
      
      {/* Нові екрани для управління даними */}
      <AdminStack.Screen 
        name="AdminFaculties" 
        component={AdminFacultiesScreen} 
      />
      <AdminStack.Screen 
        name="AdminSpecialties" 
        component={AdminSpecialtiesScreen} 
      />
      <AdminStack.Screen 
        name="AdminGroups" 
        component={AdminGroupsScreen} 
      />
      <AdminStack.Screen 
        name="AdminReports" 
        component={AdminReportsScreen} 
      />
    </AdminStack.Navigator>
    </AuthGuard>
  );
};

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigationRef = useRef();

  const checkLoginStatus = async () => {
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      const userRole = await SecureStore.getItemAsync('userRole');
      
      if (userToken && !userRole) {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userEmail');
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }
      
      if (userToken && userToken !== 'admin-token') {
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== userToken) {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userRole');
          await SecureStore.deleteItemAsync('userEmail');
          setIsLoggedIn(false);
          setIsAdmin(false);
          return;
        }
      }
      
      setIsLoggedIn(userToken !== null);
      setIsAdmin(userRole === 'admin');
    } catch (e) {
      setIsLoggedIn(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (!user) {
        const userRole = await SecureStore.getItemAsync('userRole');
        const userToken = await SecureStore.getItemAsync('userToken');
        
        if (userToken !== 'admin-token' && userRole !== 'admin') {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userRole');
          await SecureStore.deleteItemAsync('userEmail');
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      }
      
      if (authChecked) {
        await checkLoginStatus();
      }
    });

    return unsubscribe;
  }, [authChecked]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (!isLoading && authChecked) {
      const interval = setInterval(async () => {
        const userToken = await SecureStore.getItemAsync('userToken');
        if (!userToken && isLoggedIn) {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      }, 30000); // Перевіряємо кожні 30 секунд

      return () => clearInterval(interval);
    }
  }, [isLoading, authChecked, isLoggedIn]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Завантаження...</Text>
        <Text style={{ marginTop: 5, fontSize: 14, color: '#999' }}>Перевірка авторизації</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <NavigationContext.Provider value={{ checkLoginStatus }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            isAdmin ? (
              <>
                <Stack.Screen name="Admin" component={AdminNavigator} />
              </>
            ) : (
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
            <>
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContext.Provider>
    </NavigationContainer>
  );
};

export default AppNavigator; 
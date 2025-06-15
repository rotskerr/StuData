import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const AdminScreen = ({ navigation }) => {
  const { checkLoginStatus } = useContext(NavigationContext);

  const handleLogout = async () => {
    Alert.alert(
      'Вихід з системи',
      'Ви впевнені, що хочете вийти з адмінпанелі?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userRole');
              await SecureStore.deleteItemAsync('userEmail');
              
              if (checkLoginStatus) {
                await checkLoginStatus();
              }
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося вийти: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const adminMenuItems = [
    {
      id: 'faculties',
      title: 'Факультети',
      description: 'Управління факультетами, спеціальностями та групами',
      icon: 'school',
      color: '#4285F4',
      screen: 'AdminFaculties'
    },
    {
      id: 'tests',
      title: 'Тести',
      description: 'Управління тестами та питаннями',
      icon: 'document-text',
      color: '#34A853',
      screen: 'AdminTests'
    },
    {
      id: 'users',
      title: 'Користувачі',
      description: 'Управління користувачами та правами доступу',
      icon: 'people',
      color: '#EA4335',
      screen: 'AdminUsers'
    },
    {
      id: 'reports',
      title: 'Звіти',
      description: 'Генерація PDF та Excel звітів по результатах тестування',
      icon: 'bar-chart',
      color: '#9C27B0',
      screen: 'AdminReports'
    },
    {
      id: 'stats',
      title: 'Статистика',
      description: 'Аналітика та статистика використання системи',
      icon: 'analytics',
      color: '#FF9800',
      screen: 'AdminStats'
    },
    {
      id: 'settings',
      title: 'Налаштування',
      description: 'Налаштування системи та додатку',
      icon: 'settings',
      color: '#FBBC05',
      screen: 'AdminSettings'
    }
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Адміністративна панель</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Ласкаво просимо до адмінпанелі</Text>
          <Text style={styles.welcomeSubtitle}>Оберіть розділ для управління системою</Text>
        </View>
        
        {/* Основне меню */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Управління системою</Text>
          {adminMenuItems.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4285F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 5,
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default AdminScreen; 
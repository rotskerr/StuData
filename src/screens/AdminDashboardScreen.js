import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContext } from '../navigation/AppNavigator';

const AdminDashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 42,
    totalTests: 8,
    pendingTests: 3,
    completedTests: 120
  });
  const { checkLoginStatus } = useContext(NavigationContext);

  // Приклад дій адміністратора
  const adminActions = [
    {
      id: '1',
      title: 'Керування користувачами',
      icon: 'people',
      color: '#4285F4',
      action: () => navigation.navigate('AdminUsers')
    },
    {
      id: '2',
      title: 'Керування тестами',
      icon: 'document-text',
      color: '#0F9D58',
      action: () => navigation.navigate('AdminTests')
    },
    {
      id: '3',
      title: 'Статистика',
      icon: 'stats-chart',
      color: '#F4B400',
      action: () => navigation.navigate('AdminStats')
    },
    {
      id: '4',
      title: 'Налаштування системи',
      icon: 'settings',
      color: '#DB4437',
      action: () => navigation.navigate('AdminSettings')
    }
  ];

  const handleLogout = async () => {
    try {
      // Видаляємо токен та роль адміністратора
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
      
      Alert.alert('Успіх', 'Ви вийшли з системи', [
        { 
          text: 'OK', 
          onPress: async () => {
            // Оновлюємо стан авторизації
            if (checkLoginStatus) {
              await checkLoginStatus();
            }
          } 
        }
      ]);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося вийти: ' + error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Симулюємо оновлення даних
    setTimeout(() => {
      setStats({
        totalUsers: Math.floor(Math.random() * 20) + 40,
        totalTests: Math.floor(Math.random() * 5) + 5,
        pendingTests: Math.floor(Math.random() * 5),
        completedTests: Math.floor(Math.random() * 50) + 100
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderActionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.actionItem}
      onPress={item.action}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.actionTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Панель адміністратора</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Користувачів</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTests}</Text>
          <Text style={styles.statLabel}>Тестів</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingTests}</Text>
          <Text style={styles.statLabel}>Очікують</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completedTests}</Text>
          <Text style={styles.statLabel}>Завершено</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Керування системою</Text>

      <FlatList
        data={adminActions}
        renderItem={renderActionItem}
        keyExtractor={item => item.id}
        style={styles.actionsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    marginTop: 30,
  },
  actionsList: {
    paddingHorizontal: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

export default AdminDashboardScreen; 
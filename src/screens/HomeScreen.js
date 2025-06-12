import React, { useEffect, useState, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Image,
  Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContext } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userFaculty, setUserFaculty] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([
    { 
      id: '1', 
      title: 'Нове опитування доступне', 
      description: 'Опитування щодо якості навчання. Будь ласка, пройдіть його до кінця тижня.', 
      date: '2023-05-15',
      icon: 'document-text'
    },
    { 
      id: '2', 
      title: 'Тест з програмування', 
      description: 'Перевірка знань з React Native. Тест складається з 20 питань.', 
      date: '2023-05-12',
      icon: 'code-slash'
    },
    { 
      id: '3', 
      title: 'Важливе повідомлення', 
      description: 'Оновлення системи заплановано на наступний тиждень. Можливі короткочасні перебої в роботі.', 
      date: '2023-05-10',
      icon: 'alert-circle'
    },
    { 
      id: '4', 
      title: 'Результати минулого тесту', 
      description: 'Результати тесту з основ програмування доступні у вашому профілі.', 
      date: '2023-05-08',
      icon: 'trophy'
    },
  ]);
  const { checkLoginStatus } = useContext(NavigationContext);
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  const [lastUpdatedItemId, setLastUpdatedItemId] = useState(null);

  // Статистика тестів
  const testStats = {
    available: 3,
    completed: 2,
    pending: 1
  };

  // Отримуємо дані користувача при завантаженні екрану
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await SecureStore.getItemAsync('userEmail');
      const faculty = await SecureStore.getItemAsync('userFaculty');
      const group = await SecureStore.getItemAsync('userGroup');
      
      if (email) setUserEmail(email);
      if (faculty) setUserFaculty(faculty);
      if (group) setUserGroup(group);
    } catch (error) {
      console.error('Помилка при завантаженні даних користувача:', error);
    }
  };

  // Функція для оновлення даних при pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    // Симулюємо завантаження даних
    setTimeout(() => {
      // Оновлюємо дані користувача
      loadUserData();
      
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleTimeString();
      const currentDate = currentTime.toISOString().split('T')[0];
      
      // Перевіряємо, чи є вже повідомлення про оновлення (з icon: 'refresh')
      const updateNotificationIndex = announcements.findIndex(item => item.icon === 'refresh');
      let updatedItemId;
      
      if (updateNotificationIndex !== -1) {
        // Якщо повідомлення про оновлення вже є, оновлюємо його
        const updatedAnnouncements = [...announcements];
        updatedItemId = updatedAnnouncements[updateNotificationIndex].id;
        updatedAnnouncements[updateNotificationIndex] = {
          ...updatedAnnouncements[updateNotificationIndex],
          description: `Дані оновлено ${formattedTime}`,
          date: currentDate
        };
        setAnnouncements(updatedAnnouncements);
      } else {
        // Якщо повідомлення про оновлення ще немає, додаємо нове
        const newAnnouncement = {
          id: Date.now().toString(),
          title: 'Оновлено щойно',
          description: `Дані оновлено ${formattedTime}`,
          date: currentDate,
          icon: 'refresh'
        };
        
        updatedItemId = newAnnouncement.id;
        setAnnouncements(prev => [newAnnouncement, ...prev.slice(0, 4)]);
      }
      
      // Запускаємо анімацію підсвічування
      setLastUpdatedItemId(updatedItemId);
      highlightAnimation.setValue(1);
      
      Animated.timing(highlightAnimation, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: false
      }).start(() => {
        setLastUpdatedItemId(null);
      });
      
      setRefreshing(false);
    }, 1500);
  };

  // Форматування дати
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  const renderAnnouncementItem = ({ item }) => {
    const isUpdatedItem = item.id === lastUpdatedItemId;
    
    const backgroundColor = isUpdatedItem 
      ? highlightAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['#f9f9f9', '#e3f2fd']
        })
      : '#f9f9f9';
      
    return (
      <TouchableOpacity onPress={() => {
        // Тут можна додати дію при натисканні на оголошення
        if (item.icon === 'code-slash') {
          // Для тестів з програмування переходимо на екран тесту з id=1
          navigation.navigate('TestDetail', { testId: '1' });
        } else if (item.icon === 'document-text') {
          // Для опитувань переходимо на екран тесту з id=2
          navigation.navigate('TestDetail', { testId: '2' });
        } else {
          // Для інших оголошень переходимо на екран тестів
          navigation.navigate('Tests');
        }
      }}>
        <Animated.View style={[
          styles.announcementItem,
          { backgroundColor }
        ]}>
          <View style={styles.announcementIconContainer}>
            <Ionicons name={item.icon} size={24} color="#4285F4" />
          </View>
          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementDesc}>{item.description}</Text>
            <Text style={styles.announcementDate}>{formatDate(item.date)}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderStatCard = (title, count, icon, color, onPress) => (
    <TouchableOpacity 
      style={[styles.statItem, { borderLeftColor: color, borderLeftWidth: 4 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={28} color={color} style={styles.statIcon} />
      <Text style={[styles.statNumber, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.greeting}>Вітаємо, {userEmail}</Text>
          {userFaculty && userGroup && (
            <Text style={styles.userDetails}>
              {userFaculty}, група {userGroup}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Доступні', 
          testStats.available, 
          'list', 
          '#4285F4',
          () => navigation.navigate('Tests', { filter: 'available' })
        )}
        {renderStatCard(
          'Завершені', 
          testStats.completed, 
          'checkmark-circle', 
          '#0F9D58',
          () => navigation.navigate('Tests', { filter: 'completed' })
        )}
        {renderStatCard(
          'Очікують', 
          testStats.pending, 
          'time', 
          '#F4B400',
          () => navigation.navigate('Tests', { filter: 'pending' })
        )}
      </View>

      <View style={styles.announcementsHeader}>
        <Text style={styles.sectionTitle}>Останні оголошення</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
        renderItem={renderAnnouncementItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4285F4']}
            tintColor="#4285F4"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Немає оголошень</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  userInfoContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
    fontSize: 12,
  },
  announcementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  announcementItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  announcementIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  announcementDesc: {
    color: '#666',
    marginBottom: 8,
  },
  announcementDate: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
});

export default HomeScreen; 
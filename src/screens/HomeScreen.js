import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContext } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableTests, getUserTestResults } from '../services/testService';
import { getUserProfile } from '../services/userService';

const HomeScreen = ({ navigation, route }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testStats, setTestStats] = useState({
    available: 0,
    completed: 0,
    pending: 0,
    total: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const { checkLoginStatus } = useContext(NavigationContext);
  const highlightAnimation = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const checkAuthAndLoadData = async () => {
        const userToken = await SecureStore.getItemAsync('userToken');
        if (!userToken) {
          if (checkLoginStatus) {
            await checkLoginStatus();
          }
          return;
        }
        
        loadUserData();
      };
      
      checkAuthAndLoadData();
    }, [checkLoginStatus])
  );

  useEffect(() => {
    if (route?.params?.refresh) {
      loadUserData();
      navigation.setParams({ refresh: false, testCompleted: null });
    }
  }, [route?.params?.refresh]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const profile = await getUserProfile();
      
      if (profile) {
        setUserProfile(profile);
        await loadTestStatistics();
        await loadRecentActivity();
      } else {
        setUserProfile({
          email: 'Гість',
          firstName: 'Гість',
          lastName: '',
          role: 'user'
        });
        await loadTestStatistics();
        await loadRecentActivity();
      }
      
    } catch (error) {
      console.error('Помилка при завантаженні даних користувача:', error);
      setUserProfile({
        email: 'Помилка завантаження',
        firstName: 'Користувач',
        lastName: '',
        role: 'user'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTestStatistics = async () => {
    try {
      const { success, tests } = await getAvailableTests();
      
      if (!success) {
        setTestStats({ total: 0, completed: 0, available: 0, pending: 0 });
        return;
      }

      const userResults = await getUserTestResults();
      
      const completedTestIds = new Set(userResults.map(result => result.testId));

      const stats = {
        total: tests.length,
        completed: userResults.length,
        available: tests.filter(test => !completedTestIds.has(test.id)).length,
        pending: 0
      };

      setTestStats(stats);
    } catch (error) {
      console.error('Помилка завантаження статистики тестів:', error);
      setTestStats({ total: 0, completed: 0, available: 0, pending: 0 });
    }
  };

  const loadRecentActivity = async () => {
    try {
      const userResults = await getUserTestResults();
      const { success, tests } = await getAvailableTests();
      
      if (!success) return;

      const testsMap = tests.reduce((acc, test) => {
        acc[test.id] = test;
        return acc;
      }, {});

      const activity = [];

      const recentResults = userResults
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 3);

      recentResults.forEach(result => {
        const test = testsMap[result.testId];
        if (test) {
          activity.push({
            id: `result_${result.testId}`,
            type: 'completed',
            title: `Завершено: ${test.title}`,
            description: `Результат: ${result.score}% • ${formatTime(result.timeSpent)}`,
            date: result.completedAt,
            icon: 'checkmark-circle',
            color: result.score >= 75 ? '#0F9D58' : result.score >= 60 ? '#F4B400' : '#DB4437',
            onPress: () => navigation.navigate('TestDetail', { testId: test.id, isReview: true })
          });
        }
      });

      const availableTests = tests
        .filter(test => !userResults.some(result => result.testId === test.id))
        .slice(0, 2);

      availableTests.forEach(test => {
        activity.push({
          id: `available_${test.id}`,
          type: 'available',
          title: `Доступний: ${test.title}`,
          description: `${test.questions?.length || 0} питань • ${test.timeLimit || 'Без обмежень'} хв`,
          date: test.createdAt || new Date().toISOString(),
          icon: 'document-text',
          color: '#4285F4',
          onPress: () => navigation.navigate('TestDetail', { testId: test.id })
        });
      });

      if (activity.length === 0) {
        activity.push({
          id: 'welcome',
          type: 'info',
          title: 'Ласкаво просимо до StuData!',
          description: 'Почніть з проходження доступних тестів у розділі "Тести"',
          date: new Date().toISOString(),
          icon: 'school',
          color: '#4285F4',
          onPress: () => navigation.navigate('Tests')
        });
      }

      activity.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activity);
    } catch (error) {
      console.error('Помилка завантаження активності:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    
    highlightAnimation.setValue(1);
    Animated.timing(highlightAnimation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
    
    setRefreshing(false);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 хв';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} хв`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    
    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('uk-UA', options);
  };

  const renderActivityItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={item.onPress} style={styles.activityItem}>
        <View style={[styles.activityIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription}>{item.description}</Text>
          <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброго ранку';
    if (hour < 17) return 'Добрий день';
    return 'Добрий вечір';
  };

  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'Користувач';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.header,
        {
          backgroundColor: highlightAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#fff', '#e3f2fd']
          })
        }
      ]}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}, {getUserDisplayName()}!
          </Text>
          {userProfile?.facultyName && userProfile?.groupName && (
            <Text style={styles.userDetails}>
              {userProfile.facultyName} • {userProfile.groupName}
            </Text>
          )}
          {(!userProfile?.facultyName || !userProfile?.groupName) && (
            <TouchableOpacity 
              style={styles.completeProfileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="warning" size={16} color="#F4B400" />
              <Text style={styles.completeProfileText}>Заповніть профіль</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Всього', 
          testStats.total, 
          'list', 
          '#4285F4',
          () => navigation.navigate('Tests')
        )}
        {renderStatCard(
          'Завершено', 
          testStats.completed, 
          'checkmark-circle', 
          '#0F9D58',
          () => navigation.navigate('Tests', { filter: 'completed' })
        )}
        {renderStatCard(
          'Доступно', 
          testStats.available, 
          'time', 
          '#F4B400',
          () => navigation.navigate('Tests', { filter: 'available' })
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Остання активність</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color={refreshing ? "#ccc" : "#4285F4"} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentActivity}
        renderItem={renderActivityItem}
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
            <Ionicons name="school" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Немає активності</Text>
            <Text style={styles.emptySubtext}>Почніть з проходження тестів</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  completeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  completeProfileText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#F4B400',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    marginBottom: 10,
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    color: '#999',
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 5,
    color: '#ccc',
    fontSize: 14,
  },
});

export default HomeScreen; 
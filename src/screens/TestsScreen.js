import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getAllTests, getAvailableTests, getUserTestResults } from '../services/testService';
import { getUserProfile, isAdmin } from '../services/authService';

const TestsScreen = ({ navigation, route }) => {

  
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'completed', 'pending'
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userTestResults, setUserTestResults] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    completed: 0,
    pending: 0,
    averageScore: 0
  });
  const [error, setError] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const initialLoadRef = React.useRef(false);
  
  useFocusEffect(
    useCallback(() => {
      if (initialLoadRef.current) {
    
        loadData();
      } else {
        initialLoadRef.current = true;
      }
    }, [])
  );

  useEffect(() => {
    if (route.params?.filter) {
      setActiveFilter(route.params.filter);
    }
  }, [route.params]);

  const filterTests = useCallback(() => {
    if (activeFilter === 'all') {
      setFilteredTests(tests);
      return;
    }
    
    const filtered = tests.filter(test => test.status === activeFilter);
    setFilteredTests(filtered);
  }, [tests, activeFilter]);

  useEffect(() => {
    filterTests();
  }, [filterTests]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await getUserProfile();
      setUserProfile(profile);
      
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);
      
      const { success, tests: availableTests } = await getAvailableTests();
      if (!success) {
        const mockTests = [
          {
            id: 'mock-1',
            title: 'Тестовий тест React Native',
            description: 'Це тестовий тест для перевірки інтерфейсу',
            type: 'test',
            questionsCount: 10,
            timeLimit: 20,
            isActive: true
          },
          {
            id: 'mock-2',
            title: 'Опитування про навчання',
            description: 'Тестове опитування для демонстрації',
            type: 'survey',
            questionsCount: 5,
            timeLimit: null,
            isActive: true
          }
        ];
        
        const processedMockTests = mockTests.map(test => ({
          ...test,
          status: 'available',
          icon: getTestIcon(test.type, test.title)
        }));
        
        setTests(processedMockTests);
        
        setStats({
          total: processedMockTests.length,
          available: processedMockTests.length,
          completed: 0,
          pending: 0,
          averageScore: 0
        });
        
        return;
      }
      
      const userResults = await getUserTestResults();
      const resultsMap = {};
      userResults.forEach(result => {
        resultsMap[result.testId] = result;
      });
      setUserTestResults(resultsMap);
      
      const processedTests = availableTests.map(test => {
        const userResult = resultsMap[test.id];
        const testIcon = getTestIcon(test.type, test.title);
        
        if (userResult) {
          return {
            ...test,
            status: 'completed',
            score: userResult.score,
            completedAt: userResult.completedAt,
            icon: testIcon
          };
        } else {
          return {
            ...test,
            status: 'available',
            icon: testIcon
          };
        }
      });
      
      setTests(processedTests);
      
      const totalTests = processedTests.length;
      const completedTests = processedTests.filter(t => t.status === 'completed');
      const availableTestsCount = processedTests.filter(t => t.status === 'available').length;
      const averageScore = completedTests.length > 0 
        ? Math.round(completedTests.reduce((sum, test) => sum + test.score, 0) / completedTests.length)
        : 0;
      
      const newStats = {
        total: totalTests,
        available: availableTestsCount,
        completed: completedTests.length,
        pending: 0,
        averageScore
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error('Помилка завантаження даних тестів:', error);
      setError(error.message || 'Не вдалося завантажити тести');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTestIcon = useCallback((type, title) => {
    if (type === 'survey') return 'clipboard';
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('react')) return 'logo-react';
    if (titleLower.includes('javascript') || titleLower.includes('js')) return 'logo-javascript';
    if (titleLower.includes('база даних') || titleLower.includes('sql')) return 'server';
    if (titleLower.includes('алгоритм')) return 'git-branch';
    if (titleLower.includes('програмування')) return 'code';
    if (titleLower.includes('математика')) return 'calculator';
    if (titleLower.includes('фізика')) return 'flash';
    if (titleLower.includes('хімія')) return 'flask';
    
    return 'document-text';
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTestPress = useCallback((test) => {
    if (test.id.startsWith('mock-')) {
      Alert.alert(
        'Тестовий тест',
        'Це тестовий тест для демонстрації інтерфейсу. Реальні тести будуть доступні після налаштування Firebase та створення тестових даних адміністратором.',
        [{ text: 'Зрозуміло' }]
      );
      return;
    }
    
    if (!userProfile) {
      Alert.alert('Помилка', 'Спочатку заповніть свій профіль');
      return;
    }
    
    if (test.status === 'completed') {
      Alert.alert(
        'Тест завершено',
        `Ви вже пройшли цей тест з результатом ${test.score}%. Дата проходження: ${formatDate(test.completedAt)}`,
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Переглянути відповіді', onPress: () => navigation.navigate('TestDetail', { testId: test.id, reviewMode: true }) }
        ]
      );
    } else {
      Alert.alert(
        'Почати тест',
        `Ви збираєтеся почати тест "${test.title}". Переконайтеся, що у вас є достатньо часу для його проходження.`,
        [
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Почати', onPress: () => navigation.navigate('TestDetail', { testId: test.id }) }
        ]
      );
    }
  }, [userProfile, navigation]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA');
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 90) return '#0F9D58'; // Зелений
    if (score >= 75) return '#4285F4'; // Синій
    if (score >= 60) return '#F4B400'; // Жовтий
    return '#DB4437'; // Червоний
  }, []);

  const renderTestItem = useCallback(({ item }) => {
    let statusColor = '#4285F4'; // За замовчуванням синій (доступний)
    let statusIcon = 'play-circle';
    let statusText = 'Доступний';
    
    if (item.status === 'completed') {
      statusColor = getScoreColor(item.score);
      statusIcon = 'checkmark-circle';
      statusText = `${item.score}%`;
    } else if (item.status === 'pending') {
      statusColor = '#FBBC05'; // Жовтий
      statusIcon = 'time';
      statusText = item.dueDate ? `До ${formatDate(item.dueDate)}` : 'Очікує';
    }
    
    return (
      <TouchableOpacity 
        style={styles.testCard}
        onPress={() => handleTestPress(item)}
      >
        <View style={[styles.testIconContainer, { backgroundColor: statusColor + '20' }]}>
          <Ionicons name={item.icon || 'document-text'} size={28} color={statusColor} />
        </View>
        
        <View style={styles.testContent}>
          <View style={styles.testMainInfo}>
            <Text style={styles.testTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.testDescription} numberOfLines={2}>
              {item.description || 'Опис тесту відсутній'}
            </Text>
          </View>
          
          <View style={styles.testDetails}>
            <View style={styles.testDetailItem}>
              <Ionicons name="help-circle-outline" size={14} color="#666" />
              <Text style={styles.testDetailText}>
                {item.questionsCount} питань
              </Text>
            </View>
            
            {item.timeLimit && (
              <View style={styles.testDetailItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.testDetailText}>
                  {item.timeLimit} хв
                </Text>
              </View>
            )}
            
            <View style={styles.testDetailItem}>
              <Ionicons name="apps-outline" size={14} color="#666" />
              <Text style={styles.testDetailText}>
                {item.type === 'test' ? 'Тест' : 'Опитування'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.testStatus, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon} size={16} color="#fff" />
          <Text style={styles.testStatusText}>{statusText}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleTestPress, formatDate, getScoreColor]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Тести та опитування</Text>
          <Text style={styles.headerSubtitle}>Завантаження...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Завантаження тестів...</Text>
          <Text style={styles.loadingSubtext}>Це може зайняти кілька секунд</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Тести та опитування</Text>
          <Text style={styles.headerSubtitle}>Помилка завантаження</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#DB4437" />
          <Text style={styles.emptyText}>Помилка завантаження</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="#4285F4" />
            <Text style={styles.refreshButtonText}>Спробувати знову</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Тести та опитування</Text>
        <Text style={styles.headerSubtitle}>
          {stats.total > 0 ? `${stats.total} тестів доступно` : 'Немає доступних тестів'}
        </Text>
      </View>
      
      {/* Об'єднані фільтри зі статистикою */}
      {stats.total > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {/* Фільтри з інтегрованою статистикою */}
          <TouchableOpacity
            style={[
              styles.filterCard,
              activeFilter === 'all' && styles.filterCardActive
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <View style={styles.filterCardIcon}>
              <Ionicons name="apps" size={16} color={activeFilter === 'all' ? '#fff' : '#4285F4'} />
            </View>
            <Text style={[
              styles.filterCardValue, 
              activeFilter === 'all' && styles.filterCardValueActive
            ]}>
              {stats.total}
            </Text>
            <Text style={[
              styles.filterCardLabel,
              activeFilter === 'all' && styles.filterCardLabelActive
            ]}>
              Всього
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterCard,
              activeFilter === 'available' && styles.filterCardActive
            ]}
            onPress={() => setActiveFilter('available')}
          >
            <View style={styles.filterCardIcon}>
              <Ionicons name="play-circle" size={16} color={activeFilter === 'available' ? '#fff' : '#4285F4'} />
            </View>
            <Text style={[
              styles.filterCardValue,
              activeFilter === 'available' && styles.filterCardValueActive
            ]}>
              {stats.available}
            </Text>
            <Text style={[
              styles.filterCardLabel,
              activeFilter === 'available' && styles.filterCardLabelActive
            ]}>
              Доступно
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterCard,
              activeFilter === 'completed' && styles.filterCardActive
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <View style={styles.filterCardIcon}>
              <Ionicons name="checkmark-circle" size={16} color={activeFilter === 'completed' ? '#fff' : '#0F9D58'} />
            </View>
            <Text style={[
              styles.filterCardValue,
              activeFilter === 'completed' && styles.filterCardValueActive
            ]}>
              {stats.completed}
            </Text>
            <Text style={[
              styles.filterCardLabel,
              activeFilter === 'completed' && styles.filterCardLabelActive
            ]}>
              Завершено
            </Text>
          </TouchableOpacity>

          {stats.pending > 0 && (
            <TouchableOpacity
              style={[
                styles.filterCard,
                activeFilter === 'pending' && styles.filterCardActive
              ]}
              onPress={() => setActiveFilter('pending')}
            >
              <View style={styles.filterCardIcon}>
                <Ionicons name="time" size={16} color={activeFilter === 'pending' ? '#fff' : '#F4B400'} />
              </View>
              <Text style={[
                styles.filterCardValue,
                activeFilter === 'pending' && styles.filterCardValueActive
              ]}>
                {stats.pending}
              </Text>
              <Text style={[
                styles.filterCardLabel,
                activeFilter === 'pending' && styles.filterCardLabelActive
              ]}>
                Очікують
              </Text>
            </TouchableOpacity>
          )}

          {stats.averageScore > 0 && (
            <View style={styles.filterCard}>
              <View style={styles.filterCardIcon}>
                <Ionicons name="trophy" size={16} color="#F4B400" />
              </View>
              <Text style={styles.filterCardValue}>
                {stats.averageScore}%
              </Text>
              <Text style={styles.filterCardLabel}>
                Середній бал
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Список тестів */}
      {filteredTests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={64} color="#ddd" />
          <Text style={styles.emptyText}>
            {activeFilter === 'all' 
              ? 'Немає доступних тестів' 
              : `Немає тестів у категорії "${
                  activeFilter === 'available' ? 'Доступні' : 
                  activeFilter === 'completed' ? 'Завершені' : 'Очікують'
                }"`}
          </Text>
          {activeFilter === 'all' && (
            <>
              <Text style={styles.emptySubtext}>
                Тести з'являться тут, коли адміністратор їх створить
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#4285F4" />
                <Text style={styles.refreshButtonText}>Оновити</Text>
              </TouchableOpacity>

            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTests}
          renderItem={renderTestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4285F4']}
              tintColor="#4285F4"
            />
          }
        />
      )}
    </SafeAreaView>
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  filtersContainer: {
    position: 'absolute',
    paddingVertical: 15,
    paddingBottom: 25,
    maxHeight: 140,
    zIndex: 10,
    elevation: 10,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 5,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 90,
    minHeight: 85,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 5,
  },
  filterCardActive: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  filterCardIcon: {
    marginBottom: 4,
  },
  filterCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 2,
    lineHeight: 20,
  },
  filterCardValueActive: {
    color: '#fff',
  },
  filterCardLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
  filterCardLabelActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 40,
  },
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  testIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  testContent: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  testMainInfo: {
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
    maxHeight: 36,
  },
  testDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  testDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  testStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  testStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 30,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
});

export default TestsScreen; 
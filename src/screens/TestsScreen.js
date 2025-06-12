import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const TestsScreen = ({ navigation, route }) => {
  const [userFaculty, setUserFaculty] = useState('');
  const [userSpecialty, setUserSpecialty] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'completed', 'pending'
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Приклади тестів
  const mockTests = [
    {
      id: '1',
      title: 'Основи React Native',
      description: 'Тест для перевірки знань з основ React Native',
      type: 'test',
      questions: 10,
      timeLimit: 20, // хвилин
      status: 'available', // available, completed, pending
      score: null,
      dueDate: '2023-06-01',
      availableFor: {
        faculty: 'Інформаційних технологій',
        specialty: 'Комп\'ютерні науки',
        group: 'КН-21'
      },
      icon: 'logo-react'
    },
    {
      id: '2',
      title: 'Опитування щодо якості навчання',
      description: 'Анонімне опитування для покращення якості навчального процесу',
      type: 'survey',
      questions: 5,
      status: 'pending',
      dueDate: '2023-05-25',
      availableFor: {
        faculty: 'Інформаційних технологій',
        specialty: null,
        group: null
      },
      icon: 'clipboard'
    },
    {
      id: '3',
      title: 'JavaScript базовий рівень',
      description: 'Перевірка базових знань з JavaScript',
      type: 'test',
      questions: 15,
      timeLimit: 30,
      status: 'completed',
      score: 85,
      completedDate: '2023-05-10',
      availableFor: {
        faculty: 'Інформаційних технологій',
        specialty: 'Інженерія програмного забезпечення',
        group: 'ІПЗ-11'
      },
      icon: 'logo-javascript'
    },
    {
      id: '4',
      title: 'Алгоритми та структури даних',
      description: 'Тест з основних алгоритмів та структур даних',
      type: 'test',
      questions: 20,
      timeLimit: 45,
      status: 'completed',
      score: 92,
      completedDate: '2023-05-05',
      availableFor: {
        faculty: 'Інформаційних технологій',
        specialty: 'Комп\'ютерні науки',
        group: 'КН-21'
      },
      icon: 'git-branch'
    },
    {
      id: '5',
      title: 'Бази даних',
      description: 'Тест з основ реляційних баз даних та SQL',
      type: 'test',
      questions: 15,
      timeLimit: 30,
      status: 'pending',
      dueDate: '2023-05-28',
      availableFor: {
        faculty: 'Інформаційних технологій',
        specialty: 'Комп\'ютерні науки',
        group: null
      },
      icon: 'server'
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Перевіряємо, чи є параметр фільтра в навігації
    if (route.params?.filter) {
      setActiveFilter(route.params.filter);
    }
  }, [route.params]);

  useEffect(() => {
    filterTests();
  }, [tests, activeFilter]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const faculty = await SecureStore.getItemAsync('userFaculty');
      const specialty = await SecureStore.getItemAsync('userSpecialty');
      const group = await SecureStore.getItemAsync('userGroup');
      
      setUserFaculty(faculty || '');
      setUserSpecialty(specialty || '');
      setUserGroup(group || '');
      
      // Фільтрація доступних тестів для користувача
      // В реальному додатку це буде запит до Firebase
      const availableTests = mockTests.filter(test => {
        const { faculty: testFaculty, specialty: testSpecialty, group: testGroup } = test.availableFor;
        
        // Перевірка на відповідність факультету
        if (testFaculty && testFaculty !== faculty) {
          return false;
        }
        
        // Перевірка на відповідність спеціальності, якщо вона вказана
        if (testSpecialty && testSpecialty !== specialty) {
          return false;
        }
        
        // Перевірка на відповідність групи, якщо вона вказана
        if (testGroup && testGroup !== group) {
          return false;
        }
        
        return true;
      });
      
      setTests(availableTests);
    } catch (error) {
      console.error('Помилка при завантаженні даних користувача:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    
    // Симулюємо затримку для кращого UX
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filterTests = () => {
    if (activeFilter === 'all') {
      setFilteredTests(tests);
      return;
    }
    
    const filtered = tests.filter(test => test.status === activeFilter);
    setFilteredTests(filtered);
  };

  const handleTestPress = (test) => {
    if (!userFaculty || !userSpecialty || !userGroup) {
      Alert.alert(
        'Профіль не заповнено',
        'Будь ласка, заповніть інформацію про факультет, спеціальність та групу у профілі перед проходженням тестів.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }
    
    // Перевіряємо статус тесту
    if (test.status === 'completed') {
      // Показуємо результати
      Alert.alert(
        'Результати тесту', 
        `Ви вже пройшли цей тест.\nРезультат: ${test.score}%`,
        [
          { text: 'OK' },
          { 
            text: 'Переглянути', 
            onPress: () => navigation.navigate('TestDetail', { testId: test.id, isReview: true }) 
          }
        ]
      );
    } else if (test.status === 'pending') {
      // Показуємо інформацію про очікування та пропонуємо переглянути тест
      Alert.alert(
        'Тест очікує', 
        `Цей тест буде доступний до: ${formatDate(test.dueDate)}`,
        [
          { text: 'OK' },
          { 
            text: 'Переглянути', 
            onPress: () => navigation.navigate('TestDetail', { testId: test.id, isPreview: true }) 
          }
        ]
      );
    } else {
      // Починаємо тест
      Alert.alert(
        'Почати тест?',
        `Ви готові почати тест "${test.title}"?\n\nКількість питань: ${test.questions}\nЧас на виконання: ${test.timeLimit} хв.`,
        [
          {
            text: 'Скасувати',
            style: 'cancel'
          },
          {
            text: 'Почати',
            onPress: () => {
              // Переходимо до екрану з тестом
              navigation.navigate('TestDetail', { testId: test.id });
            }
          }
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  const renderFilterButton = (filter, label, icon, color) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && { backgroundColor: color + '20' } // Додаємо прозорість
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={activeFilter === filter ? color : '#666'} 
        style={styles.filterIcon}
      />
      <Text 
        style={[
          styles.filterText,
          activeFilter === filter && { color, fontWeight: 'bold' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTestItem = ({ item }) => {
    // Визначаємо колір та іконку в залежності від статусу тесту
    let statusColor, statusIcon, statusText;
    
    switch(item.status) {
      case 'completed':
        statusColor = '#0F9D58';
        statusIcon = 'checkmark-circle';
        statusText = 'Завершено';
        break;
      case 'pending':
        statusColor = '#F4B400';
        statusIcon = 'time';
        statusText = 'Очікує';
        break;
      default:
        statusColor = '#4285F4';
        statusIcon = 'list';
        statusText = 'Доступно';
    }
    
    return (
      <TouchableOpacity 
        style={[styles.testItem, { borderLeftColor: statusColor }]}
        onPress={() => handleTestPress(item)}
      >
        <View style={styles.testIconContainer}>
          <Ionicons name={item.icon} size={28} color={statusColor} />
        </View>
        
        <View style={styles.testContent}>
          <View style={styles.testHeader}>
            <Text style={styles.testTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
            <View style={[styles.testTypeBadge, { backgroundColor: item.type === 'test' ? '#e3f2fd' : '#f1f8e9' }]}>
              <Text style={[styles.testTypeBadgeText, { color: item.type === 'test' ? '#1565c0' : '#2e7d32' }]}>
                {item.type === 'test' ? 'Тест' : 'Опитування'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.testDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
          
          <View style={styles.testFooter}>
            <View style={styles.testInfoContainer}>
              <Text style={styles.testInfo}>Питань: {item.questions}</Text>
              {item.timeLimit && (
                <Text style={styles.testInfo}>Час: {item.timeLimit} хв</Text>
              )}
            </View>
            
            <View style={[styles.testStatusBadge, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={statusIcon} size={14} color={statusColor} style={styles.testStatusIcon} />
              <Text style={[styles.testStatusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
          
          {item.status === 'completed' && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Результат:</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(item.score) }]}>{item.score}%</Text>
            </View>
          )}
          
          {item.status === 'pending' && (
            <Text style={styles.dueDate}>До: {formatDate(item.dueDate)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Функція для визначення кольору результату в залежності від оцінки
  const getScoreColor = (score) => {
    if (score >= 90) return '#0F9D58';
    if (score >= 75) return '#4285F4';
    if (score >= 60) return '#F4B400';
    return '#DB4437';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Завантаження тестів...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Тести та опитування</Text>
      
      {!userFaculty && (
        <View style={styles.warningContainer}>
          <Ionicons name="alert-circle" size={20} color="#856404" style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Заповніть інформацію про факультет, спеціальність та групу у профілі для доступу до всіх тестів.
          </Text>
        </View>
      )}
      
      <View style={styles.filtersOuterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterButton('all', 'Усі', 'apps', '#666')}
          {renderFilterButton('available', 'Доступні', 'list', '#4285F4')}
          {renderFilterButton('completed', 'Завершені', 'checkmark-circle', '#0F9D58')}
          {renderFilterButton('pending', 'Очікують', 'time', '#F4B400')}
        </ScrollView>
      </View>
      
      {filteredTests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            Немає доступних тестів у цій категорії.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTests}
          renderItem={renderTestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    color: '#856404',
    flex: 1,
  },
  filtersOuterContainer: {
    height: 50, // Фіксована висота для контейнера фільтрів
    marginBottom: 15,
  },
  filtersContent: {
    alignItems: 'center', // Вирівнювання по центру вертикально
    height: 40, // Фіксована висота для фільтрів
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    height: 36, // Фіксована висота для кнопок фільтрів
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  list: {
    paddingBottom: 20,
  },
  testItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  testContent: {
    flex: 1,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  testTypeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexShrink: 0, // Запобігає зменшенню бейджа
  },
  testTypeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  testDescription: {
    color: '#666',
    marginBottom: 10,
    flexWrap: 'wrap', // Дозволяє тексту переноситись
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // Дозволяє контенту переноситись
  },
  testInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Дозволяє інформації переноситись
    flex: 1,
  },
  testInfo: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
    marginBottom: 5, // Додаємо відступ знизу для переносу
  },
  testStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexShrink: 0, // Запобігає зменшенню бейджа
  },
  testStatusIcon: {
    marginRight: 4,
  },
  testStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default TestsScreen; 
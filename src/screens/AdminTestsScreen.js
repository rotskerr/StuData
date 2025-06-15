import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllTests, deleteTest } from '../services/testService';

const AdminTestsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, activeFilter, searchQuery]);

  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      const testsData = await getAllTests();
      setTests(testsData);
    } catch (error) {
      console.error('Помилка завантаження тестів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити тести');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTests = useCallback(() => {
    let filtered = [...tests];
    
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        filtered = filtered.filter(test => test.isActive === true);
      } else if (activeFilter === 'draft') {
        filtered = filtered.filter(test => test.isActive === false);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTests(filtered);
  }, [tests, activeFilter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  }, [loadTests]);

  const handleAddTest = useCallback(() => {
    navigation.navigate('AdminEditTest', { isNew: true });
  }, [navigation]);

  const handleEditTest = useCallback((test) => {
    navigation.navigate('AdminEditTest', { testId: test.id, isNew: false });
  }, [navigation]);

  const handleDeleteTest = useCallback((test) => {
    Alert.alert(
      'Видалення тесту',
      `Ви впевнені, що хочете видалити тест "${test.title}"?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTest(test.id);
              Alert.alert('Успіх', 'Тест успішно видалено');
              await loadTests(); // Перезавантажуємо список
            } catch (error) {
              console.error('Помилка видалення тесту:', error);
              Alert.alert('Помилка', 'Не вдалося видалити тест');
            }
          }
        }
      ]
    );
  }, [loadTests]);

  const renderFilterButton = (filter, label, icon, color) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && { backgroundColor: color + '20' }
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
    const isActive = item.isActive;
    const statusColor = isActive ? '#0F9D58' : '#F4B400';
    const statusText = isActive ? 'Активний' : 'Неактивний';
    const questionsCount = item.questions ? item.questions.length : 0;
    
    return (
      <View style={styles.testItem}>
        <View style={styles.testHeader}>
          <Text style={styles.testTitle}>{item.title}</Text>
          <View style={[styles.testTypeBadge, { backgroundColor: item.type === 'test' ? '#e3f2fd' : '#f1f8e9' }]}>
            <Text style={[styles.testTypeBadgeText, { color: item.type === 'test' ? '#1565c0' : '#2e7d32' }]}>
              {item.type === 'test' ? 'Тест' : 'Опитування'}
            </Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.testDescription}>{item.description}</Text>
        )}
        
        <View style={styles.testInfo}>
          <Text style={styles.testInfoText}>Питань: {questionsCount}</Text>
          {item.timeLimit && (
            <Text style={styles.testInfoText}>Час: {item.timeLimit} хв</Text>
          )}
          <Text style={[styles.testStatus, { color: statusColor }]}>
            <Ionicons name="ellipse" size={10} color={statusColor} /> {statusText}
          </Text>
        </View>
        
        <View style={styles.testActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditTest(item)}
          >
            <Ionicons name="create-outline" size={20} color="#4285F4" />
            <Text style={styles.actionButtonText}>Редагувати</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteTest(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#EA4335" />
            <Text style={[styles.actionButtonText, { color: '#EA4335' }]}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Керування тестами</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTest}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Завантаження тестів...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Керування тестами</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTest}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук тестів..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterButton('all', 'Усі', 'apps', '#666')}
          {renderFilterButton('active', 'Активні', 'checkmark-circle', '#0F9D58')}
          {renderFilterButton('draft', 'Неактивні', 'pause-circle', '#F4B400')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTests}
        renderItem={renderTestItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Немає тестів, що відповідають пошуку' 
                : 'Немає доступних тестів у цій категорії'}
            </Text>
          </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    height: 50,
    paddingHorizontal: 15,
  },
  filtersContent: {
    alignItems: 'center',
    height: 40,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    height: 36,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  testItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  testTypeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  testTypeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  testDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  testInfoText: {
    color: '#666',
  },
  testStatus: {
    fontWeight: '500',
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    marginRight: 5,
    backgroundColor: '#e3f2fd',
  },
  deleteButton: {
    marginLeft: 5,
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#4285F4',
    fontWeight: '500',
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
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminTestsScreen; 
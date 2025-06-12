import React, { useState, useEffect } from 'react';
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
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminTestsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([
    {
      id: '1',
      title: 'Основи React Native',
      type: 'test',
      questions: 10,
      status: 'active',
      createdAt: '2023-05-15'
    },
    {
      id: '2',
      title: 'Опитування щодо якості навчання',
      type: 'survey',
      questions: 5,
      status: 'active',
      createdAt: '2023-05-10'
    },
    {
      id: '3',
      title: 'JavaScript базовий рівень',
      type: 'test',
      questions: 15,
      status: 'active',
      createdAt: '2023-05-08'
    },
    {
      id: '4',
      title: 'Алгоритми та структури даних',
      type: 'test',
      questions: 20,
      status: 'draft',
      createdAt: '2023-05-05'
    },
    {
      id: '5',
      title: 'Бази даних',
      type: 'test',
      questions: 15,
      status: 'archived',
      createdAt: '2023-04-28'
    }
  ]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    filterTests();
  }, [tests, activeFilter, searchQuery]);

  const filterTests = () => {
    let filtered = [...tests];
    
    // Фільтрація за статусом
    if (activeFilter !== 'all') {
      filtered = filtered.filter(test => test.status === activeFilter);
    }
    
    // Фільтрація за пошуковим запитом
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTests(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Симулюємо оновлення даних
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddTest = () => {
    navigation.navigate('AdminEditTest', { isNew: true });
  };

  const handleEditTest = (test) => {
    navigation.navigate('AdminEditTest', { testId: test.id, isNew: false });
  };

  const handleDeleteTest = (test) => {
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
          onPress: () => {
            // Видаляємо тест зі списку
            setTests(prev => prev.filter(item => item.id !== test.id));
            Alert.alert('Успіх', 'Тест успішно видалено');
          }
        }
      ]
    );
  };

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
    let statusColor, statusText;
    
    switch(item.status) {
      case 'active':
        statusColor = '#0F9D58';
        statusText = 'Активний';
        break;
      case 'draft':
        statusColor = '#F4B400';
        statusText = 'Чернетка';
        break;
      case 'archived':
        statusColor = '#DB4437';
        statusText = 'Архівований';
        break;
      default:
        statusColor = '#666';
        statusText = 'Невідомо';
    }
    
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
        
        <View style={styles.testInfo}>
          <Text style={styles.testInfoText}>Питань: {item.questions}</Text>
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
            <Ionicons name="trash-outline" size={20} color="#DB4437" />
            <Text style={[styles.actionButtonText, { color: '#DB4437' }]}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          {renderFilterButton('draft', 'Чернетки', 'document', '#F4B400')}
          {renderFilterButton('archived', 'Архівовані', 'archive', '#DB4437')}
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
});

export default AdminTestsScreen; 
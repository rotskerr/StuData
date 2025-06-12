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

const AdminUsersScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([
    {
      id: '1',
      email: 'student1@university.edu.ua',
      faculty: 'Факультет інформаційних технологій',
      specialty: "Комп'ютерні науки",
      group: 'КН-31',
      status: 'active',
      createdAt: '2023-05-10'
    },
    {
      id: '2',
      email: 'student2@university.edu.ua',
      faculty: 'Факультет інформаційних технологій',
      specialty: 'Інженерія програмного забезпечення',
      group: 'ІПЗ-21',
      status: 'active',
      createdAt: '2023-05-12'
    },
    {
      id: '3',
      email: 'student3@university.edu.ua',
      faculty: 'Факультет економіки',
      specialty: 'Маркетинг',
      group: 'МК-41',
      status: 'blocked',
      createdAt: '2023-05-08'
    },
    {
      id: '4',
      email: 'student4@university.edu.ua',
      faculty: 'Факультет права',
      specialty: 'Право',
      group: 'П-11',
      status: 'active',
      createdAt: '2023-05-15'
    },
    {
      id: '5',
      email: 'student5@university.edu.ua',
      faculty: 'Факультет інформаційних технологій',
      specialty: 'Кібербезпека',
      group: 'КБ-21',
      status: 'inactive',
      createdAt: '2023-04-25'
    }
  ]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    filterUsers();
  }, [users, activeFilter, searchQuery]);

  const filterUsers = () => {
    let filtered = [...users];
    
    // Фільтрація за статусом
    if (activeFilter !== 'all') {
      filtered = filtered.filter(user => user.status === activeFilter);
    }
    
    // Фільтрація за пошуковим запитом
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.group.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Симулюємо оновлення даних
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleBlockUser = (user) => {
    Alert.alert(
      'Блокування користувача',
      `Ви впевнені, що хочете ${user.status === 'blocked' ? 'розблокувати' : 'заблокувати'} користувача ${user.email}?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: user.status === 'blocked' ? 'Розблокувати' : 'Заблокувати',
          style: user.status === 'blocked' ? 'default' : 'destructive',
          onPress: () => {
            // Змінюємо статус користувача
            setUsers(prev => prev.map(item => 
              item.id === user.id 
                ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' } 
                : item
            ));
            Alert.alert('Успіх', `Користувача ${user.status === 'blocked' ? 'розблоковано' : 'заблоковано'}`);
          }
        }
      ]
    );
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Видалення користувача',
      `Ви впевнені, що хочете видалити користувача ${user.email}?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            // Видаляємо користувача зі списку
            setUsers(prev => prev.filter(item => item.id !== user.id));
            Alert.alert('Успіх', 'Користувача успішно видалено');
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

  const renderUserItem = ({ item }) => {
    let statusColor, statusText;
    
    switch(item.status) {
      case 'active':
        statusColor = '#0F9D58';
        statusText = 'Активний';
        break;
      case 'blocked':
        statusColor = '#DB4437';
        statusText = 'Заблокований';
        break;
      case 'inactive':
        statusColor = '#F4B400';
        statusText = 'Неактивний';
        break;
      default:
        statusColor = '#666';
        statusText = 'Невідомо';
    }
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userHeader}>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.userStatusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.userStatusBadgeText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Факультет: {item.faculty}</Text>
          <Text style={styles.userInfoText}>Спеціальність: {item.specialty}</Text>
          <Text style={styles.userInfoText}>Група: {item.group}</Text>
          <Text style={styles.userInfoDate}>Зареєстровано: {item.createdAt}</Text>
        </View>
        
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              item.status === 'blocked' ? styles.unblockButton : styles.blockButton
            ]}
            onPress={() => handleBlockUser(item)}
          >
            <Ionicons 
              name={item.status === 'blocked' ? 'checkmark-circle-outline' : 'ban-outline'} 
              size={20} 
              color={item.status === 'blocked' ? '#0F9D58' : '#F4B400'} 
            />
            <Text 
              style={[
                styles.actionButtonText, 
                { color: item.status === 'blocked' ? '#0F9D58' : '#F4B400' }
              ]}
            >
              {item.status === 'blocked' ? 'Розблокувати' : 'Заблокувати'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
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
        <Text style={styles.headerTitle}>Керування користувачами</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук користувачів..."
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
          {renderFilterButton('all', 'Усі', 'people', '#666')}
          {renderFilterButton('active', 'Активні', 'checkmark-circle', '#0F9D58')}
          {renderFilterButton('blocked', 'Заблоковані', 'ban', '#DB4437')}
          {renderFilterButton('inactive', 'Неактивні', 'alert-circle', '#F4B400')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
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
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Немає користувачів, що відповідають пошуку' 
                : 'Немає доступних користувачів у цій категорії'}
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
  headerRight: {
    width: 34,
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
  userItem: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  userStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  userStatusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    marginBottom: 15,
  },
  userInfoText: {
    color: '#666',
    marginBottom: 4,
  },
  userInfoDate: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  userActions: {
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
  blockButton: {
    marginRight: 5,
    backgroundColor: '#fff8e1',
  },
  unblockButton: {
    marginRight: 5,
    backgroundColor: '#e8f5e9',
  },
  deleteButton: {
    marginLeft: 5,
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    marginLeft: 5,
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

export default AdminUsersScreen; 
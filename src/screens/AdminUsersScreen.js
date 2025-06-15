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
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, deleteUser, changeUserRole } from '../services/userService';
import { updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const AdminUsersScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      
      const sortedUsers = usersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Помилка завантаження користувачів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити список користувачів');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        filtered = filtered.filter(user => user.isActive !== false && user.role !== 'blocked');
      } else if (activeFilter === 'blocked') {
        filtered = filtered.filter(user => user.role === 'blocked' || user.isActive === false);
      } else if (activeFilter === 'inactive') {
        filtered = filtered.filter(user => !user.firstName || !user.lastName || !user.faculty);
      } else if (activeFilter === 'admin') {
        filtered = filtered.filter(user => user.role === 'admin');
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.firstName && user.firstName.toLowerCase().includes(query)) ||
        (user.lastName && user.lastName.toLowerCase().includes(query)) ||
        (user.faculty && user.faculty.toLowerCase().includes(query)) ||
        (user.specialty && user.specialty.toLowerCase().includes(query)) ||
        (user.group && user.group.toLowerCase().includes(query)) ||
        (user.studentId && user.studentId.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleBlockUser = async (user) => {
    const isBlocked = user.role === 'blocked' || user.isActive === false;
    const action = isBlocked ? 'розблокувати' : 'заблокувати';
    
    Alert.alert(
      `${isBlocked ? 'Розблокування' : 'Блокування'} користувача`,
      `Ви впевнені, що хочете ${action} користувача ${user.email}?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: isBlocked ? 'Розблокувати' : 'Заблокувати',
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const userRef = doc(firestore, 'users', user.id);
              
              if (isBlocked) {
                await updateDoc(userRef, {
                  role: 'student',
                  isActive: true,
                  updatedAt: new Date()
                });
              } else {
                await updateDoc(userRef, {
                  role: 'blocked',
                  isActive: false,
                  updatedAt: new Date()
                });
              }
              
              Alert.alert('Успіх', `Користувача ${action}о`);
              await loadUsers(); // Перезавантажуємо список
            } catch (error) {
              console.error(`Помилка ${action}ння користувача:`, error);
              Alert.alert('Помилка', `Не вдалося ${action} користувача`);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (user) => {
    Alert.alert(
      'Видалення користувача',
      `Ви впевнені, що хочете видалити користувача ${user.email}?\n\nЦя дія незворотна і видалить всі дані користувача, включаючи результати тестів.`,
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
              await deleteUser(user.id);
              Alert.alert('Успіх', 'Користувача успішно видалено');
              await loadUsers(); // Перезавантажуємо список
            } catch (error) {
              console.error('Помилка видалення користувача:', error);
              Alert.alert('Помилка', 'Не вдалося видалити користувача');
            }
          }
        }
      ]
    );
  };

  const handleMakeAdmin = async (user) => {
    Alert.alert(
      'Надання прав адміністратора',
      `Ви впевнені, що хочете надати права адміністратора користувачу ${user.email}?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Надати права',
          onPress: async () => {
            try {
              await changeUserRole(user.id, 'admin');
              Alert.alert('Успіх', 'Користувачу надано права адміністратора');
              await loadUsers(); // Перезавантажуємо список
            } catch (error) {
              console.error('Помилка надання прав адміністратора:', error);
              Alert.alert('Помилка', 'Не вдалося надати права адміністратора');
            }
          }
        }
      ]
    );
  };

  const handleRemoveAdmin = async (user) => {
    Alert.alert(
      'Видалення прав адміністратора',
      `Ви впевнені, що хочете видалити права адміністратора у користувача ${user.email}?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити права',
          style: 'destructive',
          onPress: async () => {
            try {
              await changeUserRole(user.id, 'student');
              Alert.alert('Успіх', 'Права адміністратора видалено');
              await loadUsers(); // Перезавантажуємо список
            } catch (error) {
              console.error('Помилка видалення прав адміністратора:', error);
              Alert.alert('Помилка', 'Не вдалося видалити права адміністратора');
            }
          }
        }
      ]
    );
  };

  const getUserStatus = (user) => {
    if (user.role === 'admin') {
      return { color: '#9C27B0', text: 'Адміністратор' };
    } else if (user.role === 'blocked' || user.isActive === false) {
      return { color: '#DB4437', text: 'Заблокований' };
    } else if (!user.firstName || !user.lastName || !user.faculty) {
      return { color: '#F4B400', text: 'Неповний профіль' };
    } else {
      return { color: '#0F9D58', text: 'Активний' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Невідомо';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('uk-UA');
    } catch (error) {
      return 'Невідомо';
    }
  };

  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
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
    const status = getUserStatus(item);
    const displayName = getUserDisplayName(item);
    const isBlocked = item.role === 'blocked' || item.isActive === false;
    const isAdmin = item.role === 'admin';
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userHeader}>
          <View style={styles.userMainInfo}>
            <Text style={styles.userDisplayName}>{displayName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={[styles.userStatusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.userStatusBadgeText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          {item.studentId && (
            <Text style={styles.userInfoText}>ID студента: {item.studentId}</Text>
          )}
          {item.faculty && (
            <Text style={styles.userInfoText}>Факультет: {item.faculty}</Text>
          )}
          {item.specialty && (
            <Text style={styles.userInfoText}>Спеціальність: {item.specialty}</Text>
          )}
          {item.group && (
            <Text style={styles.userInfoText}>Група: {item.group}</Text>
          )}
          <Text style={styles.userInfoDate}>
            Зареєстровано: {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.userActions}>
          {!isAdmin ? (
            <>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  isBlocked ? styles.unblockButton : styles.blockButton
                ]}
                onPress={() => handleBlockUser(item)}
              >
                <Ionicons 
                  name={isBlocked ? 'checkmark-circle-outline' : 'ban-outline'} 
                  size={20} 
                  color={isBlocked ? '#0F9D58' : '#F4B400'} 
                />
                <Text 
                  style={[
                    styles.actionButtonText, 
                    { color: isBlocked ? '#0F9D58' : '#F4B400' }
                  ]}
                >
                  {isBlocked ? 'Розблокувати' : 'Заблокувати'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.adminButton]}
                onPress={() => handleMakeAdmin(item)}
              >
                <Ionicons name="shield-outline" size={20} color="#9C27B0" />
                <Text style={[styles.actionButtonText, { color: '#9C27B0' }]}>
                  Зробити адміном
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.removeAdminButton]}
              onPress={() => handleRemoveAdmin(item)}
            >
              <Ionicons name="shield-off-outline" size={20} color="#FF6D01" />
              <Text style={[styles.actionButtonText, { color: '#FF6D01' }]}>
                Видалити права адміна
              </Text>
            </TouchableOpacity>
          )}
          
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
          <Text style={styles.headerTitle}>Керування користувачами</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Завантаження користувачів...</Text>
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
        <Text style={styles.headerTitle}>Керування користувачами</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userCount}>{filteredUsers.length}</Text>
        </View>
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
          {renderFilterButton('inactive', 'Неповні профілі', 'alert-circle', '#F4B400')}
          {renderFilterButton('admin', 'Адміністратори', 'shield', '#9C27B0')}
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
            {!searchQuery && activeFilter === 'all' && (
              <Text style={styles.emptySubtext}>
                Користувачі з'являться тут після реєстрації в системі
              </Text>
            )}
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
    alignItems: 'center',
  },
  userCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userMainInfo: {
    flex: 1,
    marginRight: 10,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userStatusBadge: {
    paddingVertical: 4,
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
    fontSize: 14,
  },
  userInfoDate: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    minWidth: '45%',
  },
  blockButton: {
    backgroundColor: '#fff8e1',
  },
  unblockButton: {
    backgroundColor: '#e8f5e9',
  },
  adminButton: {
    backgroundColor: '#f3e5f5',
  },
  removeAdminButton: {
    backgroundColor: '#fff3e0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 12,
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
  emptySubtext: {
    marginTop: 5,
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminUsersScreen; 
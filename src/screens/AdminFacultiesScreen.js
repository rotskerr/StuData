import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFaculties, addFaculty, updateFaculty, deleteFaculty } from '../services/facultyService';

const AdminFacultiesScreen = ({ navigation }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      setLoading(true);
      const facultiesData = await getFaculties();
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Помилка завантаження факультетів:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити факультети');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddFaculty = async () => {
    if (!newFacultyName.trim()) {
      Alert.alert('Помилка', 'Введіть назву факультету');
      return;
    }

    try {
      setLoading(true);
      await addFaculty(newFacultyName.trim());
      setNewFacultyName('');
      await loadFaculties();
      Alert.alert('Успіх', 'Факультет успішно додано');
    } catch (error) {
      console.error('Помилка додавання факультету:', error);
      Alert.alert('Помилка', 'Не вдалося додати факультет');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty || !editingFaculty.name.trim()) {
      Alert.alert('Помилка', 'Введіть назву факультету');
      return;
    }

    try {
      setLoading(true);
      await updateFaculty(editingFaculty.id, { name: editingFaculty.name.trim() });
      setEditingFaculty(null);
      await loadFaculties();
      Alert.alert('Успіх', 'Факультет успішно оновлено');
    } catch (error) {
      console.error('Помилка оновлення факультету:', error);
      Alert.alert('Помилка', 'Не вдалося оновити факультет');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (faculty) => {
    Alert.alert(
      'Підтвердження',
      `Ви впевнені, що хочете видалити факультет "${faculty.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteFaculty(faculty.id);
              await loadFaculties();
              Alert.alert('Успіх', 'Факультет успішно видалено');
            } catch (error) {
              console.error('Помилка видалення факультету:', error);
              Alert.alert('Помилка', 'Не вдалося видалити факультет');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFaculties();
  };

  const renderFacultyItem = ({ item }) => (
    <View style={styles.facultyItem}>
      {editingFaculty && editingFaculty.id === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editingFaculty.name}
            onChangeText={(text) => setEditingFaculty({ ...editingFaculty, name: text })}
            placeholder="Назва факультету"
          />
          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleUpdateFaculty}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={() => setEditingFaculty(null)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.facultyName}>{item.name}</Text>
          <View style={styles.facultyActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditingFaculty(item)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteFaculty(item)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => navigation.navigate('AdminSpecialties', { facultyId: item.id, facultyName: item.name })}
            >
              <Ionicons name="list" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Управління факультетами</Text>
      </View>

      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newFacultyName}
          onChangeText={setNewFacultyName}
          placeholder="Назва нового факультету"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddFaculty}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Завантаження факультетів...</Text>
        </View>
      ) : (
        <FlatList
          data={faculties}
          renderItem={renderFacultyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Немає факультетів</Text>
              <Text style={styles.emptySubText}>Додайте перший факультет</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    width: 46,
    height: 46,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  listContent: {
    padding: 15,
  },
  facultyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  facultyActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#4285F4',
  },
  deleteButton: {
    backgroundColor: '#EA4335',
  },
  viewButton: {
    backgroundColor: '#FBBC05',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  editButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#34A853',
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#EA4335',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default AdminFacultiesScreen; 